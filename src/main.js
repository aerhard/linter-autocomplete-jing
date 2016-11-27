
import {
  debounce, flow, flatMap, compact, get, filter, startsWith, map,
} from './fp';
import { CompositeDisposable } from 'atom'; // eslint-disable-line
import ServerProcess from './ServerProcess';
import getSchemaProps from './getSchemaProps';
import validate from './validate';
import suggest from './suggest';
import RuleManager from './RuleManager';

const serverProcessInstance = ServerProcess.getInstance();

if (serverProcessInstance.onError === ServerProcess.prototype.onError) {
  serverProcessInstance.onError = (err) => {
    atom.notifications.addError(`[linter-autocomplete-jing] ${err.message}`, {
      detail: err.stack,
      dismissable: true,
    });
  };
}

let subscriptions;
let initialPackagesActivated = false;
let shouldSuppressAutocomplete = false;
const ruleManager = new RuleManager();
const grammarScopes = [];

const localConfig = {};

const addErrorNotification = (err) => {
  atom.notifications.addError(`[linter-autocomplete-jing] ${err.message}`, {
    detail: err.stack,
    dismissable: true,
  });
  return [];
};

const setServerConfig = (args) => {
  if (serverProcessInstance.isReadyPromise) {
    serverProcessInstance.isReadyPromise
      .then(() => serverProcessInstance.sendRequest(args, null))
      .catch(addErrorNotification);
  }
};

const setLocalConfig = key => (value) => {
  if (key === 'rules') {
    ruleManager.updateConfigRules(value);
    return;
  }

  localConfig[key] = value;

  if (!serverProcessInstance.isReady) return;

  if (['javaExecutablePath', 'jvmArguments'].includes(key)) {
    serverProcessInstance.exit();
  } else if (key === 'schemaCacheSize') {
    setServerConfig(['S', value]);
  }
};

const triggerAutocomplete = (editor) => {
  atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
    activatedManually: false,
  });
};

const cancelAutocomplete = (editor) => {
  atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:cancel', {
    activatedManually: false,
  });
};

const updateGrammarScopes = () => {
  const grammars = atom.grammars.getGrammars();
  const newGrammarScopes = flow(
    map('scopeName'),
    filter(startsWith('text.xml')),
  )(grammars);

  grammarScopes.splice(0, grammarScopes.length, ...newGrammarScopes);
};

const updateRules = () => {
  const activePackages = atom.packages.getActivePackages();

  const rules = flow(
    flatMap('settings'),
    flatMap(({ path: settingsPath, scopedProperties }) =>
      flow(
        get(['.text.xml', 'validation', 'rules']),
        map(({ test, outcome }) => ({ test, outcome, settingsPath })),
      )(scopedProperties),
    ),
    compact,
  )(activePackages);

  ruleManager.updatePackageRules(rules);
};

const handlePackageChanges = debounce(500, () => {
  updateGrammarScopes();
  updateRules();
});

export default {
  ServerProcess,
  ruleManager,
  activate() {
    require('atom-package-deps').install();

    subscriptions = new CompositeDisposable();

    Object
      .keys(atom.config.get('linter-autocomplete-jing'))
      .forEach(key =>
        subscriptions.add(
          atom.config.observe(`linter-autocomplete-jing.${key}`, setLocalConfig(key)),
        ),
      );

    subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-autocomplete-jing:clear-schema-cache': () => setServerConfig(['C']),
    }));

    const setPackageListeners = () => {
      subscriptions.add(atom.packages.onDidActivatePackage(handlePackageChanges));
      subscriptions.add(atom.packages.onDidDeactivatePackage(handlePackageChanges));
    };

    if (initialPackagesActivated) {
      setPackageListeners();
    } else {
      subscriptions.add(atom.packages.onDidActivateInitialPackages(() => {
        initialPackagesActivated = true;
        handlePackageChanges();
        setPackageListeners();
      }));
    }

    serverProcessInstance
      .ensureIsReady(localConfig)
      .catch(addErrorNotification);
  },

  deactivate() {
    subscriptions.dispose();
    serverProcessInstance.exit();
  },

  provideLinter() {
    return {
      name: 'Jing',
      grammarScopes,
      scope: 'file',
      lintOnFly: true,
      lint(textEditor) {
        return Promise.all([
          serverProcessInstance.ensureIsReady(localConfig),
          getSchemaProps(textEditor, ruleManager.getParsedRules(), localConfig),
        ])
        .then(validate(textEditor, localConfig))
        .catch(addErrorNotification);
      },
    };
  },

  provideAutocomplete() {
    return {
      selector: '.text.xml',
      disableForSelector: '.comment, .string.unquoted.cdata.xml',
      inclusionPriority: localConfig.autocompletePriority,
      excludeLowerPriority: true,
      getSuggestions(options) {
        if (shouldSuppressAutocomplete) {
          cancelAutocomplete(options.editor);
          shouldSuppressAutocomplete = false;
          return null;
        }

        return Promise.all([
          serverProcessInstance.ensureIsReady(localConfig),
          getSchemaProps(options.editor, ruleManager.getParsedRules(), localConfig),
        ])
        .then(suggest(options, localConfig))
        .catch(addErrorNotification);
      },

      onDidInsertSuggestion(data) {
        const { editor, suggestion } = data;
        if (suggestion.retrigger) {
          setTimeout(() => triggerAutocomplete(editor), 1);
        } else {
          shouldSuppressAutocomplete = true;
          setTimeout(() => { shouldSuppressAutocomplete = false; }, 300);
        }
      },
    };
  },
};
