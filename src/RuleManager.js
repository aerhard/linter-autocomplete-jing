
import path from 'path';
import { allPass, map, flow } from './fp';

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

const createRootAttributeMatcher = (name, value) =>
  ({ rootAttributes }) => rootAttributes[name] === value;

const createPublicIdMatcher = value =>
  ({ publicId }) => value === publicId;

const sortByPriority = arr => arr.sort((a, b) => b.priority - a.priority);

const createTestFn = ({
  grammarScope, pathRegex, rootNs, rootLocalName, rootAttributes, publicId,
}) => {
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
    for (const name of Object.keys(rootAttributes)) {
      matchers.push(createRootAttributeMatcher(name, rootAttributes[name]));
    }
  }
  if (publicId) {
    matchers.push(createPublicIdMatcher(grammarScope));
  }

  return matchers.length
    ? allPass(matchers)
    : () => false;
};

const parseRule = ({ test, outcome, settingsPath }) => {
  const testFn = createTestFn(test);

  const newOutcome = {};
  const basePath = path.dirname(settingsPath);

  if (outcome.xmlCatalog) {
    newOutcome.xmlCatalog = path.resolve(basePath, outcome.xmlCatalog);
  }
  if (outcome.schemaProps) {
    newOutcome.schemaProps = outcome.schemaProps.map(({ path: schemaPath, lang }) => ({
      path: path.resolve(basePath, schemaPath),
      lang,
    }));
  }

  return {
    test: testFn,
    outcome: Object.assign({}, outcome, newOutcome),
  };
};

const parseRules = flow(
  map(parseRule),
  sortByPriority,
);

export default class RuleManager {

  constructor() {
    this.parsedConfigRules = [];
    this.parsedPackageRules = [];
    this.parsedRules = [];
  }

  updateConfigRules(rules) {
    this.parsedConfigRules = parseRules(rules);
    this.parsedRules = this.parsedConfigRules.concat(this.parsedPackageRules);
  }

  updatePackageRules(rules) {
    this.parsedPackageRules = parseRules(rules);
    this.parsedRules = this.parsedConfigRules.concat(this.parsedPackageRules);
  }

  getParsedRules() {
    return this.parsedRules;
  }

}
