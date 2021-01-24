import { Point, TextEditor } from 'atom'

import { ParserConfig } from '../getParserConfig'
import { AutocompleteConfig } from '../xmlService/util'
import XmlService, { RawSuggestion } from '../xmlService/XmlService'
import {
  AutocompleteContext,
  Suggestion,
  getNextTagEndDelimiterPosition,
} from './util'
import { nameChar, nameStartChar, spaceChar } from './xmlChar'

const trailingTokenRegex = new RegExp(`[^${spaceChar}]+$`)

/**
 * Returns the sequence of non-space characters at the end of `str` or, if
 * there is no such sequence, the empty string.
 */
const getTrailingToken = (str: string) => {
  const match = str.match(trailingTokenRegex)
  return match ? match[0] : ''
}

/**
 * Returns the byte index at `position` in the `editor`'s buffer.
 */
const getBufferIndex = (editor: TextEditor, position: Point) => {
  const documentTextPrecedingPosition = editor.getTextInBufferRange([
    [0, 0],
    position,
  ])
  return Buffer.byteLength(documentTextPrecedingPosition)
}

const attNameAndValueDoubleQuoteRegex = new RegExp(
  `([${nameStartChar}][${nameChar}]*)="([^"]*)`
)
const attNameAndValueSingleQuoteRegex = new RegExp(
  `([${nameStartChar}][${nameChar}]*)='([^']*)`
)

/**
 * Returns the attribute name and attribute value fragment preceding
 * the cursor or null if there's no match.
 */
const getAttributeNameAndValuePrecedingCursor = (
  { editor, bufferPosition }: AutocompleteContext,
  hasDblQuotes: boolean
): { name: string; valueFragmentPrecedingCursor: string } | null => {
  const regex = hasDblQuotes
    ? attNameAndValueDoubleQuoteRegex
    : attNameAndValueSingleQuoteRegex

  let result

  editor.backwardsScanInBufferRange(
    regex,
    [bufferPosition, [0, 0]],
    ({ match, stop }) => {
      result = match
      stop()
    }
  )

  return result
    ? { name: result[1], valueFragmentPrecedingCursor: result[2] }
    : null
}

const singleQuoteAttValueReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  "'": '&apos;',
}

const doubleQuoteAttValueReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  '"': '&quot;',
}

/**
 * Returns a function that replaces all substrings of `str` matching a key of
 * `replacements` with the corresponding value `replacements[key]`.
 */
const escape = (replacements: { [key: string]: string }) => {
  const regex = new RegExp(Object.keys(replacements).join('|'), 'g')

  return (str: string) => str.replace(regex, (match) => replacements[match])
}

const escapeWithSingleQuotes = escape(singleQuoteAttValueReplacements)
const escapeWithDblQuotes = escape(doubleQuoteAttValueReplacements)

/**
 * Creates attribute value suggestions for autocomplete from RawSuggestion
 * objects.
 */
const createAttributeValueSuggestions = (
  rawSuggestions: Array<RawSuggestion>,
  valueFragmentPrecedingCursor: string,
  hasDblQuotes: boolean
): Array<Suggestion> => {
  const trailingTokenInValueFragment = getTrailingToken(
    valueFragmentPrecedingCursor
  )

  return rawSuggestions
    .filter((rawSuggestion: RawSuggestion) => {
      // exclude suggestions that don't match the prefix

      const { value, listItem } = rawSuggestion

      return value.startsWith(
        listItem ? trailingTokenInValueFragment : valueFragmentPrecedingCursor
      )
    })
    .map(
      (rawSuggestion: RawSuggestion): Suggestion => {
        const { value, documentation, listItem } = rawSuggestion
        return {
          snippet: hasDblQuotes
            ? escapeWithDblQuotes(value)
            : escapeWithSingleQuotes(value),
          displayText: value,
          type: 'value',
          rightLabel: listItem ? 'List Item' : undefined,
          replacementPrefix: listItem
            ? trailingTokenInValueFragment
            : valueFragmentPrecedingCursor,
          description: documentation ? documentation.join('\n') : undefined,
        }
      }
    )
}

/**
 * Returns suggestions for the value of an attribute.
 */
const getAttributeValueSuggestions = async (
  ctx: AutocompleteContext,
  autocompleteConfig: AutocompleteConfig,
  parserConfig: ParserConfig,
  xmlService: XmlService,
  hasDblQuotes: boolean
) => {
  const { editor } = ctx

  const currentAttribute = getAttributeNameAndValuePrecedingCursor(
    ctx,
    hasDblQuotes
  )

  if (!currentAttribute) return []

  const tagEndDelimiterPosition = getNextTagEndDelimiterPosition(ctx)

  // don't suggest attribute values when the current tag doesn't have an end
  // delimiter
  if (!tagEndDelimiterPosition) return []

  const body = editor.getText()

  // get raw suggestions from the Java server
  const rawSuggestions = await xmlService.requestAutocompleteSuggestions(
    parserConfig,
    autocompleteConfig,
    {
      type: 'V',
      attName: currentAttribute.name,
      tagEndDelimiterBufferIndex: getBufferIndex(
        editor,
        tagEndDelimiterPosition
      ),
    },
    body
  )

  return createAttributeValueSuggestions(
    rawSuggestions,
    currentAttribute.valueFragmentPrecedingCursor,
    hasDblQuotes
  )
}

export default getAttributeValueSuggestions
