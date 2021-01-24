import { ParserConfig, SchemaPropsWithLine } from '../getParserConfig'

export interface AutocompleteConfig {
  autocompletePriority: number
  autocompleteScope: {
    rng: boolean
    rnc: boolean
    xsd: boolean
  }
  wildcardSuggestions: 'none' | 'localparts' | 'all'
}

export interface SuggestionOptions {
  type: 'N' | 'V' | 'E'
  attName?: string
  tagEndDelimiterBufferIndex?: number
}

export const buildValidationRequestHeaders = (
  parserConfig: ParserConfig
): Array<string> => {
  const {
    filePath,
    schemaProps,
    xmlCatalog,
    xIncludeAware,
    xIncludeFixupBaseUris,
    xIncludeFixupLanguage,
  } = parserConfig

  const parserFlags = [
    'r',
    xIncludeAware ? 'x' : '',
    xIncludeFixupBaseUris ? 'f' : '',
    xIncludeFixupLanguage ? 'l' : '',
  ].join('')

  return [
    'V',
    parserFlags,
    'UTF-8',
    filePath ?? '',
    xmlCatalog ?? '',
    ...schemaProps.map((schema) => schema.lang + ' ' + (schema.path || '')),
  ]
}

/**
 * Determines which schema to use to get the Autocomplete suggestions based
 * on the schema information from the document and the user settings in
 * `autocompleteConfig.autocompleteScope`
 */
export const getSchemaForSuggestions = (
  autocompleteConfig: AutocompleteConfig,
  schemaProps: Array<SchemaPropsWithLine>
): SchemaPropsWithLine => {
  const schema = schemaProps.find(({ lang }) => {
    if (lang === 'rng' || lang === 'rnc' || lang === 'xsd') {
      return autocompleteConfig.autocompleteScope[lang]
    }
    return false
  })

  return (
    schema || {
      lang: 'none',
      path: null,
    }
  )
}

const wildcardFlags = {
  none: '',
  localparts: 'w',
  all: 'wn',
}

export const buildAutocompleteRequestHeaders = (
  parserConfig: ParserConfig,
  autocompleteConfig: AutocompleteConfig,
  suggestionOptions: SuggestionOptions
): Array<string | number> => {
  const {
    schemaProps,
    filePath,
    xmlCatalog,
    xIncludeAware,
    xIncludeFixupBaseUris,
    xIncludeFixupLanguage,
  } = parserConfig

  const schema = getSchemaForSuggestions(autocompleteConfig, schemaProps)

  const { type, attName, tagEndDelimiterBufferIndex } = suggestionOptions

  const parserFlags = [
    'r',
    wildcardFlags[autocompleteConfig.wildcardSuggestions],
    xIncludeAware ? 'x' : '',
    xIncludeFixupBaseUris ? 'f' : '',
    xIncludeFixupLanguage ? 'l' : '',
  ].join('')

  return [
    'A',
    type,
    attName || '',
    tagEndDelimiterBufferIndex || '',
    parserFlags,
    'UTF-8',
    filePath ?? 'undefined',
    xmlCatalog || '',
    schema.lang + ' ' + (schema.path || ''),
  ]
}
