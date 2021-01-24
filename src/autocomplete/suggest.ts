import { ParserConfig } from '../getParserConfig'
import { AutocompleteConfig } from '../xmlService/util'
import XmlService from '../xmlService/XmlService'
import getAttributeNameSuggestions from './getAttributeNameSuggestions'
import getAttributeValueSuggestions from './getAttributeValueSuggestions'
import getMarkupSuggestions from './getMarkupSuggestions'
import {
  AutocompleteContext,
  precedingTagDelimiterIsStartTagStartDelimiter,
} from './util'
import { nameChar, nameStartChar } from './xmlChar'

/**
 * Returns the text preceding the cursor in the same line.
 */
const getTextPrecedingCursorInSameLine = ({
  editor,
  bufferPosition,
}: AutocompleteContext) =>
  editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition])

const trailingMarkupRegex = new RegExp(
  `<(!|/|/?[${nameStartChar}][${nameChar}]*)?$`
)

/**
 * Returns the substring at the end of `str` following a '<' and matching
 * '', '!', '/', '[tag chars]' or '/[tag chars]'.
 * Returns null if there's no match.
 */
const getTrailingMarkupFragment = (str: string) => {
  const match = str.match(trailingMarkupRegex)
  return match ? match[1] || '' : null
}

/**
 * Checks whether the provided scopes include a tag scope.
 */
const hasTagScope = (scopes: readonly string[]) =>
  scopes.some(
    (item) =>
      item.startsWith('meta.tag.xml') || item === 'meta.tag.no-content.xml'
  )

/**
 * Returns the 'quoted string' scope from the provided scopes. If no such scope
 * exists, returns `undefined`.
 */
const getQuotedScope = (scopes: readonly string[]) =>
  scopes.find(
    (scope) =>
      scope === 'string.quoted.double.xml' ||
      scope === 'string.quoted.single.xml'
  )

/**
 * Requests suggestions for the current XML document at the current cursor
 * position from the XMLService and transforms the response into autocomplete
 * suggestions.
 */
const suggest = (
  ctx: AutocompleteContext,
  autocompleteConfig: AutocompleteConfig,
  parserConfig: ParserConfig,
  xmlService: XmlService
) => {
  const textPrecedingCursorInSameLine = getTextPrecedingCursorInSameLine(ctx)

  const markupFragmentPrecedingCursor = getTrailingMarkupFragment(
    textPrecedingCursorInSameLine
  )
  if (markupFragmentPrecedingCursor !== null) {
    // cursor is preceded by a markup start fragment -> suggest markup
    return getMarkupSuggestions(
      ctx,
      autocompleteConfig,
      parserConfig,
      xmlService,
      markupFragmentPrecedingCursor
    )
  }

  // get the scopes at the cursor position
  const scopes = ctx.scopeDescriptor.getScopesArray()

  if (hasTagScope(scopes)) {
    // cursor is within element tag

    const quotedScope = getQuotedScope(scopes)
    if (quotedScope) {
      // cursor is in attribute value literal -> suggest attribute value

      const hasDblQuotes = quotedScope === 'string.quoted.double.xml'

      return getAttributeValueSuggestions(
        ctx,
        autocompleteConfig,
        parserConfig,
        xmlService,
        hasDblQuotes
      )
    }

    if (precedingTagDelimiterIsStartTagStartDelimiter(ctx)) {
      // cursor is within element start tag -> suggest attribute name
      return getAttributeNameSuggestions(
        ctx,
        autocompleteConfig,
        parserConfig,
        xmlService,
        textPrecedingCursorInSameLine
      )
    }
  }

  return Promise.resolve([])
}

export default suggest
