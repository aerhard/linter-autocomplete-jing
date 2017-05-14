
import regex from '../regex';
import getAttributeNameSuggestions from './getAttributeNameSuggestions';
import getAttributeValueSuggestions from './getAttributeValueSuggestions';
import getElementPISuggestions from './getElementPISuggestions';

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

const getTagNamePIPrefix = (precedingLineText) => {
  const match = precedingLineText.match(regex.tagNamePI);
  return match ? match[1] || '' : null;
};

const getQuotedScope = scopes => scopes.find(
  scope => scope === 'string.quoted.double.xml' || scope === 'string.quoted.single.xml',
);

const includesTagScope = scopesArray =>
  scopesArray.some(item => item.startsWith('meta.tag.xml') || item === 'meta.tag.no-content.xml');


const getPrecedingLineText = ({ editor, bufferPosition }) =>
  editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);

const suggest = (options, { autocompleteScope, wildcardSuggestions }) => ([
  ,
  { schemaProps, xmlCatalog, xIncludeAware, xIncludeFixupBaseUris, xIncludeFixupLanguage },
]) => {
  const currentSchemaProps =
    schemaProps.find(({ lang }) => !!autocompleteScope[lang]) ||
    { type: 'none' };

  const scopesArray = options.scopeDescriptor.getScopesArray();
  const sharedConfig = {
    options,
    xmlCatalog,
    xIncludeAware,
    xIncludeFixupBaseUris,
    xIncludeFixupLanguage,
    currentSchemaProps,
    wildcardSuggestions,
  };
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
