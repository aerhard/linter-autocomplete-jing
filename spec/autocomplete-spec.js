'use babel';

import path from 'path';
import { beforeEach, it } from 'jasmine-fix';
import main from '../lib/main.coffee';
import testData from './autocomplete/json/main.json';

const resolvePath = filename => path.resolve(__dirname, 'autocomplete/json', filename);

const ServerProcess = main.ServerProcess;
const serverProcessInstance = ServerProcess.getInstance();

const buildOptions = (test, editor) => {
  const endPosition = test.splitPoint
    ? editor.getBuffer().positionForCharacterIndex(test.splitPoint)
    : editor.getBuffer().getEndPosition();

  let bufferPosition;
  let scopeDescriptor;

  if (test.suggestionType === 'E') {
    editor.setCursorBufferPosition(endPosition);
    editor.insertText('<');
    bufferPosition = { row: endPosition.row, column: endPosition.column + 1 };
    scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
    editor.setCursorBufferPosition(bufferPosition);
  } else if (test.suggestionType === 'N') {
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
    const fragment = test.fragment.split(' ')[0];
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
  const autocompleteProvider = main.provideAutocomplete();
  const { getSuggestions } = autocompleteProvider;

  it('"beforeAll()"', () => {
    // prevent Java server from shutting down after each test
    serverProcessInstance.exit = function() {};
  });

  testData.forEach((outerTestGroup) => {
    describe(outerTestGroup.description, () => {
      outerTestGroup.items.forEach((innerTestGroup) => {
        const schemaFiles = innerTestGroup.schemata.map(({ path: schemaPath }) => (
          schemaPath
            ? path.basename(schemaPath)
            : 'none'
        )).join(', ');

        describe(`given schema "${schemaFiles}", `, () => {
          innerTestGroup.items.forEach((test) => {
            describe(test.condition || '...', () => {
              let editor = null;

              beforeEach(async() => {
                atom.config.set('linter-autocomplete-jing.wildcardSuggestions', 'all');
                atom.config.set('linter-autocomplete-jing.xmlCatalog', resolvePath(outerTestGroup.catalog));

                await atom.packages.activatePackage('language-xml');
                await atom.packages.activatePackage('linter-autocomplete-jing');

                editor = await atom.workspace.open(resolvePath(test.file));

                main.activate();
                // atom.packages.triggerDeferredActivationHooks();
              });

              const testDescription = 'suggests ' +
                '[' + test.expectResult.map(({ displayText }) => displayText.replace('#', '[hash]')).join(', ') + '] ' +
                'when requesting type "' + test.suggestionType + '" autocomplete ' +
                'in file "' + path.basename(test.file) + '" ' +
                (test.fragment ? 'at fragment "' + test.fragment : '');

              it(testDescription, async() => {
                const options = buildOptions(test, editor);

                const messages = await getSuggestions(options);

                expect(JSON.stringify(messages, 2, null))
                  .toEqual(JSON.stringify(test.expectResult, 2, null));
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
