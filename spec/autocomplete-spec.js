'use babel'

import path from 'path'

import { beforeEach, it } from 'jasmine-fix'

import * as main from '../dist/main'
import testData from './autocomplete/json/main.json'

const resolvePath = (filename) =>
  path.resolve(__dirname, 'autocomplete/json', filename)

/**
 * Inserts "<" at `test.splitPoint` or the end of the document
 * and returns the position of that character in the editor buffer.
 */
const prepareEditorBufferForElementSuggestion = (test, editor) => {
  const position = test.splitPoint
    ? editor.getBuffer().positionForCharacterIndex(test.splitPoint)
    : editor.getBuffer().getEndPosition()

  editor.setCursorBufferPosition(position)
  editor.insertText('<')

  return { row: position.row, column: position.column + 1 }
}

/**
 * Inserts " " at the last occurrence of ">" or "/>" before `test.splitPoint`
 * or the end of the document and returns the position of that character
 * in the editor buffer.
 */
const prepareEditorBufferForAttNameSuggestion = (test, editor) => {
  const endPosition = test.splitPoint
    ? editor.getBuffer().positionForCharacterIndex(test.splitPoint)
    : editor.getBuffer().getEndPosition()

  let row = endPosition.row + 1
  let line
  let lastEndDelimiterIndex = -1
  while (lastEndDelimiterIndex === -1 && --row > -1) {
    line = editor.lineTextForBufferRow(row)
    lastEndDelimiterIndex = line.lastIndexOf('>')
    if (lastEndDelimiterIndex > 0 && line[lastEndDelimiterIndex - 1] === '/') {
      --lastEndDelimiterIndex
    }
  }

  editor.setCursorBufferPosition({ row, column: lastEndDelimiterIndex })
  editor.insertText(' ')

  return { row, column: lastEndDelimiterIndex + 1 }
}

/**
 * Returns the position after the start quote of the attribute specified
 * by `test.attName` before `test.splitPoint` or the end of the document.
 */
const getPositionForAttValueSuggestion = (test, editor) => {
  const endPosition = test.splitPoint
    ? editor.getBuffer().positionForCharacterIndex(test.splitPoint)
    : editor.getBuffer().getEndPosition()

  const attName = test.attName.split(' ')[0]
  let row = endPosition.row + 1
  let line
  let lastFragmentIndex = -1
  while (lastFragmentIndex === -1 && --row > -1) {
    line = editor.lineTextForBufferRow(row)
    lastFragmentIndex = line.lastIndexOf(attName + '=')
  }

  return { row, column: lastFragmentIndex + attName.length + 2 }
}

const setupAutocompleteContext = (test, editor) => {
  let bufferPosition
  switch (test.suggestionType) {
    case 'E':
      bufferPosition = prepareEditorBufferForElementSuggestion(test, editor)
      break
    case 'N':
      bufferPosition = prepareEditorBufferForAttNameSuggestion(test, editor)
      break
    case 'V':
      bufferPosition = getPositionForAttValueSuggestion(test, editor)
      break
    default:
      throw new Error(`Unknown suggestion type "${test.suggestionType}"`)
  }

  editor.setCursorBufferPosition(bufferPosition)

  return {
    editor,
    scopeDescriptor: editor.scopeDescriptorForBufferPosition(bufferPosition),
    bufferPosition,
  }
}

const createTestDescription = (test) => {
  const expectedResults = test.expectResult
    .map(({ displayText }) => displayText.replace('#', '[hash]'))
    .join(', ')

  return (
    `suggests [${expectedResults}] when requesting ` +
    `type "${test.suggestionType}" autocomplete ` +
    `in file "${path.basename(test.file)}"` +
    (test.attName ? ` at attribute "${test.attName}"` : '')
  )
}

const runTest = (test) => {
  describe(test.condition || '...', () => {
    let editor = null
    let ctx = null

    beforeEach(async () => {
      await atom.packages.activatePackage('language-xml')
      const activationPromise = atom.packages.activatePackage(
        'linter-autocomplete-jing'
      )

      editor = await atom.workspace.open(resolvePath(test.file))

      atom.packages.triggerDeferredActivationHooks()

      await activationPromise

      ctx = setupAutocompleteContext(test, editor)
    })

    it(createTestDescription(test), async () => {
      const messages = await main.provideAutocomplete().getSuggestions(ctx)

      expect(JSON.stringify(messages, 2, null)).toEqual(
        JSON.stringify(test.expectResult, 2, null)
      )
    })
  })
}

describe('autocomplete', () => {
  let shutdownSpy

  beforeEach(() => {
    // for performance reasons prevent Java server from shutting down after
    // each test
    shutdownSpy = spyOn(main.xmlService, 'shutdown')
  })

  testData.forEach((outerTestGroup) => {
    describe(outerTestGroup.description, () => {
      beforeEach(async () => {
        atom.config.set('linter-autocomplete-jing.wildcardSuggestions', 'all')
        atom.config.set(
          'linter-autocomplete-jing.xmlCatalog',
          resolvePath(outerTestGroup.catalog)
        )
      })

      outerTestGroup.items.forEach((innerTestGroup) => {
        const schemaFiles = innerTestGroup.schemata
          .map(({ path: schemaPath }) =>
            schemaPath ? path.basename(schemaPath) : 'none'
          )
          .join(', ')

        describe(`given schema "${schemaFiles}", `, () => {
          innerTestGroup.items.forEach((test) => {
            runTest(test)
          })
        })
      })
    })
  })

  it('"afterAll()"', () => {
    // shut down Java server after all tests
    shutdownSpy.andCallThrough()
    main.xmlService.shutdown()
  })
})
