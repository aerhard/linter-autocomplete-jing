'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _sax = require('sax');

var _sax2 = _interopRequireDefault(_sax);

var _regex = require('./regex');

var _regex2 = _interopRequireDefault(_regex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var helpers = require('atom-linter');

var getPseudoAtts = function getPseudoAtts(body) {
  var pseudoAtts = {};
  body.replace(/(\w+)="(.+?)"/g, function (unused, key, value) {
    return pseudoAtts[key] = value;
  });
  return pseudoAtts;
};

var getXsiNamespacePrefixes = function getXsiNamespacePrefixes(attributes) {
  var prefixes = [];
  Object.keys(attributes).forEach(function (key) {
    var match = key.match(/xmlns:(.*)/);
    if (match && attributes[key] === 'http://www.w3.org/2001/XMLSchema-instance') {
      prefixes.push(match[1]);
    }
  });
  return prefixes;
};

var hasEvenIndex = function hasEvenIndex(unused, index) {
  return index % 2;
};

var splitQName = function splitQName(qName) {
  var colonIndex = qName.indexOf(':');
  return [qName.substr(0, colonIndex), qName.substr(colonIndex + 1)];
};

var getSchemaProps = function getSchemaProps(textEditor, parsedRules, config) {
  return new Promise(function (resolve) {
    var messages = [];
    var schemaProps = [];
    var xsdSchemaPaths = [];
    var saxParser = _sax2.default.parser(true);

    var row = 0;
    var done = false;
    var hasDoctype = false;
    var rootNs = null;
    var rootLocalName = null;
    var rootAttributes = {};

    var addXsdSchemaPath = function addXsdSchemaPath(href) {
      return href && xsdSchemaPaths.push(_regex2.default.url.test(href) ? href : _path2.default.resolve(_path2.default.dirname(textEditor.getPath()), href));
    };

    var onProcessingInstruction = function onProcessingInstruction(node) {
      if (node.name !== 'xml-model') return;

      var _getPseudoAtts = getPseudoAtts(node.body);

      var href = _getPseudoAtts.href;
      var type = _getPseudoAtts.type;
      var schematypens = _getPseudoAtts.schematypens;


      var lang = void 0;
      if (href) {
        if (type === 'application/relax-ng-compact-syntax') {
          lang = 'rnc';
        } else if (schematypens === 'http://relaxng.org/ns/structure/1.0') {
          lang = _path2.default.extname(href) === '.rnc' ? 'rnc' : 'rng';
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
            range: helpers.rangeFromLineNumber(textEditor, row)
          });
        }
      }

      if (lang) {
        schemaProps.push({
          lang: lang,
          line: row,
          path: _regex2.default.url.test(href) ? href : _path2.default.resolve(_path2.default.dirname(textEditor.getPath()), href)
        });
      }
    };

    var onOpenTag = function onOpenTag(node) {
      if (done) return;

      var _splitQName = splitQName(node.name);

      var rootNsPrefix = _splitQName[0];
      var localName = _splitQName[1];

      rootNs = rootNsPrefix ? node.attributes['xmlns:' + rootNsPrefix] : node.attributes.xmlns;
      rootLocalName = localName;
      rootAttributes = node.attributes;

      getXsiNamespacePrefixes(node.attributes).forEach(function (prefix) {
        var noNamespaceSchemaLocation = node.attributes[prefix + ':noNamespaceSchemaLocation'];
        if (noNamespaceSchemaLocation) {
          noNamespaceSchemaLocation.trim().split(_regex2.default.spaces).forEach(addXsdSchemaPath);
        }

        var schemaLocation = node.attributes[prefix + ':schemaLocation'];
        if (schemaLocation) {
          schemaLocation.trim().split(_regex2.default.spaces).filter(hasEvenIndex).forEach(addXsdSchemaPath);
        }
      });

      done = true;
    };

    saxParser.onerror = function () {
      return done = true;
    };
    saxParser.ondoctype = function () {
      return hasDoctype = true;
    };
    saxParser.onprocessinginstruction = onProcessingInstruction;
    saxParser.onopentag = onOpenTag;

    var textBuffer = textEditor.getBuffer();
    var lineCount = textBuffer.getLineCount();
    var chunkSize = 64;

    while (!done && row < lineCount) {
      var line = textBuffer.lineForRow(row);
      var lineLength = line.length;
      var column = 0;
      while (!done && column < lineLength) {
        saxParser.write(line.substr(column, chunkSize));
        column += chunkSize;
      }
      row++;
    }

    if (xsdSchemaPaths.length) {
      schemaProps.push({
        lang: 'xsd',
        path: xsdSchemaPaths.join(' ')
      });
    }

    var docProps = {
      rootScopes: textEditor.getRootScopeDescriptor().scopes,
      filePath: textEditor.getPath(),
      rootNs: rootNs,
      rootLocalName: rootLocalName,
      rootAttributes: rootAttributes
    };

    var rule = parsedRules.find(function (r) {
      return r.test(docProps);
    });

    var xmlCatalog = rule && 'xmlCatalog' in rule.outcome ? rule.outcome.xmlCatalog : config.xmlCatalog;

    var dtdValidation = rule && 'dtdValidation' in rule.outcome ? rule.outcome.dtdValidation : config.dtdValidation;

    if (rule && !schemaProps.length) {
      schemaProps.push.apply(schemaProps, rule.outcome.schemaProps);
    }

    if (hasDoctype && (dtdValidation === 'always' || dtdValidation === 'fallback' && !schemaProps.length)) {
      schemaProps.push({
        lang: 'dtd',
        line: saxParser.line,
        path: null
      });
    }

    if (!schemaProps.length) {
      schemaProps.push({
        lang: 'none',
        path: null
      });
    }

    resolve({ schemaProps: schemaProps, messages: messages, xmlCatalog: xmlCatalog });
  });
};

module.exports = getSchemaProps;