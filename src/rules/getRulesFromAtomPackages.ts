import path from 'path'

import { Package } from 'atom'

import logError from '../util/logError'
import { Rule, RuleOutcome } from './RuleStore'
import validateRules from './validateRules'

interface SettingsFile {
  path: string
  properties?: {
    '.text.xml'?: {
      validation?: {
        rules?: unknown
      }
    }
  }
}

declare module 'atom' {
  interface Package {
    settings?: Array<SettingsFile>
  }
}

/**
 * Resolves paths in a RuleOutcome relative to a base path.
 */
const resolvePaths = (outcome: RuleOutcome, baseDir: string): RuleOutcome => {
  const newOutcome: RuleOutcome = { ...outcome }

  if (newOutcome.xmlCatalog) {
    // resolve newOutcome.xmlCatalog relative to `baseDir`
    newOutcome.xmlCatalog = path.resolve(baseDir, newOutcome.xmlCatalog)
  }
  if (newOutcome.schemaProps) {
    // resolve all newOutcome.schemaProps `path`s relative to `baseDir`
    newOutcome.schemaProps = newOutcome.schemaProps.map(
      ({ path: schemaPath, lang }) => ({
        path: path.resolve(baseDir, schemaPath),
        lang,
      })
    )
  }

  return newOutcome
}

const getSettingsFiles = (packages: Array<Package>): Array<SettingsFile> => {
  return packages.reduce((result, pkg: Package) => {
    const { settings } = pkg

    if (Array.isArray(settings)) {
      return result.concat(settings)
    }

    return result
  }, [] as Array<SettingsFile>)
}

/**
 * Extracts linter-autocomplete-jing rules from an array of Atom packages and
 * resolves paths in the rules' outcomes relative to the package's settings
 * directory.
 */
const getRulesFromAtomPackages = (packages: Array<Package>): Array<Rule> => {
  const settingsFiles = getSettingsFiles(packages)

  return settingsFiles.reduce((result, settings) => {
    const { path: settingsPath, properties } = settings

    const rules = properties?.['.text.xml']?.validation?.rules

    if (!settingsPath || !Array.isArray(rules)) return result

    try {
      validateRules(rules)
    } catch (err) {
      logError(`Skipping rules from ${settingsPath}: ${err.message}`)
      return result
    }

    const settingsDir = path.dirname(settingsPath)

    const newRules = rules.map(({ priority, test, outcome }) => ({
      priority,
      test,
      outcome: resolvePaths(outcome, settingsDir),
    }))

    return result.concat(newRules)
  }, [] as Array<Rule>)
}

export default getRulesFromAtomPackages
