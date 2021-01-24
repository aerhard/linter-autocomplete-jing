export const nameStartChar = [
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
].join('')

export const nameChar = [
  nameStartChar,
  '-',
  '.',
  '0-9',
  '\\u00B7',
  '\\u0300-\\u036F',
  '\\u203F-\\u2040',
].join('')

export const spaceChar = ' \t\r\n'
