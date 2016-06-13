
let spawn;
let path;

const portRegex = /Validation server listening on port (\d+)/;
const jarPath = '../vendor/validation-server-0.2.2.jar';
const port = 0;

function ServerProcessError(message, err) {
  this.name = 'ServerProcessError';
  this.message = message;
  this.stack = err ? err.stack : new Error().stack;
}
ServerProcessError.prototype = Object.create(Error.prototype);

module.exports = {
  ServerProcessError,

  isReady: false,
  isReadyPromise: null,
  javaProcess: null,
  port: null,

  ensureIsReady(config) {
    if (!this.isReadyPromise) {
      this.isReadyPromise = this.createIsReadyPromise(config);
    }
    return this.isReadyPromise;
  },

  createIsReadyPromise(config) {
    if (!spawn) spawn = require('cross-spawn');
    if (!path) path = require('path');

    return new Promise((resolve, reject) => {
      const args = [
        ...config.jvmArguments.split(/\s+/),
        '-jar',
        path.resolve(__dirname, jarPath),
        port,
        config.schemaCacheSize,
      ];
      this.javaProcess = spawn(config.javaExecutablePath, args, {});
      this.setStartupListeners(config, resolve, reject);
    });
  },

  setStartupListeners(config, resolve, reject) {
    const onData = data => {
      const match = data.toString().match(portRegex);
      if (match) {
        this.port = Number(match[1]);
        this.removeListeners();
        this.setRuntimeListeners();
        this.isReady = true;
        resolve(this);
      } else {
        reject(new ServerProcessError(`Unexpected server start message "${data}"`));
        this.exit();
      }
    };

    this.javaProcess.stdout.on('data', onData);
    this.javaProcess.stderr.on('data', onData);

    this.javaProcess.on('error', err => {
      reject(new ServerProcessError(`Failed to execute "${config.javaExecutablePath}".\n` +
        'Please adjust the Java executable path in the "linter-jing" package settings', err));
      this.exit();
    });
  },

  setRuntimeListeners() {
    this.javaProcess.stderr.on('data', data => {
      console.error(`Server reported error: ${data}`); // eslint-disable-line
    });

    this.javaProcess.on('error', err => {
      atom.notifications.addError(`[Linter-Jing] ${err.message}`, {
        detail: err.stack,
        dismissable: true,
      });
      this.exit();
    });
  },

  removeListeners() {
    this.javaProcess.stdout.removeAllListeners('data');
    this.javaProcess.stderr.removeAllListeners('data');
    this.javaProcess.removeAllListeners('error');
  },

  exit() {
    this.isReady = false;
    if (this.javaProcess) {
      this.removeListeners();
      this.javaProcess.kill();
    }
    this.javaProcess = null;
    this.isReadyPromise = null;
    this.port = null;
  },
};
