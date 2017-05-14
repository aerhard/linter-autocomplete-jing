
import requestSuggestions from './requestSuggestions';
import { getEndBracketPosition, buildDescriptionString, buildAttributeStrings } from './util';

const buildElementSuggestion = (replacementPrefix, addSuffix) =>
  ({ value, empty, closing, attributes = [], documentation, snippet: preDefinedSnippet }) => {
    if (preDefinedSnippet) {
      return {
        snippet: preDefinedSnippet,
        displayText: value,
        type: 'tag',
        replacementPrefix,
        description: documentation,
        retrigger: false,
      };
    }

    if (closing) {
      const snippet = addSuffix
        ? '/' + value + '>'
        : '/' + value;

      return {
        snippet,
        displayText: snippet,
        type: 'tag',
        replacementPrefix,
        description: 'Closing Tag',
        retrigger: false,
      };
    }

    const [tagName, nsUri] = value.split('#');

    let index = 0;

    const tagNameSnippet = tagName.replace(/\*/g, () => `\${${++index}}`);

    // don't retrigger autocomplete when a wildcard end tag snippet gets inserted
    const hasEndTagSnippet = index > 0;

    let retrigger;
    let snippet;
    let displayText;
    if (addSuffix) {
      let nsSnippet;

      if (typeof nsUri === 'string') {
        const nsUriSnippet = nsUri === '*' ? `\${${++index}}` : nsUri;
        nsSnippet = [`xmlns="${nsUriSnippet}"`];
        displayText = nsUri === ''
          ? `${tagName} [no namespace]`
          : `${tagName} (${nsUri})`;
      } else {
        nsSnippet = [];
        displayText = tagName;
      }

      const attributeSnippets = attributes.map((attribute) => {
        const { snippet: attributeSnippet, index: newIndex } =
          buildAttributeStrings(attribute, index, true);
        index = newIndex;
        return attributeSnippet;
      });

      const startTagContent = [tagNameSnippet]
        .concat(nsSnippet)
        .concat(attributeSnippets)
        .join(' ');

      snippet = empty
        ? startTagContent + '/>'
        : `${startTagContent}>\${${++index}}</${tagNameSnippet}>`;

      retrigger = !hasEndTagSnippet && index > 0;
    } else {
      displayText = tagName;
      snippet = tagNameSnippet;
      retrigger = false;
    }

    return {
      snippet,
      displayText,
      type: 'tag',
      replacementPrefix,
      description: documentation ? buildDescriptionString(documentation) : undefined,
      retrigger,
    };
  };

const piSuggestions = [{
  value: '!--  -->',
  snippet: '!-- ${1} -->', // eslint-disable-line no-template-curly-in-string
  documentation: 'Comment',
}, {
  value: '![CDATA[]]>',
  snippet: '![CDATA[${1}]]>', // eslint-disable-line no-template-curly-in-string
  documentation: 'CDATA Section',
}];

const elementSuggestionFilter = prefix =>
  ({ value, closing }) => (
    closing
      ? ('/' + value).startsWith(prefix)
      : value.startsWith(prefix)
  );

const getElementPISuggestions = (sharedConfig, tagNamePIPrefix) => {
  const { options } = sharedConfig;
  const { editor, bufferPosition } = options;

  const body = editor.getTextInBufferRange([
    [0, 0],
    [bufferPosition.row, bufferPosition.column - tagNamePIPrefix.length - 1],
  ]);

  const addSuffix = !getEndBracketPosition(options);

  return requestSuggestions(sharedConfig, {
    type: 'E',
    body,
    clientData: piSuggestions,
    filterFn: elementSuggestionFilter(tagNamePIPrefix),
    builderFn: buildElementSuggestion(tagNamePIPrefix, addSuffix),
  });
};

export default getElementPISuggestions;
