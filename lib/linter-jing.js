'use strict';

var _atom = require('atom');

var path = void 0;
var sax = void 0;
var helpers = void 0;
var subscriptions = void 0;

var localConfig = {};

var classPathDelimiter = process.platform === 'win32' ? ';' : ':';
var messageRegex = /^((.*?):\s?)?((\d+):)?((\d+):\s)?((error|fatal|warning):\s)(.*)\s?$/;
var jars = {
  jing: '../vendor/jing/jing.jar',
  saxon: '../vendor/saxon/saxon9he.jar',
  xerces: '../vendor/xerces/xercesImpl.jar'
};

var parseMessage = function parseMessage(textEditor, schema) {
  return function (str) {
    if (!helpers) helpers = require('atom-linter');

    var match = messageRegex.exec(str);
    if (!match) {
      console.log('Could not parse message "' + str + '"'); // eslint-disable-line
      return null;
    }

    var systemId = match[2];
    var line = match[4];
    var level = match[8];
    var text = match[9];


    var filePath = textEditor.getPath();

    if (systemId !== filePath && level === 'warning' && !localConfig.displaySchemaWarnings) {
      return null;
    }

    var effectiveLine = systemId === filePath ? Number(line) - 1 : schema.line;

    return {
      type: level === 'warning' ? 'Warning' : 'Error',
      html: '' + text,
      filePath: filePath,
      range: helpers.rangeFromLineNumber(textEditor, effectiveLine)
    };
  };
};

function getJars(lang) {
  switch (lang) {
    case 'xsd':
      return [jars.xerces, jars.jing];
    case 'sch.15':
    case 'sch.iso':
      return [jars.saxon, jars.jing];
    default:
      return [jars.jing];
  }
}

function runJing(textEditor, schema) {
  if (!path) path = require('path');
  if (!helpers) helpers = require('atom-linter');

  var xmlPath = textEditor.getPath();
  var params = ['-cp', getJars(schema.lang).map(function (jar) {
    return path.resolve(__dirname, jar);
  }).join(classPathDelimiter), 'com.thaiopensource.relaxng.util.Driver', '-S'].concat(schema.lang === 'rnc' ? ['-c'] : [], [schema.path || '-', xmlPath]);

  var options = {
    cwd: path.dirname(xmlPath),
    stdin: textEditor.getText(),
    stream: 'stdout',
    ignoreExitCode: true
  };

  return helpers.exec(localConfig.javaExecutablePath, params, options).then(function (stdout) {
    return stdout.split('\n').map(parseMessage(textEditor, schema)).reduce(function (result, current) {
      return current ? result.concat(current) : result;
    }, []);
  });
}

function validateAll(_ref) {
  var textEditor = _ref.textEditor;
  var schemata = _ref.schemata;
  var messages = _ref.messages;

  return Promise.all(schemata.map(function (schema) {
    return runJing(textEditor, schema);
  })).then(function (validatorMessages) {
    return validatorMessages.reduce(function (result, current) {
      return result.concat(current);
    }, messages);
  });
}

function getPseudoAtts(body) {
  var pseudoAtts = {};
  body.replace(/(\w+)="(.+?)"/g, function (unused, key, value) {
    return pseudoAtts[key] = value;
  });
  return pseudoAtts;
}

function getXsiNamespacePrefixes(attributes) {
  var prefixes = [];
  Object.keys(attributes).forEach(function (key) {
    var match = key.match(/xmlns:(.*)/);
    if (match && attributes[key] === 'http://www.w3.org/2001/XMLSchema-instance') {
      prefixes.push(match[1]);
    }
  });
  return prefixes;
}

function getSchemaRefs(textEditor) {
  if (!path) path = require('path');
  if (!sax) sax = require('sax');
  if (!helpers) helpers = require('atom-linter');

  return new Promise(function (resolve) {
    var messages = [];
    var schemata = [];
    var saxParser = sax.parser(true);

    var done = false;

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
            range: helpers.rangeFromLineNumber(textEditor, saxParser.line)
          });
        }
      }

      if (lang) {
        schemata.push({
          lang: lang,
          line: saxParser.line,
          path: href
        });
      }
    };

    var onOpenTag = function onOpenTag(node) {
      if (done) return;

      var schemaLocations = [];

      getXsiNamespacePrefixes(node.attributes).forEach(function (prefix) {
        var noNamespaceSchemaLocation = node.attributes[prefix + ':noNamespaceSchemaLocation'];
        if (noNamespaceSchemaLocation) {
          noNamespaceSchemaLocation.split(/\s+/).forEach(function (schema) {
            return schemaLocations.push(schema);
          });
        }

        var schemaLocation = node.attributes[prefix + ':schemaLocation'];
        if (schemaLocation) {
          schemaLocation.split(/\s+/).filter(function (unused, index) {
            return index % 2;
          }).forEach(function (schema) {
            return schemaLocations.push(schema);
          });
        }
      });

      var xsdSchemata = schemaLocations.map(function (schemaLocation) {
        return {
          lang: 'xsd',
          line: saxParser.line,
          path: schemaLocation
        };
      });

      schemata.push.apply(schemata, xsdSchemata);

      done = true;
    };

    saxParser.onerror = function () {
      return done = true;
    };
    saxParser.onprocessinginstruction = onProcessingInstruction;
    saxParser.onopentag = onOpenTag;

    var textBuffer = textEditor.getBuffer();
    var lineCount = textBuffer.getLineCount();
    var chunkSize = 64;
    var row = 0;

    while (!done && row < lineCount) {
      var line = textBuffer.lineForRow(row);
      var lineLength = line.length;
      var column = 0;
      while (!done && column < lineLength) {
        saxParser.write(line.substr(column, chunkSize));
        column += chunkSize;
      }
      if (!done) saxParser.write(textBuffer.lineEndingForRow(row));
      row++;
    }

    if (!schemata.length) {
      schemata.push({});
    }

    resolve({ textEditor: textEditor, schemata: schemata, messages: messages });
  });
}

module.exports = {
  config: {
    javaExecutablePath: {
      order: 1,
      type: 'string',
      default: 'java'
    },
    displaySchemaWarnings: {
      order: 2,
      type: 'boolean',
      default: false
    }
  },

  activate: function activate() {
    require('atom-package-deps').install();
    subscriptions = new _atom.CompositeDisposable();

    Object.keys(this.config).forEach(function (key) {
      return subscriptions.add(atom.config.observe('linter-jing.' + key, function (value) {
        return localConfig[key] = value;
      }));
    });
  },
  deactivate: function deactivate() {
    subscriptions.dispose();
  },
  provideLinter: function provideLinter() {
    return {
      name: 'Jing',
      grammarScopes: ['text.xml', 'text.mei'],
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        return getSchemaRefs(textEditor).then(validateAll);
      }
    };
  }
};
