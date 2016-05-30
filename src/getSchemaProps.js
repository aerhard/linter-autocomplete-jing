
let path;
let sax;
let helpers;

const urlRegex = /^(?:[a-z]+:)?\/\//i;

const getPseudoAtts = body => {
  const pseudoAtts = {};
  body.replace(/(\w+)="(.+?)"/g, (unused, key, value) => (pseudoAtts[key] = value));
  return pseudoAtts;
};

const getXsiNamespacePrefixes = attributes => {
  const prefixes = [];
  Object
    .keys(attributes)
    .forEach(key => {
      const match = key.match(/xmlns:(.*)/);
      if (match && attributes[key] === 'http://www.w3.org/2001/XMLSchema-instance') {
        prefixes.push(match[1]);
      }
    });
  return prefixes;
};

const getSchemaProps = textEditor =>
  new Promise(resolve => {
    if (!path) path = require('path');
    if (!sax) sax = require('sax');
    if (!helpers) helpers = require('atom-linter');

    const messages = [];
    const schemaProps = [];
    const saxParser = sax.parser(true);

    let row = 0;
    let done = false;
    let hasDoctype = false;
    let hasSchemaLocation = false;

    const onProcessingInstruction = node => {
      if (node.name !== 'xml-model') return;

      const { href, type, schematypens } = getPseudoAtts(node.body);

      let lang;
      if (href) {
        if (type === 'application/relax-ng-compact-syntax') {
          lang = 'rnc';
        } else if (schematypens === 'http://relaxng.org/ns/structure/1.0') {
          lang = path.extname(href) === '.rnc' ? 'rnc' : 'rng';
        } else if (schematypens === 'http://purl.oclc.org/dsdl/schematron') {
          lang = 'sch.iso';
        } else if (schematypens === 'http://www.ascc.net/xml/schematron') {
          lang = 'sch.15';
        } else if (schematypens === 'http://www.w3.org/2001/XMLSchema') {
          lang = 'xsd';
        } else {
          messages.push({
            type: 'Warning',
            html: 'Unknown schema type',
            filePath: textEditor.getPath(),
            range: helpers.rangeFromLineNumber(textEditor, row),
          });
        }
      }

      if (lang) {
        schemaProps.push({
          lang,
          line: row,
          path: urlRegex.test(href)
            ? href
            : path.resolve(path.dirname(textEditor.getPath()), href),
        });
      }
    };

    const onOpenTag = node => {
      if (done) return;

      hasSchemaLocation = getXsiNamespacePrefixes(node.attributes)
        .some(prefix =>
          node.attributes[prefix + ':noNamespaceSchemaLocation'] ||
          node.attributes[prefix + ':schemaLocation']
        );

      done = true;
    };

    saxParser.onerror = () => (done = true);
    saxParser.ondoctype = () => (hasDoctype = true);
    saxParser.onprocessinginstruction = onProcessingInstruction;
    saxParser.onopentag = onOpenTag;

    const textBuffer = textEditor.getBuffer();
    const lineCount = textBuffer.getLineCount();
    const chunkSize = 64;

    while (!done && row < lineCount) {
      const line = textBuffer.lineForRow(row);
      const lineLength = line.length;
      let column = 0;
      while (!done && column < lineLength) {
        saxParser.write(line.substr(column, chunkSize));
        column += chunkSize;
      }
      row++;
    }

    if (hasSchemaLocation) {
      schemaProps.push({
        lang: 'xsd',
        line: saxParser.line,
        path: null,
      });
    } else if (hasDoctype) {
      schemaProps.push({
        lang: 'dtd',
        line: saxParser.line,
        path: null,
      });
    } else if (!schemaProps.length) {
      schemaProps.push({
        lang: 'none',
        path: null,
      });
    }

    resolve({ schemaProps, messages });
  });

module.exports = getSchemaProps;
