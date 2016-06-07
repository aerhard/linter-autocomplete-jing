
let path;
let helpers;
let net;
let sortBy;

const messageRegex = /^((.*?):\s?)?((\d+):)?(?:\d+:\s)?(error|fatal|warning):\s(.*)$/;

const parseMessage = (textEditor, schemaProps, config) => function(str) {
  if (!helpers) helpers = require('atom-linter');

  const match = messageRegex.exec(str);
  if (!match) {
    console.error(`Could not parse message "${str}"`); // eslint-disable-line
    return null;
  }

  const [,, systemId,, line, level, text] = match;

  const filePath = textEditor.getPath();

  if (systemId === filePath) {
    return {
      type: level === 'warning' ? 'Warning' : 'Error',
      html: text,
      filePath,
      range: helpers.rangeFromLineNumber(textEditor, Number(line) - 1),
    };
  }

  if (!config.displaySchemaWarnings && level === 'warning') {
    return null;
  }

  const prolog = level === 'warning'
    ? 'Schema parser warning: '
    : 'Could not process schema or catalog: ';

  const schema = schemaProps.find(sch => sch.path === systemId);
  const range = schema
    ? helpers.rangeFromLineNumber(textEditor, schema.line)
    : [[0, 0], [0, 0]];

  return {
    type: 'Warning',
    html: prolog + text,
    filePath,
    range,
  };
};

const validate = (textEditor, config) => ([server, { schemaProps, messages }]) =>
  new Promise((resolve, reject) => {
    if (!path) path = require('path');
    if (!helpers) helpers = require('atom-linter');
    if (!net) net = require('net');
    if (!sortBy) sortBy = require('lodash/sortBy');

    const socket = new net.Socket();

    socket.on('connect', () => {
      const headers = [
        '-V',
        '-r',
        '-' + textEditor.getPath(),
        '-' + (config.xmlCatalog || ''),
        ...schemaProps.map(schema => '-' + schema.lang + ' ' + (schema.path || '')),
        '\n',
      ].join('\n');

      socket.write(headers);
      socket.end(textEditor.getText());
    });

    socket.on('data', data => {
      const validationMessages = data
        .toString()
        .trim()
        .split(/\r?\n/)
        .map(parseMessage(textEditor, schemaProps, config))
        .reduce(
          (result, current) => (current ? result.concat(current) : result),
          []
        );

      messages.push(...validationMessages);
    });

    socket.on('close', () => resolve(sortBy(messages, 'range[0][0]')));
    socket.on('error', err => {
      socket.destroy();
      reject(err);
    });

    socket.connect({ port: server.port });
  });

module.exports = validate;
