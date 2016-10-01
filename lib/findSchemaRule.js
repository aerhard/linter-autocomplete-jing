'use strict';

var _find = require('lodash/fp/find');

var _find2 = _interopRequireDefault(_find);

var _allPass = require('lodash/fp/allPass');

var _allPass2 = _interopRequireDefault(_allPass);

var _mapValues = require('lodash/fp/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

var _map = require('lodash/fp/map');

var _map2 = _interopRequireDefault(_map);

var _update = require('lodash/fp/update');

var _update2 = _interopRequireDefault(_update);

var _flow = require('lodash/fp/flow');

var _flow2 = _interopRequireDefault(_flow);

var _sortBy = require('lodash/fp/sortBy');

var _sortBy2 = _interopRequireDefault(_sortBy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapValuesWithKey = _mapValues2.default.convert({ cap: false });

var rules = [{
  priority: 1,
  test: {
    // TODO scope
    pathRegex: '.rng$'
  },
  outcome: {
    catalog: '',
    schemaProps: [{
      lang: 'rnc',
      path: '/home/ahlsen/dev/xml-tools/xml-schemata/data/relaxng/relaxng.rnc'
    }]
  }
}, {
  priority: 1,
  test: {
    pathRegex: '.xsd$'
  },
  outcome: {
    catalog: '',
    schemaProps: [{
      lang: 'xsd',
      path: '/home/ahlsen/dev/xml-tools/xml-schemata/data/xsd/XMLSchema.xsd'
    }]
  }
}, {
  priority: 1,
  test: {
    // TODO should skip dtd!?!?
    rootAttributes: {
      // TODO should be in rootNs
      xmlns: 'urn:oasis:names:tc:entity:xmlns:xml:catalog'
    }
  },
  outcome: {
    catalog: '',
    schemaProps: [{
      lang: 'rnc',
      path: '/home/ahlsen/dev/xml-tools/xml-schemata/data/catalog/catalog.rnc'
    }]
  }
}];

// TODO also support grammar / grammar scope

// TODO also include catalog
// TODO parse raw schema rules!

// TODO also allow to specify if DTDs should get ignored or not
// and explain in readme: dtds don't get cached in memory so replacing them
// with other schema languages can improve performance

// TODO also use cache so we don't have to search each time for the right rule!

// TODO also allow regexes for ns etc!!!

var createPathRegexMatcher = function createPathRegexMatcher(pathRegexStr) {
  // TODO throw error if necessary
  var pathRegex = new RegExp(pathRegexStr);

  return function (_ref) {
    var filePath = _ref.filePath;
    return pathRegex.test(filePath);
  };
};

var createRootNsMatcher = function createRootNsMatcher(name) {
  return function (_ref2) {
    var rootNs = _ref2.rootNs;
    return name === rootNs;
  };
};

var createRootLocalNameMatcher = function createRootLocalNameMatcher(name) {
  return function (_ref3) {
    var rootLocalName = _ref3.rootLocalName;
    return name === rootLocalName;
  };
};

var createRootAttributeMatcher = function createRootAttributeMatcher(value, name) {
  return function (_ref4) {
    var attributes = _ref4.attributes;
    return attributes[name] === value;
  };
};

var parsedRules = (0, _flow2.default)((0, _map2.default)((0, _update2.default)('test', function (_ref5) {
  var pathRegex = _ref5.pathRegex;
  var rootNs = _ref5.rootNs;
  var rootLocalName = _ref5.rootLocalName;
  var rootAttributes = _ref5.rootAttributes;

  var matchers = [];
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
  return (0, _allPass2.default)(matchers);
})), (0, _sortBy2.default)('priority'))(rules);

module.exports = parsedRules;