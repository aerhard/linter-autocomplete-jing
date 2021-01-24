import { Point, ScopeDescriptor, TextEditor } from 'atom'

export interface AutocompleteContext {
  editor: TextEditor
  bufferPosition: Point
  scopeDescriptor: ScopeDescriptor
  prefix: string
  activatedManually: boolean
}

export interface Suggestion {
  snippet: string
  displayText: string
  type: 'attribute' | 'value' | 'tag'
  rightLabel?: string
  replacementPrefix: string
  description?: string
  retrigger?: boolean
}

const precedingAttValueOrTagDelimiterRegex = /"[^<]*?"|'[^<]*?'|<\/|<|>/g

/**
 * Returns `true` if the first tag delimiter preceding the cursor in the current
 * XML document is a start tag start delimiter ("<") rather than an end tag
 * start delimiter ("</") or an end delimiter (">" / "/>").
 * Occurrences within attribute values are ignored.
 */
export const precedingTagDelimiterIsStartTagStartDelimiter = ({
  editor,
  bufferPosition,
}: AutocompleteContext): boolean => {
  let result = false

  editor.backwardsScanInBufferRange(
    precedingAttValueOrTagDelimiterRegex,
    [bufferPosition, [0, 0]],
    ({ matchText, stop }) => {
      if (matchText.startsWith("'") || matchText.startsWith('"')) {
        // matched attribute value: continue scanning
        return
      }

      if (matchText === '<') {
        result = true
      }
      stop()
    }
  )

  return result
}

const nextAttValueOrTagDelimiterRegex = /"[^<]*?"|'[^<]*?'|<|\/>|>/g

/**
 * Returns the position of the next tag end delimiter (">" or "/>") following
 * the cursor in the current XML document, skipping occurrences within attribute
 * values.
 * Returns null if there's no match or a tag start delimiter "<" is encountered.
 */
export const getNextTagEndDelimiterPosition = ({
  editor,
  bufferPosition,
}: AutocompleteContext): Point | null => {
  let position = null

  editor.scanInBufferRange(
    nextAttValueOrTagDelimiterRegex,
    [bufferPosition, editor.getBuffer().getEndPosition()],
    ({ matchText, range, stop }) => {
      if (matchText.startsWith("'") || matchText.startsWith('"')) {
        // matched attribute value: continue scanning
        return
      }

      if (matchText !== '<') {
        // matched end delimiter (">" or "/>"): assign position
        position = [range.start.row, range.start.column + matchText.length]
      }

      stop()
    }
  )

  return position
}

/**
 * Determines whether the next tag delimiter following the cursor in the current
 *  XML document is an end delimiter (">" / "/>"). Occurrences within attribute
 * values are ignored.
 */
export const nextTagDelimiterIsEndDelimiter = (
  ctx: AutocompleteContext
): boolean => {
  return !!getNextTagEndDelimiterPosition(ctx)
}

/**
 * Creates attribute strings to be used in the `snippet` and `displayText`
 * properties of an autocomplete suggestion.
 * @param attNameWithNs An attribute name ([localname] or [prefix]:[localpart]),
 * optionally followed by "#" and the namespace of the attribute. Both attribute
 * name and namespace parts may contain wildcard characters "*" which get
 * converted into tabstop markers.
 * @param tabstopMarkerId The current tabstop marker ID. Each tabstop marker
 * added to the snippet gets the ID of the previous `tabstopMarkerId`
 * incremented by 1.
 * @param suggestAttributeValue Whether or not to include the attribute value
 * literal in the suggestion.
 */
export const createAttributeSuggestionTexts = (
  attNameWithNs: string,
  tabstopMarkerId: number,
  suggestAttributeValue: boolean
) => {
  const [qName, nsUri] = attNameWithNs.split('#')

  if (typeof nsUri === 'string') {
    const nsPrefix = `ns\${${++tabstopMarkerId}}`

    // replace wildcards in the attribute name with tabstop markers
    const attNameSnippet = qName.replace(
      /\*/g,
      () => `\${${++tabstopMarkerId}}`
    )

    // replace wildcard in `nsUri` with tabstop marker
    const nsUriSnippet = nsUri === '*' ? `\${${++tabstopMarkerId}}` : nsUri

    // create optional attribute value fragment
    const attValueSnippet = suggestAttributeValue
      ? `="\${${++tabstopMarkerId}}"`
      : ''

    return {
      snippet: `${nsPrefix}:${attNameSnippet}${attValueSnippet} xmlns:${nsPrefix}="${nsUriSnippet}"`,
      displayText:
        nsUri === '' ? `${qName} [no namespace]` : `${qName} (${nsUri})`,
      tabstopMarkerId,
    }
  }

  // replace wildcards in the tag name with tabstop markers
  const attNameSnippet = qName.replace(/\*/g, () => `\${${++tabstopMarkerId}}`)

  // create optional attribute value fragment
  const attValueSnippet = suggestAttributeValue
    ? `="\${${++tabstopMarkerId}}"`
    : ''

  return {
    snippet: `${attNameSnippet}${attValueSnippet}`,
    displayText: qName,
    tabstopMarkerId,
  }
}
