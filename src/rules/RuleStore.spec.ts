import RuleStore, { Rule } from './RuleStore'

const createRule = (priority: number, xmlCatalog: string): Rule => ({
  priority,
  test: {
    rootLocalName: 'root',
  },
  outcome: {
    xmlCatalog,
  },
})

describe('RuleStore', () => {
  it('returns rules sorted by source and priority', () => {
    const ruleStore = new RuleStore()

    const packageRules = [
      createRule(12, '/path/to/A'),
      createRule(11, '/path/to/B'),
      createRule(12, '/path/to/C'),
    ]

    const configRules = [
      createRule(2, '/path/to/D'),
      createRule(1, '/path/to/E'),
      createRule(2, '/path/to/F'),
    ]

    ruleStore.setPackageRules(packageRules)
    ruleStore.setConfigRules(configRules)

    const allRules = ruleStore.getAll()

    expect(allRules[0].outcome.xmlCatalog).toBe('/path/to/D')
    expect(allRules[1].outcome.xmlCatalog).toBe('/path/to/F')
    expect(allRules[2].outcome.xmlCatalog).toBe('/path/to/E')
    expect(allRules[3].outcome.xmlCatalog).toBe('/path/to/A')
    expect(allRules[4].outcome.xmlCatalog).toBe('/path/to/C')
    expect(allRules[5].outcome.xmlCatalog).toBe('/path/to/B')
  })
})
