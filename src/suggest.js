
import { compact, filter, flow, join, map } from './fp';
import regex from './regex';
import ServerProcess from './ServerProcess';

const serverProcessInstance = ServerProcess.getInstance();

const getEndToken = (str) => {
  const match = str.match(regex.endToken);
  return match ? match[1] : '';
};

const getPreviousTagBracket = ({ editor, bufferPosition }) => {
  let bracket = null;

  editor.backwardsScanInBufferRange(
    regex.previousTagBracket,
    [bufferPosition, [0, 0]],
    ({ matchText, stop }) => {
      if (!matchText.startsWith('\'') && !matchText.startsWith('"')) {
        bracket = matchText;
        stop();
      }
    },
  );

  return bracket;
};

const getEndBracketPosition = ({ editor, bufferPosition }) => {
  let position = null;

  editor.scanInBufferRange(
    regex.nextTagBracket,
    [bufferPosition, editor.getBuffer().getEndPosition()],
    ({ matchText, range, stop }) => {
      if (!matchText.startsWith('\'') && !matchText.startsWith('"')) {
        if (matchText !== '<') {
          position = [range.start.row, range.start.column + matchText.length];
        }
        stop();
      }
    },
  );

  return position;
};

// linebreaks are not (yet?) supported in descriptions of autocomplete-plus
// suggestions, see https://github.com/atom/autocomplete-plus/pull/598;
// for now, this autocomplete provider uses n-dashs as a separator
const buildDescriptionString = join(' \u2013 ');

const buildAttributeStrings = (attribute, index, addSuffix) => {
  const [qName, nsUri] = attribute.split('#');

  if (typeof nsUri === 'string') {
    const nsPrefix = `ns\${${++index}}`;
    const attNameSnippet = qName.replace(/\*/g, () => `\${${++index}}`);
    const nsUriSnippet = nsUri === '*' ? `\${${++index}}` : nsUri;
    const suffix = addSuffix
      ? `="\${${++index}}"`
      : '';
    const displayText = nsUri === ''
      ? `${qName} [no namespace]`
      : `${qName} (${nsUri})`;

    return {
      snippet: `${nsPrefix}:${attNameSnippet}${suffix} xmlns:${nsPrefix}="${nsUriSnippet}"`,
      displayText,
      index,
    };
  }

  const attNameSnippet = qName.replace(/\*/g, () => `\${${++index}}`);
  const suffix = addSuffix
    ? `="\${${++index}}"`
    : '';

  return {
    snippet: `${attNameSnippet}${suffix}`,
    displayText: qName,
    index,
  };
};

const escape = (quoteChar) => {
  const quoteReplacements = {
    '"': '&quot;',
    '\'': '&apos;',
  };
  const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    [quoteChar]: quoteReplacements[quoteChar],
  };

  const reg = new RegExp(Object.keys(replacements).join('|'), 'g');

  return str => str.replace(reg, match => replacements[match]);
};

const escapeWithDblQuotes = escape('"');
const escapeWithSingleQuotes = escape('\'');

const buildAttributeValueSuggestion = (prefix, endToken, hasDblQuotes) =>
  ({ listItem, value, documentation }) => ({
    snippet: hasDblQuotes ? escapeWithDblQuotes(value) : escapeWithSingleQuotes(value),
    displayText: value,
    type: 'value',
    rightLabel: listItem ? 'List Item' : undefined,
    replacementPrefix: listItem ? endToken : prefix,
    description: documentation ? buildDescriptionString(documentation) : undefined,
  });

const buildAttributeNameSuggestion = (replacementPrefix, addSuffix) =>
  ({ value, documentation }) => {
    const { snippet, displayText } = buildAttributeStrings(value, 0, addSuffix);

    return {
      snippet,
      displayText,
      type: 'attribute',
      replacementPrefix,
      description: documentation ? buildDescriptionString(documentation) : undefined,
      retrigger: addSuffix,
    };
  };

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

const getTagNamePIPrefix = (precedingLineText) => {
  const match = precedingLineText.match(regex.tagNamePI);
  return match ? match[1] || '' : null;
};

const getAttributeNameProps = (precedingLineText) => {
  const match = precedingLineText.match(regex.attStartFromAttName);
  return match ? { prefix: match[1] || '', column: match.index } : null;
};

const getAttributeValueProps = ({ editor, bufferPosition }, hasDblQuotes) => {
  const attStartRegex = hasDblQuotes
    ? regex.attStartFromAttValueDouble
    : regex.attStartFromAttValueSingle;

  let result;

  editor.backwardsScanInBufferRange(
    attStartRegex,
    [bufferPosition, [0, 0]],
    ({ match, stop }) => {
      result = match;
      stop();
    },
  );

  return result ? { name: result[1], prefix: result[2] || '' } : null;
};

const getQuotedScope = scopes => scopes.find(
  scope => scope === 'string.quoted.double.xml' || scope === 'string.quoted.single.xml',
);

const includesTagScope = scopesArray =>
  scopesArray.some(item => item.startsWith('meta.tag.xml') || item === 'meta.tag.no-content.xml');

const wildcardOptions = {
  none: '',
  localparts: 'w',
  all: 'wn',
};

const buildHeaders = (editorPath, xmlCatalog, wildcardSuggestions,
  { lang, path: schemaPath }, type, fragment, splitPoint) => [
    'A',
    type,
    fragment || '',
    splitPoint || '',
    'r' + wildcardOptions[wildcardSuggestions],
    'UTF-8',
    editorPath,
    xmlCatalog || '',
    lang + ' ' + (schemaPath || ''),
  ];

const getSuggestions = (sharedConfig, suggestionOptions) => {
  const { options, xmlCatalog, currentSchemaProps, wildcardSuggestions } = sharedConfig;
  const { editor } = options;
  const { type, fragment, body, splitPoint, clientData, filterFn, builderFn } = suggestionOptions;

  const headers = buildHeaders(editor.getPath(), xmlCatalog, wildcardSuggestions,
    currentSchemaProps, type, fragment, splitPoint);

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

const elementSuggestionFilter = prefix =>
  ({ value, closing }) => (
    closing
      ? ('/' + value).startsWith(prefix)
      : value.startsWith(prefix)
  );

const attributeValueFilter = (prefix, endToken) =>
  ({ value, listItem }) => value.startsWith(listItem ? endToken : prefix);

const attributeNameFilter = prefix =>
  ({ value }) => value.startsWith(prefix);

const getPrecedingLineText = ({ editor, bufferPosition }) =>
  editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);

const getAttributeValueSuggestions = (sharedConfig, precedingLineText, quotedScope) => {
  const { options } = sharedConfig;
  const { editor } = options;

  const hasDblQuotes = quotedScope === 'string.quoted.double.xml';
  const attributeValueProps = getAttributeValueProps(options, hasDblQuotes);

  if (!attributeValueProps) return [];

  const endBracketPosition = getEndBracketPosition(options);
  if (!endBracketPosition) return [];

  const { name: fragment, prefix } = attributeValueProps;

  const endToken = getEndToken(prefix);

  const head = editor.getTextInBufferRange([[0, 0], endBracketPosition]);
  const splitPoint = Buffer.byteLength(head);

  return getSuggestions(sharedConfig, {
    type: 'V',
    body: editor.getText(),
    fragment,
    splitPoint,
    filterFn: attributeValueFilter(prefix, endToken),
    builderFn: buildAttributeValueSuggestion(prefix, endToken, hasDblQuotes),
  });
};

const getAttributeNameSuggestions = (sharedConfig, precedingLineText) => {
  const { options } = sharedConfig;
  const { editor, bufferPosition } = options;

  const attributeNameProps = getAttributeNameProps(precedingLineText);
  if (!attributeNameProps) return [];

  const endBracketPosition = getEndBracketPosition(options);
  if (!endBracketPosition) return [];

  const { prefix, column: prefixStartColumn } = attributeNameProps;

  const textBeforeAttribute =
    editor.getTextInBufferRange([[0, 0], [bufferPosition.row, prefixStartColumn]]);

  const followingText = editor.getTextInBufferRange([bufferPosition, endBracketPosition]);

  const match = followingText.match(regex.attEndFromAttName);
  const textAfterAttribute = match
    ? followingText.substr(match[0].length)
    : followingText;
  const addSuffix = !match;

  return getSuggestions(sharedConfig, {
    type: 'N',
    body: textBeforeAttribute + textAfterAttribute,
    filterFn: attributeNameFilter(prefix),
    builderFn: buildAttributeNameSuggestion(prefix, addSuffix),
  });
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

const getElementPISuggestions = (sharedConfig, tagNamePIPrefix) => {
  const { options } = sharedConfig;
  const { editor, bufferPosition } = options;

  const body = editor.getTextInBufferRange([
    [0, 0],
    [bufferPosition.row, bufferPosition.column - tagNamePIPrefix.length - 1],
  ]);

  const addSuffix = !getEndBracketPosition(options);

  return getSuggestions(sharedConfig, {
    type: 'E',
    body,
    clientData: piSuggestions,
    filterFn: elementSuggestionFilter(tagNamePIPrefix),
    builderFn: buildElementSuggestion(tagNamePIPrefix, addSuffix),
  });
};

const suggest = (options, { autocompleteScope, wildcardSuggestions }) =>
  ([, { schemaProps, xmlCatalog }]) => {
    const currentSchemaProps =
      schemaProps.find(({ lang }) => !!autocompleteScope[lang]) ||
      { type: 'none' };

    const scopesArray = options.scopeDescriptor.getScopesArray();
    const sharedConfig = { options, xmlCatalog, currentSchemaProps, wildcardSuggestions };
    const precedingLineText = getPrecedingLineText(options);
    const tagNamePIPrefix = getTagNamePIPrefix(precedingLineText);

    if (tagNamePIPrefix !== null) {
      return getElementPISuggestions(sharedConfig, tagNamePIPrefix);
    }

    if (includesTagScope(scopesArray)) {
      const quotedScope = getQuotedScope(scopesArray);

      if (quotedScope) {
        return getAttributeValueSuggestions(sharedConfig, precedingLineText, quotedScope);
      }

      if (getPreviousTagBracket(options) === '<') {
        return getAttributeNameSuggestions(sharedConfig, precedingLineText);
      }
    }

    return [];
  };

export default suggest;
