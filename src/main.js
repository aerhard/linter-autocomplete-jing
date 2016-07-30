
import { CompositeDisposable } from 'atom'; // eslint-disable-line
import serverProcess from './serverProcess';

let validate;
let suggest;
let sendRequest;
let getSchemaProps;
let subscriptions;

const localConfig = {};

const addErrorNotification = (err) => {
  atom.notifications.addError(`[linter-autocomplete-jing] ${err.message}`, {
    detail: err.stack,
    dismissable: true,
  });
  return [];
};

const setServerConfig = (args) => {
  if (serverProcess.isReadyPromise) {
    if (!sendRequest) sendRequest = require('./sendRequest');

    serverProcess.isReadyPromise
      .then(({ port }) => sendRequest(args, null, port))
      .catch(addErrorNotification);
  }
};

const setLocalConfig = key => (value) => {
  localConfig[key] = value;
  if (!serverProcess.isReady) return;

  if (['javaExecutablePath', 'jvmArguments'].includes(key)) {
    serverProcess.exit();
  } else if (key === 'schemaCacheSize') {
    setServerConfig(['S', value]);
  }
};

let shouldSuppressAutocomplete = false;

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

module.exports = {
  activate() {
    require('atom-package-deps').install();

    subscriptions = new CompositeDisposable();

    Object
      .keys(atom.config.get('linter-autocomplete-jing'))
      .forEach(key =>
        subscriptions.add(
          atom.config.observe(`linter-autocomplete-jing.${key}`, setLocalConfig(key))
        )
      );

    subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-autocomplete-jing:clear-schema-cache': () => setServerConfig(['C']),
    }));

    serverProcess
      .ensureIsReady(localConfig)
      .catch(addErrorNotification);
  },

  deactivate() {
    subscriptions.dispose();
    serverProcess.exit();
  },

  provideLinter() {
    if (!validate) validate = require('./validate');
    if (!getSchemaProps) getSchemaProps = require('./getSchemaProps');

    return {
      name: 'Jing',
      grammarScopes: ['text.xml', 'text.xml.plist', 'text.xml.xsl', 'text.mei'],
      scope: 'file',
      lintOnFly: true,
      lint(textEditor) {
        return Promise.all([
          serverProcess.ensureIsReady(localConfig),
          getSchemaProps(textEditor),
        ])
        .then(validate(textEditor, localConfig))
        .catch(addErrorNotification);
      },
    };
  },

  provideAutocomplete() {
    if (!suggest) suggest = require('./suggest');
    if (!getSchemaProps) getSchemaProps = require('./getSchemaProps');

    return {
      selector: '.text.xml, .text.mei',
      disableForSelector: '.comment',
      inclusionPriority: localConfig.autocompletePriority,
      excludeLowerPriority: true,
      getSuggestions(options) {
        if (shouldSuppressAutocomplete) {
          cancelAutocomplete(options.editor);
          shouldSuppressAutocomplete = false;
          return null;
        }

        return Promise.all([
          serverProcess.ensureIsReady(localConfig),
          getSchemaProps(options.editor),
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
