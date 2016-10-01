'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _fp = require('lodash/fp');

var mapValuesWithKey = _fp.mapValues.convert({ cap: false });

var rules = [{
  priority: 100,
  test: {
    // TODO scope
    pathRegex: '.rng$'
  },
  outcome: {
    // xmlCatalog: '',
    schemaProps: [{
      lang: 'rnc',
      path: '/home/ahlsen/dev/xml-tools/xml-schemata/data/relaxng/relaxng.rnc'
    }]
  }
}, {
  priority: 100,
  test: {
    pathRegex: '.xsd$'
  },
  outcome: {
    // xmlCatalog: '',
    schemaProps: [{
      lang: 'xsd',
      path: '/home/ahlsen/dev/xml-tools/xml-schemata/data/xsd/XMLSchema.xsd'
    }]
  }
}, {
  priority: 100,
  test: {
    rootNs: 'urn:oasis:names:tc:entity:xmlns:xml:catalog'
  },
  outcome: {
    // xmlCatalog: '',
    schemaProps: [{
      lang: 'rnc',
      path: '/home/ahlsen/dev/xml-tools/xml-schemata/data/catalog/catalog.rnc'
    }]
  }
}];

var createGrammarScopeMatcher = function createGrammarScopeMatcher(value) {
  return function (_ref) {
    var rootScopes = _ref.rootScopes;
    return rootScopes.includes(value);
  };
};

var createPathRegexMatcher = function createPathRegexMatcher(pathRegexStr) {
  try {
    var _ret = function () {
      var pathRegex = new RegExp(pathRegexStr);

      return {
        v: function v(_ref2) {
          var filePath = _ref2.filePath;
          return pathRegex.test(filePath);
        }
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } catch (err) {
    console.error('Could not parse RegExp "' + pathRegexStr + '"', err); // eslint-disable-line no-console
    return function () {
      return false;
    };
  }
};

var createRootNsMatcher = function createRootNsMatcher(value) {
  return function (_ref3) {
    var rootNs = _ref3.rootNs;
    return value === rootNs;
  };
};

var createRootLocalNameMatcher = function createRootLocalNameMatcher(value) {
  return function (_ref4) {
    var rootLocalName = _ref4.rootLocalName;
    return value === rootLocalName;
  };
};

var createRootAttributeMatcher = function createRootAttributeMatcher(value, name) {
  return function (_ref5) {
    var attributes = _ref5.attributes;
    return attributes[name] === value;
  };
};

var parsedRules = (0, _fp.flow)((0, _fp.map)((0, _fp.update)('test', function (_ref6) {
  var grammarScope = _ref6.grammarScope;
  var pathRegex = _ref6.pathRegex;
  var rootNs = _ref6.rootNs;
  var rootLocalName = _ref6.rootLocalName;
  var rootAttributes = _ref6.rootAttributes;

  var matchers = [];
  if (grammarScope) {
    matchers.push(createGrammarScopeMatcher(grammarScope));
  }
  if (pathRegex) {
    matchers.push(createPathRegexMatcher(pathRegex));
  }
  if (rootNs) {
    matchers.push(createRootNsMatcher(rootNs));
  }
  if (rootLocalName) {
    matchers.push(createRootLocalNameMatcher(rootLocalName));
  }
  if (rootAttributes) {
    var attributeMatchers = mapValuesWithKey(createRootAttributeMatcher, rootAttributes);
    matchers.push.apply(matchers, attributeMatchers);
  }
  return (0, _fp.allPass)(matchers);
})), (0, _fp.sortBy)('priority'))(rules);

module.exports = parsedRules;