'use strict';

var _fp = require('lodash/fp');

var _atom = require('atom');

var _serverProcess = require('./serverProcess');

var _serverProcess2 = _interopRequireDefault(_serverProcess);

var _ruleProcessor = require('./ruleProcessor');

var _ruleProcessor2 = _interopRequireDefault(_ruleProcessor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line
var serverProcessInstance = _serverProcess2.default.getInstance();

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
var parsedRules = [];
var initialPackagesActivated = false;
var shouldSuppressAutocomplete = false;
var grammarScopes = [];

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
    serverProcessInstance.isReadyPromise.then(function () {
      return serverProcessInstance.sendRequest(args, null);
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

var updateGrammarScopes = function updateGrammarScopes() {
  var grammars = atom.grammars.getGrammars();
  var newGrammarScopes = (0, _fp.flow)((0, _fp.map)('scopeName'), (0, _fp.filter)((0, _fp.startsWith)('text.xml')))(grammars);

  grammarScopes.splice.apply(grammarScopes, [0, grammarScopes.length].concat(newGrammarScopes));
};

var updateRules = function updateRules() {
  var activePackages = atom.packages.getActivePackages();

  var rules = (0, _fp.flow)((0, _fp.flatMap)('settings'), (0, _fp.flatMap)(function (_ref) {
    var settingsPath = _ref.path;
    var scopedProperties = _ref.scopedProperties;
    return (0, _fp.flow)((0, _fp.get)(['.text.xml', 'validation', 'rules']), (0, _fp.map)((0, _fp.set)('settingsPath', settingsPath)))(scopedProperties);
  }), _fp.compact)(activePackages);

  parsedRules = _ruleProcessor2.default.parse(rules);
};

var handlePackageChanges = function handlePackageChanges() {
  updateGrammarScopes();
  updateRules();
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

    var setPackageListeners = function setPackageListeners() {
      subscriptions.add(atom.packages.onDidActivatePackage(handlePackageChanges));
      subscriptions.add(atom.packages.onDidDeactivatePackage(handlePackageChanges));
    };

    if (initialPackagesActivated) {
      setPackageListeners();
    } else {
      subscriptions.add(atom.packages.onDidActivateInitialPackages(function () {
        initialPackagesActivated = true;
        handlePackageChanges();
        setPackageListeners();
      }));
    }

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
      grammarScopes: grammarScopes,
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        return Promise.all([serverProcessInstance.ensureIsReady(localConfig), getSchemaProps(textEditor, parsedRules, localConfig)]).then(validate(textEditor, localConfig)).catch(addErrorNotification);
      }
    };
  },
  provideAutocomplete: function provideAutocomplete() {
    if (!suggest) suggest = require('./suggest');
    if (!getSchemaProps) getSchemaProps = require('./getSchemaProps');

    return {
      selector: '.text.xml',
      disableForSelector: '.comment, .string.unquoted.cdata.xml',
      inclusionPriority: localConfig.autocompletePriority,
      excludeLowerPriority: true,
      getSuggestions: function getSuggestions(options) {
        if (shouldSuppressAutocomplete) {
          cancelAutocomplete(options.editor);
          shouldSuppressAutocomplete = false;
          return null;
        }

        return Promise.all([serverProcessInstance.ensureIsReady(localConfig), getSchemaProps(options.editor, parsedRules, localConfig)]).then(suggest(options, localConfig)).catch(addErrorNotification);
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