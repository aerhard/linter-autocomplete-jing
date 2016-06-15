'use babel';

import linter from '../lib/main';
import serverProcess from '../lib/serverProcess';
import path from 'path';
import mainTestData from './json/main';

const resolvePath = (filename) => path.resolve(__dirname, 'json', filename);

describe('main', () => {
  let exitServer;

  it('%%% pseudo before all %%%', () => {
    exitServer = serverProcess.exit;
    serverProcess.exit = function() {};
  });

  const testValidation = (basename, cb) =>
    waitsForPromise(() =>
      atom.workspace.open(resolvePath(basename))
      .then((editor) =>
        linter.provideLinter().lint(editor)
        .then(cb)
        .then(() => {
          const pane = atom.workspace.paneForItem(editor);
          pane.destroyItem(editor);
        })
      )
    );

  mainTestData.forEach(({ description, catalog, items }) => {
    describe(description, () => {
      beforeEach(() => {
        waitsForPromise(() =>
          atom.packages.activatePackage('linter-jing')
        );
        atom.config.set('linter-jing.xmlCatalog', resolvePath(catalog));
      });

      items.forEach(({ description, items }) => { // eslint-disable-line
        describe(description, () => {
          items.forEach((item) => {
            const runAssertions = () => it(item.expectation, () => {
              testValidation(item.file, (messages) => {
                if (item.hasOwnProperty('expectArray')) {
                  expect(Array.isArray(messages)).toBe(item.expectArray);
                }
                if (item.hasOwnProperty('expectMessageLength')) {
                  expect(messages.length).toEqual(item.expectMessageLength);
                }
                if (item.hasOwnProperty('expectFirstItemType')) {
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
    exitServer.call(serverProcess);
  });
});
