'use babel';

import path from 'path';
import main from '../lib/main';
import serverProcess from '../lib/serverProcess';
import testData from './validation/json/main';

const resolvePath = filename => path.resolve(__dirname, 'validation/json', filename);

const serverProcessInstance = serverProcess.getInstance();

describe('validation', () => {
  let exitServer;

  it('%%% pseudo before all %%%', () => {
    exitServer = serverProcessInstance.exit;
    serverProcessInstance.exit = function() {};
  });

  const testValidation = (basename, cb) =>
    waitsForPromise(() =>
      atom.workspace.open(resolvePath(basename))
      .then(editor =>
        main.provideLinter().lint(editor)
        .then(cb)
        .then(() => {
          const pane = atom.workspace.paneForItem(editor);
          pane.destroyItem(editor);
        })
      )
    );

  testData.forEach(({ description, catalog, items }) => {
    describe(description, () => {
      beforeEach(() => {
        waitsForPromise(() =>
          atom.packages.activatePackage('linter-autocomplete-jing')
        );
        atom.config.set('linter-autocomplete-jing.xmlCatalog', resolvePath(catalog));
      });

      items.forEach(({ description, items }) => { // eslint-disable-line
        describe(description, () => {
          items.forEach((item) => {
            const runAssertions = () => it(item.expectation, () => {
              testValidation(item.file, (messages) => {
                if ({}.hasOwnProperty.call(item, 'expectArray')) {
                  expect(Array.isArray(messages)).toBe(item.expectArray);
                }
                if ({}.hasOwnProperty.call(item, 'expectMessageLength')) {
                  expect(messages.length).toEqual(item.expectMessageLength);
                }
                if ({}.hasOwnProperty.call(item, 'expectFirstItemType')) {
                  expect(messages[0].type).toEqual(item.expectFirstItemType);
                }
              });
            });

            if (item.condition) {
              describe(item.condition, () => {
                runAssertions();
              });
            } else {
              runAssertions();
            }
          });
        });
      });
    });
  });

  it('%%% pseudo after all %%%', () => {
    exitServer.call(serverProcessInstance);
  });
});
