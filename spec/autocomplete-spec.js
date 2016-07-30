'use babel';

import path from 'path';
import main from '../lib/main';
import serverProcess from '../lib/serverProcess';
import testData from './autocomplete/json/main';

const resolvePath = filename => path.resolve(__dirname, 'autocomplete/json', filename);

const buildOptions = (editor, suggestionType, fragment) => {
  const endPosition = editor.getBuffer().getEndPosition();

  let bufferPosition;
  let scopeDescriptor;

  if (suggestionType === 'E') {
    editor.setCursorBufferPosition(endPosition);
    editor.insertText('<');
    bufferPosition = { row: endPosition.row, column: endPosition.column + 1 };
    scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
    editor.setCursorBufferPosition(bufferPosition);
  } else if (suggestionType === 'N') {
    let row = endPosition.row + 1;
    let line;
    let lastGtIndex = -1;
    while (lastGtIndex === -1 && --row > -1) {
      line = editor.lineTextForBufferRow(row);
      lastGtIndex = line.lastIndexOf('>');
    }

    editor.setCursorBufferPosition({ row, column: lastGtIndex });
    editor.insertText(' ');
    bufferPosition = { row, column: lastGtIndex + 1 };
    scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
    editor.setCursorBufferPosition(bufferPosition);
  } else {
    fragment = fragment.split(' ')[0];
    let row = endPosition.row + 1;
    let line;
    let lastFragmentIndex = -1;
    while (lastFragmentIndex === -1 && --row > -1) {
      line = editor.lineTextForBufferRow(row);
      lastFragmentIndex = line.lastIndexOf(fragment + '=');
    }

    bufferPosition = { row, column: lastFragmentIndex + fragment.length + 2 };
    scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
    editor.setCursorBufferPosition(bufferPosition);
  }

  return {
    editor,
    bufferPosition,
    scopeDescriptor,
  };
};

describe('autocomplete', () => {
  let exitServer;

  it('%%% pseudo before all %%%', () => {
    exitServer = serverProcess.exit;
    serverProcess.exit = function() {};
  });

  const testAutocomplete = ({ file, suggestionType, fragment }, cb) =>
    waitsForPromise(() =>
      atom.packages.activatePackage('language-xml')
      .then(() => atom.workspace.open(resolvePath(file)))
      .then(editor =>
        main.provideAutocomplete().getSuggestions(buildOptions(editor, suggestionType, fragment))
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
              testAutocomplete(item, (messages) => {
                expect(JSON.stringify(messages, 2, null))
                  .toEqual(JSON.stringify(item.expectResult, 2, null));
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
