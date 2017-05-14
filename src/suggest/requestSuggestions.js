import { compact, filter, flow, map } from '../fp';
import ServerProcess from '../ServerProcess';

const serverProcessInstance = ServerProcess.getInstance();

const wildcardOptions = {
  none: '',
  localparts: 'w',
  all: 'wn',
};

const buildHeaders = (sharedConfig, suggestionOptions) => {
  const {
    options: { editor },
    xmlCatalog,
    xIncludeAware,
    xIncludeFixupBaseUris,
    xIncludeFixupLanguage,
    currentSchemaProps: { lang, path: schemaPath },
    wildcardSuggestions,
  } = sharedConfig;

  const {
    type,
    fragment,
    splitPoint,
  } = suggestionOptions;

  const processingOptions = [
    'r',
    wildcardOptions[wildcardSuggestions],
    xIncludeAware ? 'x' : '',
    xIncludeFixupBaseUris ? 'f' : '',
    xIncludeFixupLanguage ? 'l' : '',
  ].join('');

  return [
    'A',
    type,
    fragment || '',
    splitPoint || '',
    processingOptions,
    'UTF-8',
    editor.getPath(),
    xmlCatalog || '',
    lang + ' ' + (schemaPath || ''),
  ];
};

const requestSuggestions = (sharedConfig, suggestionOptions) => {
  const { body, clientData, filterFn, builderFn } = suggestionOptions;

  const headers = buildHeaders(sharedConfig, suggestionOptions);

  return serverProcessInstance.sendRequest(headers, body)
    .then(flow(
      JSON.parse,
      data => (clientData ? data.concat(clientData) : data),
      filter(filterFn),
      map(builderFn),
      compact,
    ))
    .catch(() => []);
};

export default requestSuggestions;
