
import { compact, filter, find, flow, join, map } from 'lodash/fp';
import regex from './regex';
import serverProcess from './serverProcess';

const serverProcessInstance = serverProcess.getInstance();

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
    }
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
          position = range.start;
        }
        stop();
      }
    }
  );

  return position;
};

// linebreaks are not (yet?) supported in descriptions of autocomplete-plus
// suggestions, see https://github.com/atom/autocomplete-plus/pull/598;
// for now, this autocomplete provider uses n-dashs as a separator
const buildDescriptionString = join(' \u2013 ');

const buildAttributeStrings = (attribute, index, addSuffix) => {
  const [qName, nsUri] = attribute.split('#');

  if (nsUri) {
    const nsPrefix = `ns\${${++index}}`;
    const attNameSnippet = qName.replace(/\*/g, () => `\${${++index}}`);
    const nsUriSnippet = nsUri === '*' ? `\${${++index}}` : nsUri;
    const suffix = addSuffix
      ? `="\${${++index}}"`
      : '';

    return {
      snippet: `${nsPrefix}:${attNameSnippet}${suffix} xmlns:${nsPrefix}="${nsUriSnippet}"`,
      displayText: `${qName} (${nsUri})`,
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
    rightLabel: listItem ? 'List Value' : 'Value',
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
      rightLabel: 'Attribute',
      replacementPrefix,
      description: documentation ? buildDescriptionString(documentation) : undefined,
      retrigger: addSuffix,
    };
  };

const buildElementSuggestion = (replacementPrefix, addSuffix) =>
  ({ value, closing, attributes = [], documentation }) => {
    if (closing) {
      const snippet = addSuffix
        ? '/' + value + '>'
        : '/' + value;

      return {
        snippet,
        displayText: snippet,
        type: 'tag',
        rightLabel: 'Element',
        replacementPrefix,
        retrigger: false,
      };
    }

    const [tagName, nsUri] = value.split('#');

    let index = 0;

    const tagNameSnippet = tagName.replace(/\*/g, () => `\${${++index}}`);
    const nsUriSnippet = nsUri === '*' ? `\${${++index}}` : nsUri;

    let snippet;
    let displayText;
    if (addSuffix) {
      displayText = nsUriSnippet ? `${tagName} (${nsUri})` : tagName;

      const nsSnippet = nsUri
        ? [`xmlns="${nsUriSnippet}"`]
        : [];

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

      snippet = `${startTagContent}>\${${++index}}</${tagNameSnippet}>`;
    } else {
      displayText = tagName;
      snippet = tagNameSnippet;
    }

    return {
      snippet,
      displayText,
      type: 'tag',
      rightLabel: 'Element',
      replacementPrefix,
      description: documentation ? buildDescriptionString(documentation) : undefined,
      retrigger: addSuffix,
    };
  };

const getTagNamePrefix = (precedingLineText) => {
  const match = precedingLineText.match(regex.tagName);
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
    }
  );

  return result ? { name: result[1], prefix: result[2] || '' } : null;
};

const getQuotedScope = find(
  scope => scope === 'string.quoted.double.xml' || scope === 'string.quoted.single.xml'
);

const includesTagScope = scopesArray =>
  scopesArray.some(item => item === 'meta.tag.xml' || item === 'meta.tag.no-content.xml');

const buildHeaders = (editorPath, catalogPath, { lang, path: schemaPath }, type, fragment) => [
  'A',
  type,
  fragment || '',
  'r',
  'UTF-8',
  editorPath,
  catalogPath || '',
  lang + ' ' + (schemaPath || ''),
];

const getSuggestions = (sharedConfig, suggestionOptions) => {
  const { options, xmlCatalog, port, currentSchemaProps } = sharedConfig;
  const { editor } = options;
  const { type, fragment, body, filterFn, builderFn } = suggestionOptions;

  const headers =
    buildHeaders(editor.getPath(), xmlCatalog, currentSchemaProps, type, fragment);

  return serverProcessInstance.sendRequest(headers, body, port)
    .then(flow(
      JSON.parse,
      filter(filterFn),
      map(builderFn),
      compact
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

  return getSuggestions(sharedConfig, {
    type: 'V',
    body: editor.getTextInBufferRange([[0, 0], endBracketPosition]) + '>',
    fragment,
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

  const followingText =
    editor.getTextInBufferRange([bufferPosition, endBracketPosition]) + '>';

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

const getElementSuggestions = (sharedConfig, tagNamePrefix) => {
  const { options } = sharedConfig;
  const { editor, bufferPosition } = options;

  const body = editor.getTextInBufferRange([
    [0, 0],
    [bufferPosition.row, bufferPosition.column - tagNamePrefix.length - 1],
  ]);

  const addSuffix = !getEndBracketPosition(options);

  return getSuggestions(sharedConfig, {
    type: 'E',
    body,
    filterFn: elementSuggestionFilter(tagNamePrefix),
    builderFn: buildElementSuggestion(tagNamePrefix, addSuffix),
  });
};

const suggest = (options, { autocompleteScope, xmlCatalog }) => ([{ port }, { schemaProps }]) => {
  const currentSchemaProps =
    find(({ lang }) => !!autocompleteScope[lang], schemaProps) ||
    { type: 'none' };

  const scopesArray = options.scopeDescriptor.getScopesArray();
  const sharedConfig = { options, xmlCatalog, port, currentSchemaProps };
  const precedingLineText = getPrecedingLineText(options);
  const tagNamePrefix = getTagNamePrefix(precedingLineText);

  if (tagNamePrefix !== null) {
    return getElementSuggestions(sharedConfig, tagNamePrefix);
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

module.exports = suggest;
