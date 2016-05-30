'use strict';

var _atom = require('atom');

var _serverProcess = require('./serverProcess');

var _serverProcess2 = _interopRequireDefault(_serverProcess);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validate = void 0;
var setServerConfig = void 0;
var getSchemaProps = void 0;
var subscriptions = void 0;

var localConfig = {};

var addErrorNotification = function addErrorNotification(err) {
  atom.notifications.addError('[Linter-Jing] ' + err.message, {
    detail: err.stack,
    dismissable: true
  });
  return [];
};

var setServerConfigIfReady = function setServerConfigIfReady(args) {
  if (_serverProcess2.default.isReadyPromise) {
    if (!setServerConfig) setServerConfig = require('./setServerConfig');
    _serverProcess2.default.isReadyPromise.then(setServerConfig(args)).catch(addErrorNotification);
  }
};

var setLocalConfig = function setLocalConfig(key) {
  return function (value) {
    localConfig[key] = value;
    if (!_serverProcess2.default.isReady) return;

    if (['javaExecutablePath', 'jvmArguments'].includes(key)) {
      _serverProcess2.default.exit();
    } else if (key === 'schemaCacheSize') {
      setServerConfigIfReady(['S', value]);
    }
  };
};

module.exports = {
  config: {
    javaExecutablePath: {
      type: 'string',
      default: 'java'
    },
    jvmArguments: {
      type: 'string',
      title: 'JVM Arguments',
      default: '-Xms32m -Xmx256m'
    },
    schemaCacheSize: {
      type: 'integer',
      minimum: 0,
      default: 10
    },
    displaySchemaWarnings: {
      title: 'Display Schema Parser Warnings',
      type: 'boolean',
      default: false
    },
    xmlCatalog: {
      title: 'XML Catalog',
      type: 'string',
      default: ''
    }
  },

  activate: function activate() {
    require('atom-package-deps').install();

    subscriptions = new _atom.CompositeDisposable();

    Object.keys(this.config).forEach(function (key) {
      return subscriptions.add(atom.config.observe('linter-jing.' + key, setLocalConfig(key)));
    });

    subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-jing:clear-schema-cache': function linterJingClearSchemaCache() {
        return setServerConfigIfReady(['C']);
      }
    }));

    _serverProcess2.default.ensureIsReady(localConfig).catch(addErrorNotification);
  },
  deactivate: function deactivate() {
    subscriptions.dispose();
    _serverProcess2.default.exit();
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
        return Promise.all([_serverProcess2.default.ensureIsReady(localConfig), getSchemaProps(textEditor)]).then(validate(textEditor, localConfig)).catch(addErrorNotification);
      }
    };
  }
};