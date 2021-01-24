import { ParserConfig } from '../getParserConfig'
import { AutocompleteConfig } from '../xmlService/util'
import XmlService, { RawSuggestion } from '../xmlService/XmlService'
import {
  AutocompleteContext,
  Suggestion,
  createAttributeSuggestionTexts,
  nextTagDelimiterIsEndDelimiter,
} from './util'

/**
 * Creates an autocomplete Suggestion for an element start tag.
 */
const createStartTagSuggestion = (
  rawSuggestion: RawSuggestion,
  markupFragmentPrecedingCursor: string,
  suggestOnlyTagName: boolean
): Suggestion => {
  const { value, empty, attributes = [], documentation } = rawSuggestion

  // `value` is and element name ([localname] or [prefix]:[localpart]),
  // optionally followed by "#" and the namespace of the element. Both element
  // name and namespace parts may contain wildcard characters "*" which get
  // converted into tabstop markers
  const [tagName, nsUri] = value.split('#')

  // the current tabstop marker ID. Each tabstop marker added to the suggestion
  // snippet gets the ID of the previous `tabstopMarkerId` incremented by 1
  let tabstopMarkerId = 0

  // replace wildcards in the tag name with tabstop markers
  const tagNameSnippet = tagName.replace(
    /\*/g,
    () => `\${${++tabstopMarkerId}}`
  )

  if (suggestOnlyTagName) {
    return {
      snippet: tagNameSnippet,
      displayText: tagName,
      type: 'tag',
      replacementPrefix: markupFragmentPrecedingCursor,
      description: documentation ? documentation.join('\n') : undefined,
      retrigger: false,
    }
  }

  const hasTabstopMarkerInTagName = tabstopMarkerId > 0

  let displayText
  let nsSnippet: Array<string> | undefined

  if (typeof nsUri === 'string') {
    // replace wildcard in `nsUri` with tabstop marker
    const nsUriSnippet = nsUri === '*' ? `\${${++tabstopMarkerId}}` : nsUri

    nsSnippet = [`xmlns="${nsUriSnippet}"`]
    displayText =
      nsUri === '' ? `${tagName} [no namespace]` : `${tagName} (${nsUri})`
  } else {
    nsSnippet = []
    displayText = tagName
  }

  const attributeSnippets = attributes.map((attribute) => {
    const {
      snippet: attributeSnippet,
      tabstopMarkerId: newTabstopMarkerId,
    } = createAttributeSuggestionTexts(attribute, tabstopMarkerId, true)
    tabstopMarkerId = newTabstopMarkerId
    return attributeSnippet
  })

  const startTagContent = [tagNameSnippet]
    .concat(nsSnippet)
    .concat(attributeSnippets)
    .join(' ')

  const snippet = empty
    ? startTagContent + '/>'
    : `${startTagContent}>\${${++tabstopMarkerId}}</${tagNameSnippet}>`

  // only retrigger autocomplete when there are tabstop markers and the
  // first tabstop marker is not located in the tag name
  const retrigger = tabstopMarkerId > 0 && !hasTabstopMarkerInTagName

  return {
    snippet,
    displayText,
    type: 'tag',
    replacementPrefix: markupFragmentPrecedingCursor,
    description: documentation ? documentation.join('\n') : undefined,
    retrigger,
  }
}

/**
 * Creates an autocomplete Suggestion for an element end tag.
 */
const createEndTagSuggestion = (
  rawSuggestion: RawSuggestion,
  markupFragmentPrecedingCursor: string,
  suggestOnlyTagName: boolean
): Suggestion => {
  const { value } = rawSuggestion
  const snippet = suggestOnlyTagName ? `/${value}` : `/${value}>`

  return {
    snippet,
    displayText: snippet,
    type: 'tag',
    replacementPrefix: markupFragmentPrecedingCursor,
    description: 'Element End Tag',
    retrigger: false,
  }
}

interface StaticRawSuggestion {
  value: string
  snippet: string
  description: string
}

/**
 * Creates an autocomplete Suggestion for statically defined markup
 * suggestions.
 */
const createStaticMarkupSuggestion = (
  rawSuggestion: StaticRawSuggestion,
  markupFragmentPrecedingCursor: string
): Suggestion => {
  const { value, snippet, description } = rawSuggestion

  return {
    snippet,
    displayText: value,
    type: 'tag',
    replacementPrefix: markupFragmentPrecedingCursor,
    description,
    retrigger: false,
  }
}

/**
 * Suggestion data to be added statically to the data received from the Java
 * server, given that the markup start fragment preceding the cursor matches
 * the `value`.
 */
const rawStaticMarkupSuggestions: Array<StaticRawSuggestion> = [
  {
    value: '!--  -->',
    snippet: '!-- ${1} -->', // eslint-disable-line no-template-curly-in-string
    description: 'Comment',
  },
  {
    value: '![CDATA[]]>',
    snippet: '![CDATA[${1}]]>', // eslint-disable-line no-template-curly-in-string
    description: 'CDATA Section',
  },
]

/**
 * Creates markup suggestions for autocomplete from RawSuggestion objects
 * received from the Java server and static markup suggestions.
 */
const createMarkupSuggestions = (
  rawSuggestions: Array<RawSuggestion>,
  markupFragmentPrecedingCursor: string,
  suggestOnlyTagName: boolean
): Array<Suggestion> => {
  return rawSuggestions
    .concat(rawStaticMarkupSuggestions)
    .filter((rawSuggestions: RawSuggestion | StaticRawSuggestion): boolean => {
      // exclude suggestions that don't match the markup start fragment

      const valueToMatch =
        'closing' in rawSuggestions && rawSuggestions.closing
          ? '/' + rawSuggestions.value
          : rawSuggestions.value

      return valueToMatch.startsWith(markupFragmentPrecedingCursor)
    })
    .map(
      (rawSuggestions: RawSuggestion | StaticRawSuggestion): Suggestion => {
        if ('snippet' in rawSuggestions) {
          // the `snippet` property is only set on static markup suggestions
          return createStaticMarkupSuggestion(
            rawSuggestions,
            markupFragmentPrecedingCursor
          )
        }

        if (rawSuggestions.closing) {
          // suggest end tag
          return createEndTagSuggestion(
            rawSuggestions,
            markupFragmentPrecedingCursor,
            suggestOnlyTagName
          )
        }

        // suggest start tag
        return createStartTagSuggestion(
          rawSuggestions,
          markupFragmentPrecedingCursor,
          suggestOnlyTagName
        )
      }
    )
}

/**
 * Returns suggestions following a markup start fragment: element tags,
 * comments and CDATA section markup.
 */
const getMarkupSuggestions = async (
  ctx: AutocompleteContext,
  autocompleteConfig: AutocompleteConfig,
  parserConfig: ParserConfig,
  xmlService: XmlService,
  markupFragmentPrecedingCursor: string
) => {
  const { editor, bufferPosition } = ctx

  // get all text preceding the current markup fragment from the XML document
  // for parsing in Java
  const body = editor.getTextInBufferRange([
    [0, 0],
    [
      bufferPosition.row,
      // we need to subtract 1 from `markupFragmentPrecedingCursor.length` since
      // `markupFragmentPrecedingCursor` doesn't include the initial '<'
      bufferPosition.column - markupFragmentPrecedingCursor.length - 1,
    ],
  ])

  // get raw suggestions from the Java server
  const rawSuggestions = await xmlService.requestAutocompleteSuggestions(
    parserConfig,
    autocompleteConfig,
    {
      type: 'E',
    },
    body
  )

  // when the cursor is followed by a tag end delimiter,
  // only the name of an element tag should get suggested
  const suggestOnlyTagName = nextTagDelimiterIsEndDelimiter(ctx)

  return createMarkupSuggestions(
    rawSuggestions,
    markupFragmentPrecedingCursor,
    suggestOnlyTagName
  )
}

export default getMarkupSuggestions
