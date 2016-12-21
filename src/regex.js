
const nameStartChar = [
  ':',
  'A-Z',
  '_',
  'a-z',
  '\\xC0-\\xD6',
  '\\xD8-\\xF6',
  '\\u00F8-\\u02FF',
  '\\u0370-\\u037D',
  '\\u037F-\\u1FFF',
  '\\u200C-\\u200D',
  '\\u2070-\\u218F',
  '\\u2C00-\\u2FEF',
  '\\u3001-\\uD7FF',
  '\\uF900-\\uFDCF',
  '\\uFDF0-\\uFFFD',
  // '\\u10000-\\uEFFFF',
].join('');

const nameChar = [
  nameStartChar,
  '\\-',
  '\\.',
  '0-9',
  '\\u00B7',
  '\\u0300-\\u036F',
  '\\u203F-\\u2040',
].join('');

const spaceChar = [
  '\\u0020',
  '\\u0009',
  '\\u000D',
  '\\u000A',
].join('');

export default {
  tagNamePI: new RegExp(`<(!|/|/?[${nameStartChar}][${nameChar}]*)?$`),
  attStartFromAttName: new RegExp(`(?:^|[${spaceChar}])([${nameStartChar}][${nameChar}]*)?$`),
  attStartFromAttValueDouble: new RegExp(`([${nameStartChar}][${nameChar}]*)="([^"]*)?`),
  attStartFromAttValueSingle: new RegExp(`([${nameStartChar}][${nameChar}]*)='([^']*)?`),
  attEndFromAttName: new RegExp('^[' + nameChar + ']*=(".*?"|\'.*?\')'),
  endToken: new RegExp(`(?:^|["${spaceChar}])([^${spaceChar}]+)$`),
  spaces: new RegExp(`[${spaceChar}]+`),
  url: /^(?:[a-z][a-z0-9+\-.]*:)?\/\//i,
  previousTagBracket: /"[^<]*?"|'[^<]*?'|<\/|<|>/g,
  nextTagBracket: /"[^<]*?"|'[^<]*?'|<|\/>|>/g,
  // the sax module doesn't preserve linebreak characters in DOCTYPE
  // -> use \s* instead of \s+
  publicId: /\s*[^\s]+\s*PUBLIC\s*("([^"]+)"|'([^']+)')/,
};
