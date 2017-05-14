
import regex from '../regex';
import requestSuggestions from './requestSuggestions';
import { getEndBracketPosition, buildDescriptionString, buildAttributeStrings } from './util';

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

const getAttributeNameProps = (precedingLineText) => {
  const match = precedingLineText.match(regex.attStartFromAttName);
  return match ? { prefix: match[1] || '', column: match.index } : null;
};

const attributeNameFilter = prefix =>
  ({ value }) => value.startsWith(prefix);

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

  return requestSuggestions(sharedConfig, {
    type: 'N',
    body: textBeforeAttribute + textAfterAttribute,
    filterFn: attributeNameFilter(prefix),
    builderFn: buildAttributeNameSuggestion(prefix, addSuffix),
  });
};

export default getAttributeNameSuggestions;
