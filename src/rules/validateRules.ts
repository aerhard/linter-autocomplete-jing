import { Rule } from './RuleStore'

const isArray = Array.isArray

const isNumber = (value: unknown) => {
  return typeof value === 'number' && isFinite(value)
}

const isObject = (obj: unknown): obj is Record<string, unknown> => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

const isString = (value: unknown) => {
  return typeof value === 'string'
}

const validateRule = (rule: unknown): rule is Rule => {
  if (!isObject(rule)) {
    throw new Error('Rule must be an object.')
  }

  if (!('test' in rule) || !('outcome' in rule)) {
    throw new Error('Rules must to have "test" and "outcome" properties.')
  }

  if ('priority' in rule && !isNumber(rule.priority)) {
    throw new Error('"priority" must be a number.')
  }

  if (!isObject(rule.test)) {
    throw new Error('"test" must be an object.')
  }

  if (!isObject(rule.outcome)) {
    throw new Error('"outcome" must be an object.')
  }

  if ('grammarScope' in rule.test && !isString(rule.test.grammarScope)) {
    throw new Error('"test.grammarScope" must be a string.')
  }

  if ('pathRegex' in rule.test && !isString(rule.test.pathRegex)) {
    throw new Error('"test.pathRegex" must be a string.')
  }

  if ('rootNs' in rule.test && !isString(rule.test.rootNs)) {
    throw new Error('"test.rootNs" must be a string.')
  }

  if ('rootLocalName' in rule.test && !isString(rule.test.rootLocalName)) {
    throw new Error('"test.rootLocalName" must be a string.')
  }

  if ('rootAttributes' in rule.test && !isObject(rule.test.rootAttributes)) {
    throw new Error('"test.rootAttributes" must be an object.')
  }

  if ('xmlCatalog' in rule.outcome && !isString(rule.outcome.xmlCatalog)) {
    throw new Error('"outcome.xmlCatalog" must be a string.')
  }

  if (
    'dtdValidation' in rule.outcome &&
    rule.outcome.dtdValidation !== 'never' &&
    rule.outcome.dtdValidation !== 'always' &&
    rule.outcome.dtdValidation !== 'fallback'
  ) {
    throw new Error(
      '"outcome.dtdValidation" must be "never", "always" or "fallback".'
    )
  }

  if ('schemaProps' in rule.outcome) {
    if (!isArray(rule.outcome.schemaProps)) {
      throw new Error('"outcome.schemaProps" must be an array.')
    }

    rule.outcome.schemaProps.forEach((schemaProps, index) => {
      if (!isObject(schemaProps)) {
        throw new Error(`"outcome.schemaProps[${index}]" must be an object.`)
      }

      if (!('lang' in schemaProps) || !('path' in schemaProps)) {
        throw new Error(
          `"outcome.schemaProps[${index}]" must have "lang" and "path" properties.`
        )
      }

      if (!isString(schemaProps.lang)) {
        throw new Error(
          `"outcome.schemaProps[${index}].lang" must be a string.`
        )
      }

      if (!isString(schemaProps.path)) {
        throw new Error(
          `"outcome.schemaProps[${index}].path" must be a string.`
        )
      }
    })
  }

  return true
}

const validateRules = (rules: Array<unknown>): rules is Array<Rule> => {
  rules.forEach((rule, index) => {
    try {
      validateRule(rule)
    } catch (err) {
      throw new Error(`Error in rule at index ${index}: ${err.message}`)
    }
  })

  return true
}

export default validateRules
