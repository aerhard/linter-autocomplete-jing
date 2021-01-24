import logError from '../util/logError'

/**
 * The properties of the active document used to determine whether the document
 * matches a schema/catalog assignment rule
 */
export interface DocumentProps {
  rootScopes: readonly string[]
  filePath?: string
  rootNs?: string
  rootLocalName?: string
  rootAttributes: Attributes
  publicId?: string
}

export interface Attributes {
  [key: string]: string
}

interface RuleTestSpecs {
  grammarScope?: string
  pathRegex?: string
  rootNs?: string
  rootLocalName?: string
  rootAttributes?: Attributes
  publicId?: string
}

export type SchemaLang =
  | 'rng'
  | 'rnc'
  | 'sch.iso'
  | 'sch.15'
  | 'xsd'
  | 'dtd'
  | 'none'

interface SchemaProps {
  path: string
  lang: SchemaLang
}

export interface RuleOutcome {
  xmlCatalog?: string
  schemaProps?: Array<SchemaProps>
  dtdValidation?: 'never' | 'always' | 'fallback'
  xIncludeAware?: boolean
  xIncludeFixupBaseUris?: boolean
  xIncludeFixupLanguage?: boolean
}

export interface Rule {
  priority: number
  test: RuleTestSpecs
  outcome: RuleOutcome
}

/**
 * A function to test whether the properties of an XML document match a
 * schema/catalog assignment rule.
 */
interface RuleMatcher {
  (documentProps: DocumentProps): boolean
}

interface RuleWithMatcher {
  matches: RuleMatcher
  outcome: RuleOutcome
}

const createGrammarScopeConstraint = (value: string): RuleMatcher => ({
  rootScopes,
}) => rootScopes.includes(value)

const createPathRegexConstraint = (pattern: string): RuleMatcher => {
  try {
    const pathRegex = new RegExp(pattern)

    return ({ filePath }) => (filePath ? pathRegex.test(filePath) : false)
  } catch (err) {
    logError(`Could not parse RegExp "${pattern}"`, err)
    return () => false
  }
}

const createRootNsConstraint = (value: string): RuleMatcher => ({ rootNs }) =>
  value === rootNs

const createRootLocalNameConstraint = (value: string): RuleMatcher => ({
  rootLocalName,
}) => value === rootLocalName

const createRootAttributeConstraint = (
  name: string,
  value: string
): RuleMatcher => ({ rootAttributes }) => rootAttributes[name] === value

const createPublicIdConstraint = (value: string): RuleMatcher => ({
  publicId,
}) => value === publicId

const createDocumentPropsMatcher = ({
  grammarScope,
  pathRegex,
  rootNs,
  rootLocalName,
  rootAttributes,
  publicId,
}: RuleTestSpecs): RuleMatcher => {
  const tests: Array<RuleMatcher> = []
  if (grammarScope) {
    tests.push(createGrammarScopeConstraint(grammarScope))
  }
  if (pathRegex) {
    tests.push(createPathRegexConstraint(pathRegex))
  }
  if (rootNs) {
    tests.push(createRootNsConstraint(rootNs))
  }
  if (rootLocalName) {
    tests.push(createRootLocalNameConstraint(rootLocalName))
  }
  if (rootAttributes) {
    for (const name of Object.keys(rootAttributes)) {
      tests.push(createRootAttributeConstraint(name, rootAttributes[name]))
    }
  }
  if (publicId) {
    tests.push(createPublicIdConstraint(publicId))
  }

  // rules without any constraints shall never match
  if (tests.length === 0) {
    return () => false
  }

  return (documentProps) => {
    return tests.every((test) => test(documentProps))
  }
}

/**
 * Sorts rules by `priority` in descending order.
 */
const sortByPriority = (rules: Array<Rule>): Array<Rule> =>
  rules.sort((a, b) => b.priority - a.priority)

/**
 * Converts the data of a rule's `test` property into a `matches()` function.
 */
const createRuleWithMatcher = (rule: Rule): RuleWithMatcher => {
  return {
    matches: createDocumentPropsMatcher(rule.test),
    outcome: rule.outcome,
  }
}

/**
 * Stores rules obtained from Atom's user config and other Atom packages.
 */
export default class RuleStore {
  private configRules: Array<RuleWithMatcher> = []
  private packageRules: Array<RuleWithMatcher> = []
  private allRules: Array<RuleWithMatcher> = []

  /**
   * Sets rules from Atom's user config.
   */
  public setConfigRules(rules: Array<Rule>) {
    this.configRules = sortByPriority(rules).map(createRuleWithMatcher)
    this.allRules = this.configRules.concat(this.packageRules)
  }

  /**
   * Sets rules from other Atom packages.
   */
  public setPackageRules(rules: Array<Rule>) {
    this.packageRules = sortByPriority(rules).map(createRuleWithMatcher)
    this.allRules = this.configRules.concat(this.packageRules)
  }

  /**
   * Returns an array of all rules.
   */
  public getAll(): Array<RuleWithMatcher> {
    return this.allRules
  }

  /**
   * Returns the outcome of the first rule matching the properties of an
   * XML document.
   */
  public getMatchingOutcome(
    documentProps: DocumentProps
  ): RuleOutcome | undefined {
    const matchingRule = this.allRules.find((rule) =>
      rule.matches(documentProps)
    )

    return matchingRule?.outcome
  }
}
