'use strict';

var path = void 0;
var helpers = void 0;
var net = void 0;
var sortBy = void 0;

var messageRegex = /^((.*?):\s?)?((\d+):)?(?:\d+:\s)?(error|fatal|warning):\s(.*)$/;

var parseMessage = function parseMessage(textEditor, schemaProps, config) {
  return function (str) {
    if (!helpers) helpers = require('atom-linter');

    var match = messageRegex.exec(str);
    if (!match) {
      console.error('Could not parse message "' + str + '"'); // eslint-disable-line
      return null;
    }

    var systemId = match[2];
    var line = match[4];
    var level = match[5];
    var text = match[6];


    var filePath = textEditor.getPath();

    if (systemId === filePath) {
      return {
        type: level === 'warning' ? 'Warning' : 'Error',
        html: text,
        filePath: filePath,
        range: helpers.rangeFromLineNumber(textEditor, Number(line) - 1)
      };
    }

    if (!config.displaySchemaWarnings && level === 'warning') {
      return null;
    }

    var prolog = level === 'warning' ? 'Schema parser warning: ' : 'Could not process schema or catalog: ';

    var schema = schemaProps.find(function (sch) {
      return sch.path === systemId;
    });
    var range = schema ? helpers.rangeFromLineNumber(textEditor, schema.line) : [[0, 0], [0, 0]];

    return {
      type: 'Warning',
      html: prolog + text,
      filePath: filePath,
      range: range
    };
  };
};

var validate = function validate(textEditor, config) {
  return function (_ref) {
    var server = _ref[0];
    var _ref$ = _ref[1];
    var schemaProps = _ref$.schemaProps;
    var messages = _ref$.messages;
    return new Promise(function (resolve, reject) {
      if (!path) path = require('path');
      if (!helpers) helpers = require('atom-linter');
      if (!net) net = require('net');
      if (!sortBy) sortBy = require('lodash/sortBy');

      var socket = new net.Socket();

      socket.on('connect', function () {
        var headers = ['-V', '-r', '-' + textEditor.getPath(), '-' + (config.xmlCatalog || '')].concat(schemaProps.map(function (schema) {
          return '-' + schema.lang + ' ' + (schema.path || '');
        }), ['\n']).join('\n');

        socket.write(headers);
        socket.end(textEditor.getText());
      });

      socket.on('data', function (data) {
        var validationMessages = data.toString().trim().split(/\r?\n/).map(parseMessage(textEditor, schemaProps, config)).reduce(function (result, current) {
          return current ? result.concat(current) : result;
        }, []);

        messages.push.apply(messages, validationMessages);
      });

      socket.on('close', function () {
        return resolve(sortBy(messages, 'range[0][0]'));
      });
      socket.on('error', reject);

      socket.connect({ port: server.port });
    });
  };
};

module.exports = validate;