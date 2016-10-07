
import path from 'path';
import sax from 'sax';
import regex from './regex';

const helpers = require('atom-linter');

const getPseudoAtts = (body) => {
  const pseudoAtts = {};
  body.replace(/(\w+)="(.+?)"/g, (unused, key, value) => (pseudoAtts[key] = value));
  return pseudoAtts;
};

const getXsiNamespacePrefixes = (attributes) => {
  const prefixes = [];
  Object
    .keys(attributes)
    .forEach((key) => {
      const match = key.match(/xmlns:(.*)/);
      if (match && attributes[key] === 'http://www.w3.org/2001/XMLSchema-instance') {
        prefixes.push(match[1]);
      }
    });
  return prefixes;
};

const hasEvenIndex = (unused, index) => index % 2;

const getSchemaPropsFromConfig = (config, fileName) => {
  if (config.rules) {
    return config.rules
    .filter(({testPathRegex}) => {
      if (testPathRegex) {
        const re = new RegExp(testPathRegex);
        return re.test(fileName);
      } else {
        return false;
      }
    })
    .map(({outcomeSchemaProps}) => outcomeSchemaProps);
  } else {
    return [];
  }
};

const getSchemaProps = (textEditor, config) =>
  new Promise((resolve) => {
    const messages = [];
    const schemaProps = getSchemaPropsFromConfig(config, textEditor.getFileName());
    const xsdSchemaPaths = [];
    const saxParser = sax.parser(true);

    let row = 0;
    let done = false;
    let hasDoctype = false;

    const addXsdSchemaPath = href => href && xsdSchemaPaths.push(
      regex.url.test(href)
        ? href
        : path.resolve(path.dirname(textEditor.getPath()), href)
    );

    const onProcessingInstruction = (node) => {
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
          addXsdSchemaPath(href);
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
          path: regex.url.test(href)
            ? href
            : path.resolve(path.dirname(textEditor.getPath()), href),
        });
      }
    };

    const onOpenTag = (node) => {
      if (done) return;

      getXsiNamespacePrefixes(node.attributes)
        .forEach((prefix) => {
          const noNamespaceSchemaLocation = node.attributes[prefix + ':noNamespaceSchemaLocation'];
          if (noNamespaceSchemaLocation) {
            noNamespaceSchemaLocation
              .trim()
              .split(regex.spaces)
              .forEach(addXsdSchemaPath);
          }

          const schemaLocation = node.attributes[prefix + ':schemaLocation'];
          if (schemaLocation) {
            schemaLocation
              .trim()
              .split(regex.spaces)
              .filter(hasEvenIndex)
              .forEach(addXsdSchemaPath);
          }
        });

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

    if (xsdSchemaPaths.length) {
      schemaProps.push({
        lang: 'xsd',
        path: xsdSchemaPaths.join(' '),
      });
    }

    if (hasDoctype) {
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
