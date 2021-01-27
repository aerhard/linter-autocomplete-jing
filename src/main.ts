import { CompositeDisposable, TextEditor } from 'atom'

import suggest from './autocomplete/suggest'
import { AutocompleteContext, Suggestion } from './autocomplete/util'
import getParserConfig, {
  DefaultParserConfig,
  LinterMessage,
} from './getParserConfig'
import getRulesFromAtomPackages from './rules/getRulesFromAtomPackages'
import RuleStore, { Rule } from './rules/RuleStore'
import validateRules from './rules/validateRules'
import {
  showErrorNotification,
  showWarningNotification,
} from './util/notifications'
import { ValidationConfig } from './validation/createLinterMessages'
import validate from './validation/validate'
import { AutocompleteConfig } from './xmlService/util'
import XmlService from './xmlService/XmlService'

let subscriptions = new CompositeDisposable()

export const xmlService = new XmlService()

const ruleStore = new RuleStore()

/**
 * The grammar scopes our Linter provider should be invoked on.
 */
const grammarScopes: Array<string> = []

const defaultParserConfig: DefaultParserConfig = {
  xmlCatalog: '',
  dtdValidation: 'fallback',
  xIncludeAware: true,
  xIncludeFixupBaseUris: true,
  xIncludeFixupLanguage: true,
}

const validationConfig: ValidationConfig = {
  displaySchemaWarnings: false,
}

const autocompleteConfig: AutocompleteConfig = {
  wildcardSuggestions: 'none',
  autocompletePriority: 1,
  autocompleteScope: {
    rnc: true,
    rng: true,
    xsd: true,
  },
}

// ******************* ATOM HOOKS, EVENTS AND COMMANDS *********************

const handlePackageChanges = () => {
  const newGrammarScopes = atom.grammars
    .getGrammars()
    .map((grammar) => grammar.scopeName)
    .filter((scopeName) => scopeName?.startsWith('text.xml'))

  // `grammarScopes` gets passed to the linter when the initial
  // `provideLinter()` function is called and gets stored there. In order
  // to propagate changes to the content of `grammarScopes` to the linter,
  // we need to mutate it
  grammarScopes.splice(0, grammarScopes.length, ...newGrammarScopes)

  const packages = atom.packages.getActivePackages()
  const packageRules = getRulesFromAtomPackages(packages)
  ruleStore.setPackageRules(packageRules)
}

/**
 * Activation hook, called by Atom when the `linter-autocomplete-jing`
 * package is activated
 */
export function activate() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('atom-package-deps').install('linter-autocomplete-jing')

  subscriptions = new CompositeDisposable()

  subscriptions.add(
    atom.config.observe(`linter-autocomplete-jing.rules`, (rules: unknown) => {
      if (Array.isArray(rules)) {
        try {
          validateRules(rules)
        } catch (err) {
          showWarningNotification(
            `Could not set rules from user config: ${err.message}`,
            JSON.stringify(rules, null, 2)
          )
          return
        }
        ruleStore.setConfigRules(rules as Array<Rule>)
      }
    })
  )

  subscriptions.add(
    atom.config.observe(
      `linter-autocomplete-jing.jvmArguments`,
      (jvmArguments: string) => xmlService.setJvmArguments(jvmArguments)
    )
  )

  subscriptions.add(
    atom.config.observe(
      `linter-autocomplete-jing.javaExecutablePath`,
      (javaExecutablePath: string) =>
        xmlService.setJavaExecutablePath(javaExecutablePath)
    )
  )

  subscriptions.add(
    atom.config.observe(
      `linter-autocomplete-jing.schemaCacheSize`,
      (schemaCacheSize: number) =>
        xmlService.setSchemaCacheSize(schemaCacheSize)
    )
  )
  ;(Object.keys(defaultParserConfig) as Array<
    keyof DefaultParserConfig
  >).forEach(
    <K extends keyof DefaultParserConfig, V extends DefaultParserConfig[K]>(
      key: K
    ) =>
      subscriptions.add(
        atom.config.observe(`linter-autocomplete-jing.${key}`, (value: V) => {
          defaultParserConfig[key] = value
        })
      )
  )

  subscriptions.add(
    atom.config.observe(
      `linter-autocomplete-jing.displaySchemaWarnings`,
      (displaySchemaWarnings: boolean) => {
        validationConfig.displaySchemaWarnings = displaySchemaWarnings
      }
    )
  )
  ;(Object.keys(autocompleteConfig) as Array<keyof AutocompleteConfig>).forEach(
    <K extends keyof AutocompleteConfig, V extends AutocompleteConfig[K]>(
      key: K
    ) =>
      subscriptions.add(
        atom.config.observe(`linter-autocomplete-jing.${key}`, (value: V) => {
          autocompleteConfig[key] = value
        })
      )
  )

  subscriptions.add(
    atom.commands.add('atom-workspace', {
      'linter-autocomplete-jing:clear-schema-cache': () =>
        xmlService.clearSchemaCache(),
    })
  )

  const setPackageChangeListeners = () => {
    subscriptions.add(atom.packages.onDidActivatePackage(handlePackageChanges))
    subscriptions.add(
      atom.packages.onDidDeactivatePackage(handlePackageChanges)
    )
  }

  // if the inital Atom packages haven't all been activated yet,
  // defer handling package changes until all packages have been
  // activated
  if (!atom.packages.hasActivatedInitialPackages()) {
    subscriptions.add(
      atom.packages.onDidActivateInitialPackages(() => {
        handlePackageChanges()
        setPackageChangeListeners()
      })
    )
  } else {
    handlePackageChanges()
    setPackageChangeListeners()
  }
}

/**
 * Deactivation hook, called by Atom when the `linter-autocomplete-jing`
 * package is deactivated.
 */
export function deactivate() {
  subscriptions.dispose()
  xmlService.shutdown()
}

// ********************************* LINTER **********************************

/**
 * Exposes the `linter-autocomplete-jing` linter provider to the linter service.
 */
export function provideLinter() {
  return {
    name: 'Jing',
    grammarScopes,
    scope: 'file',
    lintsOnChange: true,

    async lint(textEditor: TextEditor): Promise<Array<LinterMessage> | null> {
      if (!textEditor.getPath()) return null

      try {
        const { parserConfig, xmlModelWarnings } = getParserConfig(
          textEditor,
          ruleStore,
          defaultParserConfig
        )

        const messages = await validate(
          textEditor,
          validationConfig,
          parserConfig,
          xmlService
        )

        return messages.concat(xmlModelWarnings).sort((a, b) => {
          return a.location.position[0][0] - b.location.position[0][0]
        })
      } catch (err) {
        showErrorNotification(err)
        return []
      }
    },
  }
}

// ****************************** AUTOCOMPLETE ********************************

const triggerAutocomplete = (editor: TextEditor) => {
  ;(atom.commands.dispatch as (
    target: Node,
    commandName: string,
    // The `options` parameter is not part of the official Atom API but gets
    // forwarded to Autocomplete Plus and processed there
    options: { activatedManually: boolean }
  ) => Promise<void> | null)(
    atom.views.getView(editor),
    'autocomplete-plus:activate',
    {
      activatedManually: false,
    }
  )
}

/**
 * Indicates whether the next call of `getSuggestions()` should get canceled.
 */
let cancelNextAutocomplete = false

/**
 * Exposes the `linter-autocomplete-jing` autocomplete provider to the
 * `autocomplete plus` service.
 */
export function provideAutocomplete() {
  return {
    selector: '.text.xml',
    disableForSelector: '.comment, .string.unquoted.cdata.xml',
    inclusionPriority: autocompleteConfig.autocompletePriority,
    excludeLowerPriority: true,

    async getSuggestions(
      ctx: AutocompleteContext
    ): Promise<Array<Suggestion> | null> {
      if (cancelNextAutocomplete) {
        atom.commands.dispatch(
          atom.views.getView(ctx.editor),
          'autocomplete-plus:cancel'
        )
        cancelNextAutocomplete = false

        return null
      }

      try {
        const { parserConfig } = getParserConfig(
          ctx.editor,
          ruleStore,
          defaultParserConfig
        )

        return suggest(ctx, autocompleteConfig, parserConfig, xmlService)
      } catch (err) {
        showErrorNotification(err)
        return []
      }
    },

    onDidInsertSuggestion({
      editor,
      suggestion,
    }: {
      editor: TextEditor
      suggestion: Suggestion
    }) {
      if (suggestion.retrigger) {
        // When a suggestion has `retrigger` set to `true` (which, for example,
        // is the case when an element suggestion with new attributes got
        // inserted), trigger autocomplete (in this case, on the value of the
        // first new attribute).

        setTimeout(() => triggerAutocomplete(editor), 1)
      } else {
        // Exit early from any call of `getSuggestions()` within the next 300ms.
        // This prevents surplus suggestion dialogs appearing immediately after
        // the insertion of a plain element or attribute name.

        cancelNextAutocomplete = true
        setTimeout(() => {
          cancelNextAutocomplete = false
        }, 300)
      }
    },
  }
}
