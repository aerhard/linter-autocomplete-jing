
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
      range: helpers.generateRange(textEditor, Number(line) - 1),
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
    ? helpers.generateRange(textEditor, schema.line)
    : [[0, 0], [0, 0]];

  return {
    type: 'Warning',
    html: label + html,
    filePath,
    range,
  };
};

export default parseMessage;
