
import regex from '../regex';
import requestSuggestions from './requestSuggestions';
import { getEndBracketPosition, buildDescriptionString } from './util';

const getEndToken = (str) => {
  const match = str.match(regex.endToken);
  return match ? match[1] : '';
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

const attributeValueFilter = (prefix, endToken) =>
  ({ value, listItem }) => value.startsWith(listItem ? endToken : prefix);

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

  return requestSuggestions(sharedConfig, {
    type: 'V',
    body: editor.getText(),
    fragment,
    splitPoint,
    filterFn: attributeValueFilter(prefix, endToken),
    builderFn: buildAttributeValueSuggestion(prefix, endToken, hasDblQuotes),
  });
};

export default getAttributeValueSuggestions;
