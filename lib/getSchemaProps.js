'use strict';

var path = void 0;
var sax = void 0;
var helpers = void 0;

var urlRegex = /^(?:[a-z]+:)?\/\//i;

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

var getSchemaProps = function getSchemaProps(textEditor) {
  return new Promise(function (resolve) {
    if (!path) path = require('path');
    if (!sax) sax = require('sax');
    if (!helpers) helpers = require('atom-linter');

    var messages = [];
    var schemaProps = [];
    var saxParser = sax.parser(true);

    var row = 0;
    var done = false;
    var hasDoctype = false;
    var hasSchemaLocation = false;

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
            range: helpers.rangeFromLineNumber(textEditor, row)
          });
        }
      }

      if (lang) {
        schemaProps.push({
          lang: lang,
          line: row,
          path: urlRegex.test(href) ? href : path.resolve(path.dirname(textEditor.getPath()), href)
        });
      }
    };

    var onOpenTag = function onOpenTag(node) {
      if (done) return;

      hasSchemaLocation = getXsiNamespacePrefixes(node.attributes).some(function (prefix) {
        return node.attributes[prefix + ':noNamespaceSchemaLocation'] || node.attributes[prefix + ':schemaLocation'];
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

    if (hasSchemaLocation) {
      schemaProps.push({
        lang: 'xsd',
        line: saxParser.line,
        path: null
      });
    } else if (hasDoctype) {
      schemaProps.push({
        lang: 'dtd',
        line: saxParser.line,
        path: null
      });
    } else if (!schemaProps.length) {
      schemaProps.push({
        lang: 'none',
        path: null
      });
    }

    resolve({ schemaProps: schemaProps, messages: messages });
  });
};

module.exports = getSchemaProps;