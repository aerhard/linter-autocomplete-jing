
import { allPass, map, update, flow, merge } from 'lodash/fp';
import path from 'path';

const mapWithKey = map.convert({ cap: false });

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
  ({ rootAttributes }) => rootAttributes[name] === value;

const sortByPriority = arr => arr.sort((a, b) => b.priority - a.priority);

const parse = flow(
  map(
    flow(
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
          const attributeMatchers = mapWithKey(
            createRootAttributeMatcher,
            rootAttributes
          );
          matchers.push(...attributeMatchers);
        }

        return matchers.length
          ? allPass(matchers)
          : () => false;
      }),
      (rule) => {
        const newOutcome = {};
        const { outcome, settingsPath } = rule;
        const basePath = path.dirname(settingsPath);

        if (outcome.xmlCatalog) {
          newOutcome.xmlCatalog = path.resolve(basePath, outcome.xmlCatalog);
        }
        if (outcome.schemaProps) {
          newOutcome.schemaProps = outcome.schemaProps.map(({ path: schemaPath }) => ({
            path: path.resolve(basePath, schemaPath),
          }));
        }
        return merge(rule, { outcome: newOutcome });
      }
    )
  ),
  sortByPriority
);

module.exports = {
  parse,
};
