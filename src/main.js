
import { CompositeDisposable } from 'atom';
import serverProcess from './serverProcess';

let validate;
let setServerConfig;
let getSchemaProps;
let subscriptions;

const localConfig = {};

const addErrorNotification = err => {
  atom.notifications.addError(`[Linter-Jing] ${err.message}`, {
    detail: err.stack,
    dismissable: true,
  });
  return [];
};

const setServerConfigIfReady = args => {
  if (serverProcess.isReadyPromise) {
    if (!setServerConfig) setServerConfig = require('./setServerConfig');
    serverProcess.isReadyPromise
      .then(setServerConfig(args))
      .catch(addErrorNotification);
  }
};

const setLocalConfig = key => value => {
  localConfig[key] = value;
  if (!serverProcess.isReady) return;

  if (['javaExecutablePath', 'jvmArguments'].includes(key)) {
    serverProcess.exit();
  } else if (key === 'schemaCacheSize') {
    setServerConfigIfReady(['S', value]);
  }
};

module.exports = {
  config: {
    javaExecutablePath: {
      type: 'string',
      default: 'java',
    },
    jvmArguments: {
      type: 'string',
      title: 'JVM Arguments',
      default: '-Xms32m -Xmx256m',
    },
    schemaCacheSize: {
      type: 'integer',
      minimum: 0,
      default: 10,
    },
    displaySchemaWarnings: {
      title: 'Display Schema Parser Warnings',
      type: 'boolean',
      default: false,
    },
    xmlCatalog: {
      title: 'XML Catalog',
      type: 'string',
      default: '',
    },
  },

  activate() {
    require('atom-package-deps').install();

    subscriptions = new CompositeDisposable();

    Object
      .keys(this.config)
      .forEach(key =>
        subscriptions.add(
          atom.config.observe(`linter-jing.${key}`, setLocalConfig(key))
        )
      );

    subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-jing:clear-schema-cache': () => setServerConfigIfReady(['C']),
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
};
