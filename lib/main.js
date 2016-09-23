'use strict';

var _atom = require('atom');

var _serverProcess = require('./serverProcess');

var _serverProcess2 = _interopRequireDefault(_serverProcess);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serverProcessInstance = _serverProcess2.default.getInstance(); // eslint-disable-line


if (serverProcessInstance.onError === _serverProcess2.default.prototype.onError) {
  serverProcessInstance.onError = function (err) {
    atom.notifications.addError('[linter-autocomplete-jing] ' + err.message, {
      detail: err.stack,
      dismissable: true
    });
  };
}

var validate = void 0;
var suggest = void 0;
var getSchemaProps = void 0;
var subscriptions = void 0;

var localConfig = {};

var addErrorNotification = function addErrorNotification(err) {
  atom.notifications.addError('[linter-autocomplete-jing] ' + err.message, {
    detail: err.stack,
    dismissable: true
  });
  return [];
};

var setServerConfig = function setServerConfig(args) {
  if (serverProcessInstance.isReadyPromise) {
    serverProcessInstance.isReadyPromise.then(function (_ref) {
      var port = _ref.port;
      return serverProcessInstance.sendRequest(args, null, port);
    }).catch(addErrorNotification);
  }
};

var setLocalConfig = function setLocalConfig(key) {
  return function (value) {
    localConfig[key] = value;
    if (!serverProcessInstance.isReady) return;

    if (['javaExecutablePath', 'jvmArguments'].includes(key)) {
      serverProcessInstance.exit();
    } else if (key === 'schemaCacheSize') {
      setServerConfig(['S', value]);
    }
  };
};

var shouldSuppressAutocomplete = false;

var triggerAutocomplete = function triggerAutocomplete(editor) {
  atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
    activatedManually: false
  });
};

var cancelAutocomplete = function cancelAutocomplete(editor) {
  atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:cancel', {
    activatedManually: false
  });
};

module.exports = {
  activate: function activate() {
    require('atom-package-deps').install();

    subscriptions = new _atom.CompositeDisposable();

    Object.keys(atom.config.get('linter-autocomplete-jing')).forEach(function (key) {
      return subscriptions.add(atom.config.observe('linter-autocomplete-jing.' + key, setLocalConfig(key)));
    });

    subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-autocomplete-jing:clear-schema-cache': function linterAutocompleteJingClearSchemaCache() {
        return setServerConfig(['C']);
      }
    }));

    serverProcessInstance.ensureIsReady(localConfig).catch(addErrorNotification);
  },
  deactivate: function deactivate() {
    subscriptions.dispose();
    serverProcessInstance.exit();
  },
  provideLinter: function provideLinter() {
    if (!validate) validate = require('./validate');
    if (!getSchemaProps) getSchemaProps = require('./getSchemaProps');

    return {
      name: 'Jing',
      grammarScopes: ['text.xml', 'text.xml.plist', 'text.xml.xsl', 'text.mei'],
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        return Promise.all([serverProcessInstance.ensureIsReady(localConfig), getSchemaProps(textEditor)]).then(validate(textEditor, localConfig)).catch(addErrorNotification);
      }
    };
  },
  provideAutocomplete: function provideAutocomplete() {
    if (!suggest) suggest = require('./suggest');
    if (!getSchemaProps) getSchemaProps = require('./getSchemaProps');

    return {
      selector: '.text.xml, .text.mei',
      disableForSelector: '.comment',
      inclusionPriority: localConfig.autocompletePriority,
      excludeLowerPriority: true,
      getSuggestions: function getSuggestions(options) {
        if (shouldSuppressAutocomplete) {
          cancelAutocomplete(options.editor);
          shouldSuppressAutocomplete = false;
          return null;
        }

        return Promise.all([serverProcessInstance.ensureIsReady(localConfig), getSchemaProps(options.editor)]).then(suggest(options, localConfig)).catch(addErrorNotification);
      },
      onDidInsertSuggestion: function onDidInsertSuggestion(data) {
        var editor = data.editor;
        var suggestion = data.suggestion;

        if (suggestion.retrigger) {
          setTimeout(function () {
            return triggerAutocomplete(editor);
          }, 1);
        } else {
          shouldSuppressAutocomplete = true;
          setTimeout(function () {
            shouldSuppressAutocomplete = false;
          }, 300);
        }
      }
    };
  }
};