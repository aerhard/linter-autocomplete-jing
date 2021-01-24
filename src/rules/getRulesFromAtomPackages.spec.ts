import { Package } from 'atom'

import getRulesFromAtomPackages from './getRulesFromAtomPackages'
import { Rule } from './RuleStore'

const createSettingsFile = (name: string, rules: Array<Rule>): unknown => ({
  path: `/path/to/${name}/settings/settings.yml`,
  properties: {
    '.text.xml': {
      validation: {
        rules,
      },
    },
  },
})

const createPackage = (settings: Array<unknown>): unknown => ({
  name: 'pkg',
  path: '/path/to/pkg',
  settings,
})

const createRule = (priority: number): Rule => ({
  priority,
  test: {
    rootLocalName: 'root',
  },
  outcome: {
    xmlCatalog: `../schemata/catalog${priority}.xml`,
  },
})

const createRuleWithResolvedPaths = (name: string, priority: number): Rule => ({
  priority,
  test: {
    rootLocalName: 'root',
  },
  outcome: {
    xmlCatalog: `/path/to/${name}/schemata/catalog${priority}.xml`,
  },
})

describe('getRulesFromAtomPackages', () => {
  it('returns an array of all rules found in packages', () => {
    const packages = [
      createPackage([
        createSettingsFile('a', [createRule(1), createRule(2)]),
        createSettingsFile('b', [createRule(3), createRule(4)]),
      ]),
      createPackage([
        createSettingsFile('c', [createRule(5), createRule(6)]),
        createSettingsFile('d', [createRule(7), createRule(8)]),
      ]),
    ] as Array<Package>

    const rules = getRulesFromAtomPackages(packages)

    const expected = [
      createRuleWithResolvedPaths('a', 1),
      createRuleWithResolvedPaths('a', 2),
      createRuleWithResolvedPaths('b', 3),
      createRuleWithResolvedPaths('b', 4),
      createRuleWithResolvedPaths('c', 5),
      createRuleWithResolvedPaths('c', 6),
      createRuleWithResolvedPaths('d', 7),
      createRuleWithResolvedPaths('d', 8),
    ]

    expect(rules).toEqual(expected)
  })

  it('ignores packages without a `settings` array', () => {
    const packages = [
      {
        name: 'a',
      },
      createPackage([
        createSettingsFile('a', [createRule(1), createRule(2)]),
        createSettingsFile('b', [createRule(3), createRule(4)]),
      ]),
    ] as Array<Package>

    const rules = getRulesFromAtomPackages(packages)

    const expected = [
      createRuleWithResolvedPaths('a', 1),
      createRuleWithResolvedPaths('a', 2),
      createRuleWithResolvedPaths('b', 3),
      createRuleWithResolvedPaths('b', 4),
    ]

    expect(rules).toEqual(expected)
  })

  it('ignores SettingsFile objects without `properties`', () => {
    const packages = [
      createPackage([
        {
          path: `/path/to/xy/settings.yml`,
        },
        createSettingsFile('b', [createRule(3), createRule(4)]),
      ]),
    ] as Array<Package>

    const rules = getRulesFromAtomPackages(packages)

    const expected = [
      createRuleWithResolvedPaths('b', 3),
      createRuleWithResolvedPaths('b', 4),
    ]

    expect(rules).toEqual(expected)
  })

  it('ignores SettingsFile objects without `path`', () => {
    const packages = [
      createPackage([
        {
          properties: {
            '.text.xml': {
              validation: {
                rules: [createRule(1), createRule(2)],
              },
            },
          },
        },
        createSettingsFile('b', [createRule(3), createRule(4)]),
      ]),
    ] as Array<Package>

    const rules = getRulesFromAtomPackages(packages)

    const expected = [
      createRuleWithResolvedPaths('b', 3),
      createRuleWithResolvedPaths('b', 4),
    ]

    expect(rules).toEqual(expected)
  })

  it('ignores SettingsFile objects without without rules', () => {
    const packages = [
      createPackage([
        {
          path: `/path/to/xy/settings.yml`,
          properties: {
            '.text.xml': {
              validation: {},
            },
          },
        },
        createSettingsFile('b', [createRule(3), createRule(4)]),
      ]),
    ] as Array<Package>

    const rules = getRulesFromAtomPackages(packages)

    const expected = [
      createRuleWithResolvedPaths('b', 3),
      createRuleWithResolvedPaths('b', 4),
    ]

    expect(rules).toEqual(expected)
  })
})
