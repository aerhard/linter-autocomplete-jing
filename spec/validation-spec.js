'use babel'

import path from 'path'

import { beforeEach, it } from 'jasmine-fix'

import * as main from '../dist/main'
import testData from './validation/json/main.json'

const resolvePath = (filename) =>
  path.resolve(__dirname, 'validation/json', filename)

const runTest = (test) => {
  describe(test.condition || '...', () => {
    let editor = null
    const linterProvider = main.provideLinter()
    const { lint } = linterProvider

    beforeEach(async () => {
      const activationPromise = atom.packages.activatePackage(
        'linter-autocomplete-jing'
      )

      editor = await atom.workspace.open(resolvePath(test.file))

      atom.packages.triggerDeferredActivationHooks()

      await activationPromise
    })

    it(test.expectation, async () => {
      const messages = await lint(editor)

      if ({}.hasOwnProperty.call(test, 'expectArray')) {
        expect(Array.isArray(messages)).toBe(test.expectArray)
      }
      if ({}.hasOwnProperty.call(test, 'expectMessageLength')) {
        expect(messages.length).toEqual(test.expectMessageLength)
      }
      if ({}.hasOwnProperty.call(test, 'expectFirstItemSeverity')) {
        expect(messages[0].severity).toEqual(test.expectFirstItemSeverity)
      }
    })
  })
}

describe('validation', () => {
  let shutdownSpy

  beforeEach(() => {
    // for performance reasons prevent Java server from shutting down after
    // each test
    shutdownSpy = spyOn(main.xmlService, 'shutdown')
  })

  testData.forEach((outerTestGroup) => {
    describe(outerTestGroup.description, () => {
      beforeEach(() => {
        atom.config.set('linter-autocomplete-jing.dtdValidation', 'always')
        atom.config.set(
          'linter-autocomplete-jing.xmlCatalog',
          resolvePath(outerTestGroup.catalog)
        )
      })

      outerTestGroup.items.forEach((innerTestGroup) => {
        describe(innerTestGroup.description, () => {
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
