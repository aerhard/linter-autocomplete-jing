'use strict';

var _fp = require('lodash/fp');

var _serverProcess = require('./serverProcess');

var _serverProcess2 = _interopRequireDefault(_serverProcess);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serverProcessInstance = _serverProcess2.default.getInstance();

var helpers = require('atom-linter');

var messageRegex = /^([a-z0-9\.]+?):((.*?):\s?)?((\d+):)?(?:\d+:\s)?(error|fatal|warning):\s(.*)$/;

var parseMessage = function parseMessage(textEditor, schemaProps, config) {
  return function (str) {
    var match = messageRegex.exec(str);
    if (!match) {
      console.error('Could not parse message "' + str + '"'); // eslint-disable-line
      return null;
    }

    var lang = match[1];
    var systemId = match[3];
    var line = match[5];
    var level = match[6];
    var text = match[7];


    var filePath = textEditor.getPath();

    var html = document.createElement('div').appendChild(document.createTextNode(text)).parentNode.innerHTML;

    if (systemId === filePath) {
      return {
        type: level === 'warning' ? 'Warning' : 'Error',
        html: lang === 'none' ? html : '<span class="badge badge-flexible">' + lang.toUpperCase() + '</span> ' + html,
        filePath: filePath,
        range: helpers.rangeFromLineNumber(textEditor, Number(line) - 1)
      };
    }

    if (!config.displaySchemaWarnings && level === 'warning') {
      return null;
    }

    var label = level === 'warning' ? 'Schema parser warning: ' : 'Could not process schema or catalog: ';

    var schema = schemaProps.find(function (sch) {
      return sch.path === systemId && sch.lang === lang;
    });
    var range = schema ? helpers.rangeFromLineNumber(textEditor, schema.line) : [[0, 0], [0, 0]];

    return {
      type: 'Warning',
      html: label + html,
      filePath: filePath,
      range: range
    };
  };
};

var validate = function validate(textEditor, config) {
  return function (_ref) {
    var _ref$ = _ref[1];
    var schemaProps = _ref$.schemaProps;
    var messages = _ref$.messages;
    var xmlCatalog = _ref$.xmlCatalog;

    var headers = ['V', 'r', 'UTF-8', textEditor.getPath(), xmlCatalog || ''].concat(schemaProps.map(function (schema) {
      return schema.lang + ' ' + (schema.path || '');
    }));
    var body = textEditor.getText();

    return serverProcessInstance.sendRequest(headers, body).then((0, _fp.flow)(_fp.trim, (0, _fp.split)(/\r?\n/), (0, _fp.filter)(_fp.identity), (0, _fp.map)(parseMessage(textEditor, schemaProps, config)), _fp.compact, (0, _fp.concat)(messages), (0, _fp.sortBy)('range[0][0]')));
  };
};

module.exports = validate;