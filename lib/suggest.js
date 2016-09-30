'use strict';

var _fp = require('lodash/fp');

var _regex = require('./regex');

var _regex2 = _interopRequireDefault(_regex);

var _serverProcess = require('./serverProcess');

var _serverProcess2 = _interopRequireDefault(_serverProcess);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serverProcessInstance = _serverProcess2.default.getInstance();

var getEndToken = function getEndToken(str) {
  var match = str.match(_regex2.default.endToken);
  return match ? match[1] : '';
};

var getPreviousTagBracket = function getPreviousTagBracket(_ref) {
  var editor = _ref.editor;
  var bufferPosition = _ref.bufferPosition;

  var bracket = null;

  editor.backwardsScanInBufferRange(_regex2.default.previousTagBracket, [bufferPosition, [0, 0]], function (_ref2) {
    var matchText = _ref2.matchText;
    var stop = _ref2.stop;

    if (!matchText.startsWith('\'') && !matchText.startsWith('"')) {
      bracket = matchText;
      stop();
    }
  });

  return bracket;
};

var getEndBracketPosition = function getEndBracketPosition(_ref3) {
  var editor = _ref3.editor;
  var bufferPosition = _ref3.bufferPosition;

  var position = null;

  editor.scanInBufferRange(_regex2.default.nextTagBracket, [bufferPosition, editor.getBuffer().getEndPosition()], function (_ref4) {
    var matchText = _ref4.matchText;
    var range = _ref4.range;
    var stop = _ref4.stop;

    if (!matchText.startsWith('\'') && !matchText.startsWith('"')) {
      if (matchText !== '<') {
        position = range.start;
      }
      stop();
    }
  });

  return position;
};

// linebreaks are not (yet?) supported in descriptions of autocomplete-plus
// suggestions, see https://github.com/atom/autocomplete-plus/pull/598;
// for now, this autocomplete provider uses n-dashs as a separator
var buildDescriptionString = (0, _fp.join)(' – ');

var buildAttributeStrings = function buildAttributeStrings(attribute, index, addSuffix) {
  var _attribute$split = attribute.split('#');

  var qName = _attribute$split[0];
  var nsUri = _attribute$split[1];


  if (typeof nsUri === 'string') {
    var nsPrefix = 'ns${' + ++index + '}';
    var _attNameSnippet = qName.replace(/\*/g, function () {
      return '${' + ++index + '}';
    });
    var nsUriSnippet = nsUri === '*' ? '${' + ++index + '}' : nsUri;
    var _suffix = addSuffix ? '="${' + ++index + '}"' : '';
    var displayText = nsUri === '' ? qName + ' [no namespace]' : qName + ' (' + nsUri + ')';

    return {
      snippet: nsPrefix + ':' + _attNameSnippet + _suffix + ' xmlns:' + nsPrefix + '="' + nsUriSnippet + '"',
      displayText: displayText,
      index: index
    };
  }

  var attNameSnippet = qName.replace(/\*/g, function () {
    return '${' + ++index + '}';
  });
  var suffix = addSuffix ? '="${' + ++index + '}"' : '';

  return {
    snippet: '' + attNameSnippet + suffix,
    displayText: qName,
    index: index
  };
};

var escape = function escape(quoteChar) {
  var _replacements;

  var quoteReplacements = {
    '"': '&quot;',
    '\'': '&apos;'
  };
  var replacements = (_replacements = {
    '&': '&amp;',
    '<': '&lt;'
  }, _replacements[quoteChar] = quoteReplacements[quoteChar], _replacements);

  var reg = new RegExp(Object.keys(replacements).join('|'), 'g');

  return function (str) {
    return str.replace(reg, function (match) {
      return replacements[match];
    });
  };
};

var escapeWithDblQuotes = escape('"');
var escapeWithSingleQuotes = escape('\'');

var buildAttributeValueSuggestion = function buildAttributeValueSuggestion(prefix, endToken, hasDblQuotes) {
  return function (_ref5) {
    var listItem = _ref5.listItem;
    var value = _ref5.value;
    var documentation = _ref5.documentation;
    return {
      snippet: hasDblQuotes ? escapeWithDblQuotes(value) : escapeWithSingleQuotes(value),
      displayText: value,
      type: 'value',
      rightLabel: listItem ? 'List Item' : undefined,
      replacementPrefix: listItem ? endToken : prefix,
      description: documentation ? buildDescriptionString(documentation) : undefined
    };
  };
};

var buildAttributeNameSuggestion = function buildAttributeNameSuggestion(replacementPrefix, addSuffix) {
  return function (_ref6) {
    var value = _ref6.value;
    var documentation = _ref6.documentation;

    var _buildAttributeString = buildAttributeStrings(value, 0, addSuffix);

    var snippet = _buildAttributeString.snippet;
    var displayText = _buildAttributeString.displayText;


    return {
      snippet: snippet,
      displayText: displayText,
      type: 'attribute',
      replacementPrefix: replacementPrefix,
      description: documentation ? buildDescriptionString(documentation) : undefined,
      retrigger: addSuffix
    };
  };
};

var buildElementSuggestion = function buildElementSuggestion(replacementPrefix, addSuffix) {
  return function (_ref7) {
    var value = _ref7.value;
    var closing = _ref7.closing;
    var _ref7$attributes = _ref7.attributes;
    var attributes = _ref7$attributes === undefined ? [] : _ref7$attributes;
    var documentation = _ref7.documentation;
    var preDefinedSnippet = _ref7.snippet;

    if (preDefinedSnippet) {
      return {
        snippet: preDefinedSnippet,
        displayText: value,
        type: 'tag',
        replacementPrefix: replacementPrefix,
        retrigger: false
      };
    }

    if (closing) {
      var _snippet = addSuffix ? '/' + value + '>' : '/' + value;

      return {
        snippet: _snippet,
        displayText: _snippet,
        type: 'tag',
        replacementPrefix: replacementPrefix,
        retrigger: false
      };
    }

    var _value$split = value.split('#');

    var tagName = _value$split[0];
    var nsUri = _value$split[1];


    var index = 0;

    var tagNameSnippet = tagName.replace(/\*/g, function () {
      return '${' + ++index + '}';
    });

    // don't retrigger autocomplete when a wildcard end tag snippet gets inserted
    var retrigger = index > 0 ? false : addSuffix;

    var snippet = void 0;
    var displayText = void 0;
    if (addSuffix) {
      var nsSnippet = void 0;

      if (typeof nsUri === 'string') {
        var nsUriSnippet = nsUri === '*' ? '${' + ++index + '}' : nsUri;
        nsSnippet = ['xmlns="' + nsUriSnippet + '"'];
        displayText = nsUri === '' ? tagName + ' [no namespace]' : tagName + ' (' + nsUri + ')';
      } else {
        nsSnippet = [];
        displayText = tagName;
      }

      var attributeSnippets = attributes.map(function (attribute) {
        var _buildAttributeString2 = buildAttributeStrings(attribute, index, true);

        var attributeSnippet = _buildAttributeString2.snippet;
        var newIndex = _buildAttributeString2.index;

        index = newIndex;
        return attributeSnippet;
      });

      var startTagContent = [tagNameSnippet].concat(nsSnippet).concat(attributeSnippets).join(' ');

      snippet = startTagContent + '>${' + ++index + '}</' + tagNameSnippet + '>';
    } else {
      displayText = tagName;
      snippet = tagNameSnippet;
    }

    return {
      snippet: snippet,
      displayText: displayText,
      type: 'tag',
      replacementPrefix: replacementPrefix,
      description: documentation ? buildDescriptionString(documentation) : undefined,
      retrigger: retrigger
    };
  };
};

var getTagNamePIPrefix = function getTagNamePIPrefix(precedingLineText) {
  var match = precedingLineText.match(_regex2.default.tagNamePI);
  return match ? match[1] || '' : null;
};

var getAttributeNameProps = function getAttributeNameProps(precedingLineText) {
  var match = precedingLineText.match(_regex2.default.attStartFromAttName);
  return match ? { prefix: match[1] || '', column: match.index } : null;
};

var getAttributeValueProps = function getAttributeValueProps(_ref8, hasDblQuotes) {
  var editor = _ref8.editor;
  var bufferPosition = _ref8.bufferPosition;

  var attStartRegex = hasDblQuotes ? _regex2.default.attStartFromAttValueDouble : _regex2.default.attStartFromAttValueSingle;

  var result = void 0;

  editor.backwardsScanInBufferRange(attStartRegex, [bufferPosition, [0, 0]], function (_ref9) {
    var match = _ref9.match;
    var stop = _ref9.stop;

    result = match;
    stop();
  });

  return result ? { name: result[1], prefix: result[2] || '' } : null;
};

var getQuotedScope = (0, _fp.find)(function (scope) {
  return scope === 'string.quoted.double.xml' || scope === 'string.quoted.single.xml';
});

var includesTagScope = function includesTagScope(scopesArray) {
  return scopesArray.some(function (item) {
    return item === 'meta.tag.xml' || item === 'meta.tag.no-content.xml';
  });
};

var buildHeaders = function buildHeaders(editorPath, catalogPath, _ref10, type, fragment) {
  var lang = _ref10.lang;
  var schemaPath = _ref10.path;
  return ['A', type, fragment || '', 'r', 'UTF-8', editorPath, catalogPath || '', lang + ' ' + (schemaPath || '')];
};

var getSuggestions = function getSuggestions(sharedConfig, suggestionOptions) {
  var options = sharedConfig.options;
  var xmlCatalog = sharedConfig.xmlCatalog;
  var port = sharedConfig.port;
  var currentSchemaProps = sharedConfig.currentSchemaProps;
  var editor = options.editor;
  var type = suggestionOptions.type;
  var fragment = suggestionOptions.fragment;
  var body = suggestionOptions.body;
  var clientData = suggestionOptions.clientData;
  var filterFn = suggestionOptions.filterFn;
  var builderFn = suggestionOptions.builderFn;


  var headers = buildHeaders(editor.getPath(), xmlCatalog, currentSchemaProps, type, fragment);

  return serverProcessInstance.sendRequest(headers, body, port).then((0, _fp.flow)(JSON.parse, function (data) {
    return clientData ? data.concat(clientData) : data;
  }, (0, _fp.filter)(filterFn), (0, _fp.map)(builderFn), _fp.compact)).catch(function () {
    return [];
  });
};

var elementSuggestionFilter = function elementSuggestionFilter(prefix) {
  return function (_ref11) {
    var value = _ref11.value;
    var closing = _ref11.closing;
    return closing ? ('/' + value).startsWith(prefix) : value.startsWith(prefix);
  };
};

var attributeValueFilter = function attributeValueFilter(prefix, endToken) {
  return function (_ref12) {
    var value = _ref12.value;
    var listItem = _ref12.listItem;
    return value.startsWith(listItem ? endToken : prefix);
  };
};

var attributeNameFilter = function attributeNameFilter(prefix) {
  return function (_ref13) {
    var value = _ref13.value;
    return value.startsWith(prefix);
  };
};

var getPrecedingLineText = function getPrecedingLineText(_ref14) {
  var editor = _ref14.editor;
  var bufferPosition = _ref14.bufferPosition;
  return editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);
};

var getAttributeValueSuggestions = function getAttributeValueSuggestions(sharedConfig, precedingLineText, quotedScope) {
  var options = sharedConfig.options;
  var editor = options.editor;


  var hasDblQuotes = quotedScope === 'string.quoted.double.xml';
  var attributeValueProps = getAttributeValueProps(options, hasDblQuotes);

  if (!attributeValueProps) return [];

  var endBracketPosition = getEndBracketPosition(options);
  if (!endBracketPosition) return [];

  var fragment = attributeValueProps.name;
  var prefix = attributeValueProps.prefix;


  var endToken = getEndToken(prefix);

  return getSuggestions(sharedConfig, {
    type: 'V',
    body: editor.getTextInBufferRange([[0, 0], endBracketPosition]) + '>',
    fragment: fragment,
    filterFn: attributeValueFilter(prefix, endToken),
    builderFn: buildAttributeValueSuggestion(prefix, endToken, hasDblQuotes)
  });
};

var getAttributeNameSuggestions = function getAttributeNameSuggestions(sharedConfig, precedingLineText) {
  var options = sharedConfig.options;
  var editor = options.editor;
  var bufferPosition = options.bufferPosition;


  var attributeNameProps = getAttributeNameProps(precedingLineText);
  if (!attributeNameProps) return [];

  var endBracketPosition = getEndBracketPosition(options);
  if (!endBracketPosition) return [];

  var prefix = attributeNameProps.prefix;
  var prefixStartColumn = attributeNameProps.column;


  var textBeforeAttribute = editor.getTextInBufferRange([[0, 0], [bufferPosition.row, prefixStartColumn]]);

  var followingText = editor.getTextInBufferRange([bufferPosition, endBracketPosition]) + '>';

  var match = followingText.match(_regex2.default.attEndFromAttName);
  var textAfterAttribute = match ? followingText.substr(match[0].length) : followingText;
  var addSuffix = !match;

  return getSuggestions(sharedConfig, {
    type: 'N',
    body: textBeforeAttribute + textAfterAttribute,
    filterFn: attributeNameFilter(prefix),
    builderFn: buildAttributeNameSuggestion(prefix, addSuffix)
  });
};

var piSuggestions = [{
  value: '!--  -->',
  snippet: '!-- ${1} -->' }, {
  value: '![CDATA[]]>',
  snippet: '![CDATA[${1}]]>' }];

var getElementPISuggestions = function getElementPISuggestions(sharedConfig, tagNamePIPrefix) {
  var options = sharedConfig.options;
  var editor = options.editor;
  var bufferPosition = options.bufferPosition;


  var body = editor.getTextInBufferRange([[0, 0], [bufferPosition.row, bufferPosition.column - tagNamePIPrefix.length - 1]]);

  var addSuffix = !getEndBracketPosition(options);

  return getSuggestions(sharedConfig, {
    type: 'E',
    body: body,
    clientData: piSuggestions,
    filterFn: elementSuggestionFilter(tagNamePIPrefix),
    builderFn: buildElementSuggestion(tagNamePIPrefix, addSuffix)
  });
};

var suggest = function suggest(options, _ref15) {
  var autocompleteScope = _ref15.autocompleteScope;
  var xmlCatalog = _ref15.xmlCatalog;
  return function (_ref16) {
    var port = _ref16[0].port;
    var schemaProps = _ref16[1].schemaProps;

    var currentSchemaProps = (0, _fp.find)(function (_ref17) {
      var lang = _ref17.lang;
      return !!autocompleteScope[lang];
    }, schemaProps) || { type: 'none' };

    var scopesArray = options.scopeDescriptor.getScopesArray();
    var sharedConfig = { options: options, xmlCatalog: xmlCatalog, port: port, currentSchemaProps: currentSchemaProps };
    var precedingLineText = getPrecedingLineText(options);
    var tagNamePIPrefix = getTagNamePIPrefix(precedingLineText);

    if (tagNamePIPrefix !== null) {
      return getElementPISuggestions(sharedConfig, tagNamePIPrefix);
    }

    if (includesTagScope(scopesArray)) {
      var quotedScope = getQuotedScope(scopesArray);

      if (quotedScope) {
        return getAttributeValueSuggestions(sharedConfig, precedingLineText, quotedScope);
      }

      if (getPreviousTagBracket(options) === '<') {
        return getAttributeNameSuggestions(sharedConfig, precedingLineText);
      }
    }

    return [];
  };
};

module.exports = suggest;