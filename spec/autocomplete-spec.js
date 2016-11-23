'use babel';

import path from 'path';
import main from '../lib/main.coffee';
import testData from './autocomplete/json/main.json';

const resolvePath = filename => path.resolve(__dirname, 'autocomplete/json', filename);

const ServerProcess = main.ServerProcess;
const serverProcessInstance = ServerProcess.getInstance();

const buildOptions = (editor, suggestionType, fragment, splitPoint) => {
  const endPosition = splitPoint
    ? editor.getBuffer().positionForCharacterIndex(splitPoint)
    : editor.getBuffer().getEndPosition();

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
  it('%%% pseudo before all %%%', () => {
    serverProcessInstance.exit = function() {};
  });

  const testAutocomplete = ({ file, suggestionType, fragment, splitPoint }, cb) =>
    waitsForPromise(() =>
      atom.packages.activatePackage('language-xml')
      .then(() => atom.workspace.open(resolvePath(file)))
      .then(editor =>
        main.provideAutocomplete().getSuggestions(
          buildOptions(editor, suggestionType, fragment, splitPoint),
        )
        .then(cb)
        .then(() => {
          const pane = atom.workspace.paneForItem(editor);
          pane.destroyItem(editor);
        }),
      ),
    );

  testData.forEach(({ description, catalog, items: firstLevelItems }) => {
    describe(description, () => {
      beforeEach(() => {
        waitsForPromise(() =>
          atom.packages.activatePackage('linter-autocomplete-jing'),
        );
        atom.config.set('linter-autocomplete-jing.wildcardSuggestions', 'all');
        atom.config.set('linter-autocomplete-jing.xmlCatalog', resolvePath(catalog));
      });

      firstLevelItems.forEach(({ schemata, items: secondLevelItems }) => {
        const schemaFiles = schemata.map(({ path: schemaPath }) => (
          schemaPath
            ? path.basename(schemaPath)
            : 'none'
        )).join(', ');

        describe(`given schema "${schemaFiles}", `, () => {
          secondLevelItems.forEach((item) => {
            const str = 'suggests ' +
              '[' + item.expectResult.map(({ displayText }) => displayText.replace('#', '[hash]')).join(', ') + '] ' +
              'when requesting type "' + item.suggestionType + '" autocomplete ' +
              'in file "' + path.basename(item.file) + '" ' +
              (item.fragment ? 'at fragment "' + item.fragment : '');

            const runAssertions = () => it(str, () => {
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
    ServerProcess.prototype.exit.apply(serverProcessInstance);
  });
});
