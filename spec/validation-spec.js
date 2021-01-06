'use babel';

import path from 'path';
import main from '../lib/main.coffee';
import testData from './validation/json/main.json';

const resolvePath = filename => path.resolve(__dirname, 'validation/json', filename);

const ServerProcess = main.ServerProcess;
const serverProcessInstance = ServerProcess.getInstance();

describe('validation', () => {
  const linterProvider = main.provideLinter();
  const { lint } = linterProvider;

  it('%%% pseudo before all %%%', () => {
    serverProcessInstance.exit = function() {};
  });

  testData.forEach((outerTestGroup) => {
    describe(outerTestGroup.description, () => {
      outerTestGroup.items.forEach((innerTestGroup) => {
        describe(innerTestGroup.description, () => {
          innerTestGroup.items.forEach((test) => {
            describe(test.condition || '...', () => {
              let editor = null;

              beforeEach(() => {
                const activationPromise = atom.packages.activatePackage('linter-autocomplete-jing')
                  .then(() => {
                    atom.config.set('linter-autocomplete-jing.dtdValidation', 'always');
                    atom.config.set('linter-autocomplete-jing.xmlCatalog', resolvePath(outerTestGroup.catalog));
                  });

                waitsForPromise(() =>
                  atom.workspace.open(resolvePath(test.file)).then((e) => { editor = e; }),
                );

                main.activate();
                // atom.packages.triggerDeferredActivationHooks();

                waitsForPromise(() => activationPromise);
              });

              it(test.expectation, () => {
                waitsForPromise(() => lint(editor)
                    .then((messages) => {
                      if ({}.hasOwnProperty.call(test, 'expectArray')) {
                        expect(Array.isArray(messages)).toBe(test.expectArray);
                      }
                      if ({}.hasOwnProperty.call(test, 'expectMessageLength')) {
                        expect(messages.length).toEqual(test.expectMessageLength);
                      }
                      if ({}.hasOwnProperty.call(test, 'expectFirstItemSeverity')) {
                        expect(messages[0].severity).toEqual(test.expectFirstItemSeverity);
                      }
                    }));
              });
            });
          });
        });
      });
    });
  });

  it('%%% pseudo after all %%%', () => {
    ServerProcess.prototype.exit.apply(serverProcessInstance);
  });
});
