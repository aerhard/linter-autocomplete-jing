
import { flow, trim, split, map, compact, concat, sortBy, filter, identity } from '../fp';

import ServerProcess from '../ServerProcess';
import parseMessage from './parseMessage';

const serverProcessInstance = ServerProcess.getInstance();

const buildHeaders = (textEditor, localConfig) => {
  const {
    schemaProps,
    xmlCatalog,
    xIncludeAware,
    xIncludeFixupBaseUris,
    xIncludeFixupLanguage,
  } = localConfig;

  const xIncludeOption = xIncludeAware ? 'x' : '';
  const xIncludeFixupOption = xIncludeFixupBaseUris ? 'f' : '';
  const xIncludeLanguageOption = xIncludeFixupLanguage ? 'l' : '';

  return [
    'V',
    'r' + xIncludeOption + xIncludeFixupOption + xIncludeLanguageOption,
    'UTF-8',
    textEditor.getPath(),
    xmlCatalog || '',
    ...schemaProps.map(schema => schema.lang + ' ' + (schema.path || '')),
  ];
};

const requestValidation = (textEditor, config, localConfig) => {
  const { schemaProps, messages } = localConfig;

  const headers = buildHeaders(textEditor, localConfig);
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

export default requestValidation;
