'use babel';

import path from 'path';
import { beforeEach, it } from 'jasmine-fix';
import main from '../lib/main.coffee';
import testData from './validation/json/main.json';

const resolvePath = filename => path.resolve(__dirname, 'validation/json', filename);

const ServerProcess = main.ServerProcess;
const serverProcessInstance = ServerProcess.getInstance();

describe('validation', () => {
  const linterProvider = main.provideLinter();
  const { lint } = linterProvider;

  it('"beforeAll()"', () => {
    // prevent Java server from shutting down after each test
    serverProcessInstance.exit = function() {};
  });

  testData.forEach((outerTestGroup) => {
    describe(outerTestGroup.description, () => {
      outerTestGroup.items.forEach((innerTestGroup) => {
        describe(innerTestGroup.description, () => {
          innerTestGroup.items.forEach((test) => {
            describe(test.condition || '...', () => {
              let editor = null;

              beforeEach(async() => {
                atom.config.set('linter-autocomplete-jing.dtdValidation', 'always');
                atom.config.set('linter-autocomplete-jing.xmlCatalog', resolvePath(outerTestGroup.catalog));

                await atom.packages.activatePackage('linter-autocomplete-jing');

                editor = await atom.workspace.open(resolvePath(test.file));

                main.activate();
                // atom.packages.triggerDeferredActivationHooks();
              });

              it(test.expectation, async() => {
                const messages = await lint(editor);

                if ({}.hasOwnProperty.call(test, 'expectArray')) {
                  expect(Array.isArray(messages)).toBe(test.expectArray);
                }
                if ({}.hasOwnProperty.call(test, 'expectMessageLength')) {
                  expect(messages.length).toEqual(test.expectMessageLength);
                }
                if ({}.hasOwnProperty.call(test, 'expectFirstItemSeverity')) {
                  expect(messages[0].severity).toEqual(test.expectFirstItemSeverity);
                }
              });
            });
          });
        });
      });
    });
  });

  it('"afterAll()"', () => {
    // shut down Java server after all tests
    ServerProcess.prototype.exit.apply(serverProcessInstance);
  });
});
