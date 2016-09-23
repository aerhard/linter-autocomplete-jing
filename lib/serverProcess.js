'use strict';

var _net = require('net');

var spawn = void 0;
var path = void 0;

var portRegex = /XML Tools Server listening on port (\d+)/;
var jarPath = '../vendor/xml-tools-server-0.4.0.jar';
var initialPort = 0;

function ServerProcess() {
  this.state = this.STOPPED;
  this.isReadyPromise = null;
  this.javaProcess = null;
  this.port = null;
}

ServerProcess.prototype = {
  STOPPED: 'STOPPED',
  INITIALIZING: 'INITIALIZING',
  READY: 'READY',

  getState: function getState() {
    return this.state;
  },
  isReady: function isReady() {
    return this.state === this.READY;
  },
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

    this.state = this.INITIALIZING;

    return new Promise(function (resolve, reject) {
      var args = [].concat(config.jvmArguments.split(/\s+/), ['-jar', path.resolve(__dirname, jarPath), initialPort, config.schemaCacheSize]);
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
        _this2.setExecutionListeners();
        _this2.state = _this2.READY;
        resolve(_this2);
      } else {
        reject(new ServerProcess.Error('Unexpected server start message "' + data + '"'));
        _this2.exit();
      }
    };

    this.javaProcess.stdout.on('data', onData);
    this.javaProcess.stderr.on('data', onData);

    this.javaProcess.on('error', function (err) {
      reject(new ServerProcess.Error('Failed to execute "' + config.javaExecutablePath + '".\n' + 'Please adjust the Java executable path in the "linter-autocomplete-jing" ' + 'package settings', err));
      _this2.exit();
    });
  },
  onStdOut: function onStdOut() {},
  onStdErr: function onStdErr(data) {
    console.error('Server message on stderr: ' + data); // eslint-disable-line
  },
  onError: function onError(err) {
    console.error('Server error:', err); // eslint-disable-line
  },
  setExecutionListeners: function setExecutionListeners() {
    var _this3 = this;

    this.javaProcess.stdout.on('data', function (data) {
      return _this3.onStdOut(data);
    });
    this.javaProcess.stderr.on('data', function (data) {
      return _this3.onStdErr(data);
    });

    this.javaProcess.on('error', function (err) {
      _this3.onError(err);
      _this3.exit();
    });
  },
  removeListeners: function removeListeners() {
    this.javaProcess.stdout.removeAllListeners('data');
    this.javaProcess.stderr.removeAllListeners('data');
    this.javaProcess.removeAllListeners('error');
  },
  exit: function exit() {
    this.state = this.STOPPED;
    if (this.javaProcess) {
      this.removeListeners();
      this.javaProcess.kill();
      this.javaProcess = null;
    }
    this.isReadyPromise = null;
    this.port = null;
  },
  sendRequest: function sendRequest(headers, body) {
    var port = this.port;
    return new Promise(function (resolve, reject) {
      var response = '';

      var socket = new _net.Socket();

      socket.on('connect', function () {
        socket.write(headers.map(function (header) {
          return '-' + header + '\n';
        }).join(''));

        if (body !== null) {
          socket.write('\n');
          socket.write(body);
        }

        socket.end();
      });

      socket.on('data', function (data) {
        response += data.toString();
      });

      socket.on('close', function () {
        resolve(response);
      });

      socket.on('error', function (err) {
        socket.destroy();
        reject(err);
      });

      socket.connect({ port: port });
    });
  }
};

var instance = null;

ServerProcess.getInstance = function () {
  if (instance === null) {
    instance = new ServerProcess();
  }
  return instance;
};

ServerProcess.Error = function (message, err) {
  this.name = 'ServerProcess.Error';
  this.message = message;
  this.stack = err ? err.stack : new Error().stack;
};

ServerProcess.Error.prototype = Object.create(Error.prototype);

module.exports = ServerProcess;