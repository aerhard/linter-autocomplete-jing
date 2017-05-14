
import { join } from '../fp';
import regex from '../regex';

export const getEndBracketPosition = ({ editor, bufferPosition }) => {
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
export const buildDescriptionString = join(' \u2013 ');

export const buildAttributeStrings = (attribute, index, addSuffix) => {
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
