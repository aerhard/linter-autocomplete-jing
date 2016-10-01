
import { allPass, mapValues, map, update, flow } from 'lodash/fp';

const mapValuesWithKey = mapValues.convert({ cap: false });

const createGrammarScopeMatcher = value =>
  ({ rootScopes }) => rootScopes.includes(value);

const createPathRegexMatcher = (pathRegexStr) => {
  try {
    const pathRegex = new RegExp(pathRegexStr);

    return ({ filePath }) => pathRegex.test(filePath);
  } catch (err) {
    console.error(`Could not parse RegExp "${pathRegexStr}"`, err); // eslint-disable-line no-console
    return () => false;
  }
};

const createRootNsMatcher = value =>
  ({ rootNs }) => value === rootNs;

const createRootLocalNameMatcher = value =>
  ({ rootLocalName }) => value === rootLocalName;

const createRootAttributeMatcher = (value, name) =>
  ({ attributes }) => attributes[name] === value;

const sortByPriority = arr => arr.sort((a, b) => b.priority - a.priority);

const parse = flow(
  map(
    update('test', ({ grammarScope, pathRegex, rootNs, rootLocalName, rootAttributes }) => {
      const matchers = [];
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
        const attributeMatchers = mapValuesWithKey(
          createRootAttributeMatcher,
          rootAttributes
        );
        matchers.push(...attributeMatchers);
      }
      return allPass(matchers);
    })
  ),
  sortByPriority
);

module.exports = {
  parse,
};
