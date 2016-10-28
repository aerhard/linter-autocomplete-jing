
import { flow, trim, split, map, compact, concat, sortBy, filter, identity } from './fp';

import ServerProcess from './ServerProcess';

const serverProcessInstance = ServerProcess.getInstance();

const helpers = require('atom-linter');

const messageRegex =
  /^([a-z0-9.]+?):((.*?):\s?)?((\d+):)?(?:\d+:\s)?(error|fatal|warning):\s(.*)$/;

const parseMessage = (textEditor, schemaProps, config) => function(str) {
  const match = messageRegex.exec(str);
  if (!match) {
    console.error(`Could not parse message "${str}"`); // eslint-disable-line
    return null;
  }

  const [, lang,, systemId,, line, level, text] = match;

  const filePath = textEditor.getPath();

  const html = document
    .createElement('div')
    .appendChild(document.createTextNode(text))
    .parentNode
    .innerHTML;

  if (systemId === filePath) {
    return {
      type: level === 'warning' ? 'Warning' : 'Error',
      html: lang === 'none' ? html : `<span class="badge badge-flexible">${lang.toUpperCase()}</span> ${html}`,
      filePath,
      range: helpers.rangeFromLineNumber(textEditor, Number(line) - 1),
    };
  }

  if (!config.displaySchemaWarnings && level === 'warning') {
    return null;
  }

  const label = level === 'warning'
    ? 'Schema parser warning: '
    : 'Could not process schema or catalog: ';

  const schema = schemaProps.find(sch => sch.path === systemId && sch.lang === lang);
  const range = schema
    ? helpers.rangeFromLineNumber(textEditor, schema.line)
    : [[0, 0], [0, 0]];

  return {
    type: 'Warning',
    html: label + html,
    filePath,
    range,
  };
};

const validate = (textEditor, config) => ([, { schemaProps, messages, xmlCatalog }]) => {
  const headers = [
    'V',
    'r',
    'UTF-8',
    textEditor.getPath(),
    xmlCatalog || '',
    ...schemaProps.map(schema => schema.lang + ' ' + (schema.path || '')),
  ];
  const body = textEditor.getText();

  return serverProcessInstance.sendRequest(headers, body)
    .then(
      flow(
        trim,
        split(/\r?\n/),
        filter(identity),
        map(parseMessage(textEditor, schemaProps, config)),
        compact,
        concat(messages),
        sortBy('range[0][0]'),
      ),
    );
};

export default validate;
