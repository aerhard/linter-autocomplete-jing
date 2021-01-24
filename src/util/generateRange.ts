import { PointCompatible, TextEditor } from 'atom'

export type RangeCompatible = [[number, number], [number, number]]

// literal copy of https://github.com/steelbrain/atom-linter/blob/master/src/helpers.js#L15-L18
function escapeRegexp(string: string): string {
  // Shamelessly stolen from https://github.com/atom/underscore-plus/blob/130913c179fe1d718a14034f4818adaf8da4db12/src/underscore-plus.coffee#L138
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

// literal copy of https://github.com/steelbrain/atom-linter/blob/master/src/helpers.js#L20-L30
function getWordRegexp(
  textEditor: TextEditor,
  bufferPosition: PointCompatible
) {
  const scopeDescriptor = textEditor.scopeDescriptorForBufferPosition(
    bufferPosition
  )
  const nonWordCharacters = escapeRegexp(
    atom.config.get('editor.nonWordCharacters', {
      scope: scopeDescriptor,
    })
  )
  return new RegExp(`^[\t ]*$|[^\\s${nonWordCharacters}]+`)
}

// literal copy of https://github.com/steelbrain/atom-linter/blob/master/src/helpers.js#L20-L30
function validateEditor(editor: TextEditor) {
  let isEditor
  if (typeof atom.workspace.isTextEditor === 'function') {
    // Added in Atom v1.4.0
    isEditor = atom.workspace.isTextEditor(editor)
  } else {
    isEditor = typeof editor.getText === 'function'
  }
  if (!isEditor) {
    throw new Error('Invalid TextEditor provided')
  }
}

// modified copy of https://github.com/steelbrain/atom-linter/blob/master/src/helpers.js#L20-L30
function generateRange(textEditor: TextEditor, line?: number): RangeCompatible {
  validateEditor(textEditor)
  let lineNumber = line

  if (
    typeof lineNumber !== 'number' ||
    !Number.isFinite(lineNumber) ||
    lineNumber < 0
  ) {
    lineNumber = 0
  }

  const buffer = textEditor.getBuffer()
  const lineMax = buffer.getLineCount() - 1

  if (lineNumber > lineMax) {
    throw new Error(
      `Line number (${lineNumber}) greater than maximum line (${lineMax})`
    )
  }

  const columnGiven = false
  const lineText = buffer.lineForRow(lineNumber) ?? ''
  let colEnd = lineText.length
  let colStart = 0
  if (columnGiven) {
    const match = getWordRegexp(textEditor, [lineNumber, colStart]).exec(
      lineText
    )
    if (match) {
      colEnd = colStart + match.index + match[0].length
    }
  } else {
    const indentation = lineText.match(/^\s+/)
    if (indentation) {
      colStart = indentation[0].length
    }
  }
  if (colStart > lineText.length) {
    throw new Error(
      `Column start (${colStart || 0}) greater than line length (${
        lineText.length
      }) for line ${lineNumber}`
    )
  }

  return [
    [lineNumber, colStart],
    [lineNumber, colEnd],
  ]
}

export default generateRange
