import { ParserConfig } from '../getParserConfig'
import { AutocompleteConfig } from '../xmlService/util'
import XmlService, { RawSuggestion } from '../xmlService/XmlService'
import {
  AutocompleteContext,
  Suggestion,
  createAttributeSuggestionTexts,
  getNextTagEndDelimiterPosition,
} from './util'
import { nameChar, nameStartChar } from './xmlChar'

const trailingAttNameStartRegex = new RegExp(
  `[${nameStartChar}][${nameChar}]*$`
)
const leadingAttributeRegex = new RegExp('^[' + nameChar + ']*=(".*?"|\'.*?\')')

/**
 * Returns the attribute name fragment at the end of `str` or '' if there
 * is no match.
 */
const getTrailingAttNameFragment = (str: string) => {
  const match = str.match(trailingAttNameStartRegex)
  return match ? match[0] : ''
}

/**
 * Creates attribute name suggestions for autocomplete from RawSuggestion objects.
 */
const createAttributeNameSuggestions = (
  rawSuggestions: Array<RawSuggestion>,
  attNameFragmentPrecedingCursor: string,
  suggestAttributeValue: boolean
): Array<Suggestion> => {
  return rawSuggestions
    .filter((rawSuggestion: RawSuggestion) => {
      // exclude suggestions that don't match `attNameFragmentPrecedingCursor`

      return rawSuggestion.value.startsWith(attNameFragmentPrecedingCursor)
    })
    .map((rawSuggestion: RawSuggestion) => {
      const { value, documentation } = rawSuggestion

      const { snippet, displayText } = createAttributeSuggestionTexts(
        value,
        0,
        suggestAttributeValue
      )

      return {
        snippet,
        displayText,
        type: 'attribute',
        replacementPrefix: attNameFragmentPrecedingCursor,
        description: documentation ? documentation.join('\n') : undefined,
        retrigger: suggestAttributeValue,
      }
    })
}

/**
 * Returns attribute name suggestions.
 */
const getAttributeNameSuggestions = async (
  ctx: AutocompleteContext,
  autocompleteConfig: AutocompleteConfig,
  parserConfig: ParserConfig,
  xmlService: XmlService,
  textPrecedingCursorInSameLine: string
) => {
  const { editor, bufferPosition } = ctx

  const attNameFragmentPrecedingCursor = getTrailingAttNameFragment(
    textPrecedingCursorInSameLine
  )

  const tagEndDelimiterPosition = getNextTagEndDelimiterPosition(ctx)

  // don't suggest attribute names when the current tag doesn't have an end
  // delimiter
  if (!tagEndDelimiterPosition) return []

  // The document text we're sending to the Java server is composed of all text
  // preceding the current attribute and all text between the end of the
  // current attribute and the end of the current element start tag. Thus, all
  // other attributes of the element get sent to the Java server. This is to
  // make sure that all namespaces declared in the element can be processed on
  // the server and it further allows the server to exclude suggestions of
  // attributes that already exist.

  const documentTextPrecedingAttNameFragment = editor.getTextInBufferRange([
    [0, 0],
    [
      bufferPosition.row,
      bufferPosition.column - attNameFragmentPrecedingCursor.length,
    ],
  ])

  const documentTextFromCursorToTagEndDelimiter = editor.getTextInBufferRange([
    bufferPosition,
    tagEndDelimiterPosition,
  ])

  // exclude current attribute from `documentTextFromCursorToTagEndDelimiter`
  const leadingAttributeMatch = documentTextFromCursorToTagEndDelimiter.match(
    leadingAttributeRegex
  )
  const documentTextFromAttEndToTagEndDelimiter = leadingAttributeMatch
    ? documentTextFromCursorToTagEndDelimiter.substr(
        leadingAttributeMatch[0].length
      )
    : documentTextFromCursorToTagEndDelimiter

  // when the current attribute name is already followed by an attribute
  // value in the current XML document, autocomplete should only insert the
  // attribute name
  const suggestAttributeValue = !leadingAttributeMatch

  const body =
    documentTextPrecedingAttNameFragment +
    documentTextFromAttEndToTagEndDelimiter

  // get raw suggestions from the Java server
  const rawSuggestions = await xmlService.requestAutocompleteSuggestions(
    parserConfig,
    autocompleteConfig,
    {
      type: 'N',
    },
    body
  )

  return createAttributeNameSuggestions(
    rawSuggestions,
    attNameFragmentPrecedingCursor,
    suggestAttributeValue
  )
}

export default getAttributeNameSuggestions
