'use strict';

var spawn = void 0;
var path = void 0;

var portRegex = /XML Tools Server listening on port (\d+)/;
var jarPath = '../vendor/xml-tools-server-0.3.0.jar';
var port = 0;

function ServerProcessError(message, err) {
  this.name = 'ServerProcessError';
  this.message = message;
  this.stack = err ? err.stack : new Error().stack;
}
ServerProcessError.prototype = Object.create(Error.prototype);

module.exports = {
  ServerProcessError: ServerProcessError,

  isReady: false,
  isReadyPromise: null,
  javaProcess: null,
  port: null,

  ensureIsReady: function ensureIsReady(config) {
    if (!this.isReadyPromise) {
      this.isReadyPromise = this.createIsReadyPromise(config);
    }
    return this.isReadyPromise;
  },
  createIsReadyPromise: function createIsReadyPromise(config) {
    var _this = this;

    if (!spawn) spawn = require('cross-spawn');
    if (!path) path = require('path');

    return new Promise(function (resolve, reject) {
      var args = [].concat(config.jvmArguments.split(/\s+/), ['-jar', path.resolve(__dirname, jarPath), port, config.schemaCacheSize]);
      _this.javaProcess = spawn(config.javaExecutablePath, args, {});
      _this.setStartupListeners(config, resolve, reject);
    });
  },
  setStartupListeners: function setStartupListeners(config, resolve, reject) {
    var _this2 = this;

    var onData = function onData(data) {
      var match = data.toString().match(portRegex);
      if (match) {
        _this2.port = Number(match[1]);
        _this2.removeListeners();
        _this2.setRuntimeListeners();
        _this2.isReady = true;
        resolve(_this2);
      } else {
        reject(new ServerProcessError('Unexpected server start message "' + data + '"'));
        _this2.exit();
      }
    };

    this.javaProcess.stdout.on('data', onData);
    this.javaProcess.stderr.on('data', onData);

    this.javaProcess.on('error', function (err) {
      reject(new ServerProcessError('Failed to execute "' + config.javaExecutablePath + '".\n' + 'Please adjust the Java executable path in the "linter-jing" package settings', err));
      _this2.exit();
    });
  },
  setRuntimeListeners: function setRuntimeListeners() {
    var _this3 = this;

    this.javaProcess.stderr.on('data', function (data) {
      console.error('Server reported error: ' + data); // eslint-disable-line
    });

    this.javaProcess.on('error', function (err) {
      atom.notifications.addError('[Linter-Jing] ' + err.message, {
        detail: err.stack,
        dismissable: true
      });
      _this3.exit();
    });
  },
  removeListeners: function removeListeners() {
    this.javaProcess.stdout.removeAllListeners('data');
    this.javaProcess.stderr.removeAllListeners('data');
    this.javaProcess.removeAllListeners('error');
  },
  exit: function exit() {
    this.isReady = false;
    if (this.javaProcess) {
      this.removeListeners();
      this.javaProcess.kill();
    }
    this.javaProcess = null;
    this.isReadyPromise = null;
    this.port = null;
  }
};