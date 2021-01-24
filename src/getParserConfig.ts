import path from 'path'

import { TextEditor } from 'atom'
import sax from 'sax'

import RuleStore, {
  Attributes,
  DocumentProps,
  SchemaLang,
} from './rules/RuleStore'
import generateRange, { RangeCompatible } from './util/generateRange'

export interface DefaultParserConfig {
  xmlCatalog: string
  dtdValidation: 'never' | 'always' | 'fallback'
  xIncludeAware: boolean
  xIncludeFixupBaseUris: boolean
  xIncludeFixupLanguage: boolean
}

export interface SchemaPropsWithLine {
  lang: SchemaLang
  path: string | null
  lineOfReference?: number
}

/**
 * Request-specific parser settings to be passed to the Java server.
 */
export interface ParserConfig {
  filePath?: string
  schemaProps: Array<SchemaPropsWithLine>
  xmlCatalog: string
  xIncludeAware: boolean
  xIncludeFixupBaseUris: boolean
  xIncludeFixupLanguage: boolean
}

export interface LinterMessage {
  severity: 'warning' | 'error'
  excerpt: string
  location: {
    file?: string
    position: RangeCompatible
  }
}

const urlRegex = /^(?:[a-z][a-z0-9+\-.]*:)?\/\//i

// the sax module eliminates linebreak characters in DOCTYPE so we need to
// match `\s*` instead of `\s+`
const publicIdRegex = /\s*[^\s]+\s*PUBLIC\s*("([^"]+)"|'([^']+)')/

/**
 * Extracts pseudo attributes from the data string of a processing instruction.
 */
const getPseudoAttsFromPIData = (piData: string) => {
  const pseudoAtts: Attributes = {}
  piData.replace(/(\w+)="(.+?)"/g, (_, key, value) => (pseudoAtts[key] = value))
  return pseudoAtts
}

const getXsiNamespacePrefixes = (attributes: Attributes) => {
  const prefixes: Array<string> = []
  Object.keys(attributes).forEach((key) => {
    const match = key.match(/xmlns:(.*)/)
    if (
      match &&
      attributes[key] === 'http://www.w3.org/2001/XMLSchema-instance'
    ) {
      prefixes.push(match[1])
    }
  })
  return prefixes
}

const isOddNumber = (n: number) => !!(n % 2)

/**
 * Splits a QName into prefix and localpart.
 */
const splitQName = (qName: string): [prefix: string, localpart: string] => {
  const colonIndex = qName.indexOf(':')
  return [qName.substr(0, colonIndex), qName.substr(colonIndex + 1)]
}

/**
 * Gets the configuration settings to be used by the Java parser such as parser
 * flags, schema and catalog information by pre-parsing the start of the
 * document and then adjusting the results with the `RuleOutcome` applying to
 * to the document.
 */
const getParserConfig = (
  textEditor: TextEditor,
  ruleStore: RuleStore,
  defaults: DefaultParserConfig
): {
  xmlModelWarnings: Array<LinterMessage>
  parserConfig: ParserConfig
} => {
  const filePath = textEditor.getPath()
  const baseUri = filePath ? path.dirname(filePath) : __dirname

  const xmlModelWarnings: Array<LinterMessage> = []
  const schemaProps: Array<SchemaPropsWithLine> = []
  const xsdSchemaPaths: Array<string> = []
  const saxParser = sax.parser(true)

  let row = 0
  let done = false
  let hasDoctype = false
  let rootNs
  let rootLocalName
  let rootAttributes = {}
  let publicId

  const addXsdSchemaPath = (href?: string) =>
    href &&
    xsdSchemaPaths.push(
      urlRegex.test(href) ? href : path.resolve(baseUri, href)
    )

  saxParser.onerror = () => (done = true)

  saxParser.ondoctype = (str) => {
    hasDoctype = true
    const match = str.match(publicIdRegex)
    if (match) {
      publicId = match[2] || match[3]
    }
  }

  saxParser.onprocessinginstruction = (node: {
    name: string
    body: string
  }) => {
    if (node.name !== 'xml-model') return

    const { href, type, schematypens } = getPseudoAttsFromPIData(node.body)

    let lang: SchemaLang | null = null
    if (href) {
      if (type === 'application/relax-ng-compact-syntax') {
        lang = 'rnc'
      } else if (schematypens === 'http://relaxng.org/ns/structure/1.0') {
        lang = path.extname(href) === '.rnc' ? 'rnc' : 'rng'
      } else if (schematypens === 'http://purl.oclc.org/dsdl/schematron') {
        lang = 'sch.iso'
      } else if (schematypens === 'http://www.ascc.net/xml/schematron') {
        lang = 'sch.15'
      } else if (schematypens === 'http://www.w3.org/2001/XMLSchema') {
        addXsdSchemaPath(href)
      } else {
        xmlModelWarnings.push({
          severity: 'warning',
          excerpt: 'Unknown schema type',
          location: {
            file: filePath,
            position: generateRange(textEditor, row),
          },
        })
      }
    }

    if (lang) {
      schemaProps.push({
        lang,
        lineOfReference: row,
        path: urlRegex.test(href) ? href : path.resolve(baseUri, href),
      })
    }
  }

  saxParser.onopentag = (node: sax.Tag) => {
    if (done) return

    const [rootNsPrefix, localName] = splitQName(node.name)
    rootNs = rootNsPrefix
      ? node.attributes['xmlns:' + rootNsPrefix]
      : node.attributes.xmlns
    rootLocalName = localName
    rootAttributes = node.attributes

    getXsiNamespacePrefixes(node.attributes).forEach((prefix) => {
      const noNamespaceSchemaLocation =
        node.attributes[prefix + ':noNamespaceSchemaLocation']
      if (noNamespaceSchemaLocation) {
        addXsdSchemaPath(noNamespaceSchemaLocation.trim())
      }

      const schemaLocation = node.attributes[prefix + ':schemaLocation']
      if (schemaLocation) {
        schemaLocation
          .trim()
          .split(/[ \t\r\n]+/)
          // the value of `schemaLocation` is a sequence of `[ns] [uri]` pairs
          // but we only need the URIs
          .filter((_: string, index: number) => isOddNumber(index))
          .forEach(addXsdSchemaPath)
      }
    })

    done = true
  }

  const textBuffer = textEditor.getBuffer()
  const lineCount = textBuffer.getLineCount()
  const chunkSize = 64

  while (!done && row < lineCount) {
    const line = textBuffer.lineForRow(row) || ''
    const lineLength = line.length
    let column = 0
    while (!done && column < lineLength) {
      saxParser.write(line.substr(column, chunkSize))
      column += chunkSize
    }
    row++
  }

  if (xsdSchemaPaths.length) {
    schemaProps.push({
      lang: 'xsd',
      path: xsdSchemaPaths.join('*'),
    })
  }

  const docProps: DocumentProps = {
    rootScopes: textEditor.getRootScopeDescriptor().getScopesArray(),
    filePath,
    rootNs,
    rootLocalName,
    rootAttributes,
    publicId,
  }

  const ruleOutcome = ruleStore.getMatchingOutcome(docProps)

  const xmlCatalog = ruleOutcome?.xmlCatalog ?? defaults.xmlCatalog
  const dtdValidation =
    ruleOutcome?.dtdValidation ?? defaults.dtdValidation
  const xIncludeAware =
    ruleOutcome?.xIncludeAware ?? defaults.xIncludeAware
  const xIncludeFixupBaseUris =
    ruleOutcome?.xIncludeFixupBaseUris ?? defaults.xIncludeFixupBaseUris
  const xIncludeFixupLanguage =
    ruleOutcome?.xIncludeFixupLanguage ?? defaults.xIncludeFixupLanguage

  // `schemaProps` from rules should only apply when there are no schema hints
  // in the current document
  if (!schemaProps.length && ruleOutcome?.schemaProps) {
    schemaProps.push(...ruleOutcome.schemaProps)
  }

  // add DTD validation depending on the `dtdValidation` user setting
  if (
    hasDoctype &&
    (dtdValidation === 'always' ||
      (dtdValidation === 'fallback' && !schemaProps.length))
  ) {
    schemaProps.push({
      lang: 'dtd',
      path: null,
      lineOfReference: saxParser.line,
    })
  }

  if (!schemaProps.length) {
    schemaProps.push({
      lang: 'none',
      path: null,
    })
  }

  return {
    xmlModelWarnings,

    parserConfig: {
      filePath,
      schemaProps,
      xmlCatalog,
      xIncludeAware,
      xIncludeFixupBaseUris,
      xIncludeFixupLanguage,
    },
  }
}

export default getParserConfig
