
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

const splitQName = (qName) => {
  const colonIndex = qName.indexOf(':');
  return [qName.substr(0, colonIndex), qName.substr(colonIndex + 1)];
};

const getSchemaProps = (textEditor, parsedRules, config) =>
  new Promise((resolve) => {
    const filePath = textEditor.getPath();
    const dirname = filePath
      ? path.dirname(filePath)
      : __dirname;

    const messages = [];
    const schemaProps = [];
    const xsdSchemaPaths = [];
    const saxParser = sax.parser(true);

    let row = 0;
    let done = false;
    let hasDoctype = false;
    let rootNs = null;
    let rootLocalName = null;
    let rootAttributes = {};
    let publicId = null;

    const addXsdSchemaPath = href => href && xsdSchemaPaths.push(
      regex.url.test(href)
        ? href
        : path.resolve(dirname, href),
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
            filePath,
            range: helpers.generateRange(textEditor, row),
          });
        }
      }

      if (lang) {
        schemaProps.push({
          lang,
          line: row,
          path: regex.url.test(href)
            ? href
            : path.resolve(dirname, href),
        });
      }
    };

    const onOpenTag = (node) => {
      if (done) return;

      const [rootNsPrefix, localName] = splitQName(node.name);
      rootNs = rootNsPrefix
        ? node.attributes['xmlns:' + rootNsPrefix]
        : node.attributes.xmlns;
      rootLocalName = localName;
      rootAttributes = node.attributes;

      getXsiNamespacePrefixes(node.attributes)
        .forEach((prefix) => {
          const noNamespaceSchemaLocation = node.attributes[prefix + ':noNamespaceSchemaLocation'];
          if (noNamespaceSchemaLocation) {
            addXsdSchemaPath(
              noNamespaceSchemaLocation.trim(),
            );
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
    saxParser.ondoctype = (str) => {
      hasDoctype = true;
      const match = str.match(regex.publicId);
      if (match) {
        publicId = match[2] || match[3];
      }
    };
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
        path: xsdSchemaPaths.join('*'),
      });
    }

    const docProps = {
      rootScopes: textEditor.getRootScopeDescriptor().scopes,
      filePath,
      rootNs,
      rootLocalName,
      rootAttributes,
      publicId,
    };

    const rule = parsedRules.find(r => r.test(docProps));

    const xmlCatalog = rule && 'xmlCatalog' in rule.outcome
      ? rule.outcome.xmlCatalog
      : config.xmlCatalog;

    const dtdValidation = rule && 'dtdValidation' in rule.outcome
      ? rule.outcome.dtdValidation
      : config.dtdValidation;

    const xIncludeAware = rule && 'xIncludeAware' in rule.outcome
      ? rule.outcome.xIncludeAware
      : config.xIncludeAware;

    const xIncludeFixupBaseUris = rule && 'xIncludeFixupBaseUris' in rule.outcome
      ? rule.outcome.xIncludeFixupBaseUris
      : config.xIncludeFixupBaseUris;

    const xIncludeFixupLanguage = rule && 'xIncludeFixupLanguage' in rule.outcome
      ? rule.outcome.xIncludeFixupLanguage
      : config.xIncludeFixupLanguage;

    if (rule && 'schemaProps' in rule.outcome && !schemaProps.length) {
      schemaProps.push(...rule.outcome.schemaProps);
    }

    if (hasDoctype &&
      (dtdValidation === 'always' || (dtdValidation === 'fallback' && !schemaProps.length))
    ) {
      schemaProps.push({
        lang: 'dtd',
        line: saxParser.line,
        path: null,
      });
    }

    if (!schemaProps.length) {
      schemaProps.push({
        lang: 'none',
        path: null,
      });
    }

    resolve({
      schemaProps,
      messages,
      xmlCatalog,
      xIncludeAware,
      xIncludeFixupBaseUris,
      xIncludeFixupLanguage,
    });
  });

export default getSchemaProps;
