
import { Socket } from 'net';
import spawn from 'cross-spawn';
import path from 'path';

const portRegex = /XML Tools Server listening on port (\d+)/;
const jarPath = '../vendor/xml-tools-server-0.4.8.jar';
const initialPort = 0;

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

  getState() {
    return this.state;
  },

  isReady() {
    return this.state === this.READY;
  },

  ensureIsReady(config) {
    if (!this.isReadyPromise) {
      this.isReadyPromise = this.createIsReadyPromise(config);
    }
    return this.isReadyPromise;
  },

  createIsReadyPromise(config) {
    this.state = this.INITIALIZING;

    return new Promise((resolve, reject) => {
      const args = [
        ...config.jvmArguments.split(/\s+/),
        '-jar',
        path.resolve(__dirname, jarPath),
        initialPort,
        config.schemaCacheSize,
      ];
      this.javaProcess = spawn(config.javaExecutablePath, args, {});
      this.setStartupListeners(config, resolve, reject);
    });
  },

  setStartupListeners(config, resolve, reject) {
    const onData = (data) => {
      const match = data.toString().match(portRegex);
      if (match) {
        this.port = Number(match[1]);
        this.removeListeners();
        this.setExecutionListeners();
        this.state = this.READY;
        resolve(this);
      } else {
        reject(new ServerProcess.Error(`Unexpected server start message "${data}"`));
        this.exit();
      }
    };

    this.javaProcess.stdout.on('data', onData);
    this.javaProcess.stderr.on('data', onData);

    this.javaProcess.on('error', (err) => {
      reject(new ServerProcess.Error(`Failed to execute "${config.javaExecutablePath}".\n` +
        'Please adjust the Java executable path in the "linter-autocomplete-jing" ' +
        'package settings', err));
      this.exit();
    });
  },

  onStdOut() {},

  onStdErr(data) {
    console.error(`Server message on stderr: ${data}`); // eslint-disable-line
  },

  onError(err) {
    console.error('Server error:', err); // eslint-disable-line
  },

  setExecutionListeners() {
    this.javaProcess.stdout.on('data', data => this.onStdOut(data));
    this.javaProcess.stderr.on('data', data => this.onStdErr(data));

    this.javaProcess.on('error', (err) => {
      this.onError(err);
      this.exit();
    });
  },

  removeListeners() {
    this.javaProcess.stdout.removeAllListeners('data');
    this.javaProcess.stderr.removeAllListeners('data');
    this.javaProcess.removeAllListeners('error');
  },

  exit() {
    this.state = this.STOPPED;
    if (this.javaProcess) {
      this.removeListeners();
      this.javaProcess.kill();
      this.javaProcess = null;
    }
    this.isReadyPromise = null;
    this.port = null;
  },

  sendRequest(headers, body) {
    const port = this.port;
    return new Promise((resolve, reject) => {
      let response = '';

      const socket = new Socket();

      socket.on('connect', () => {
        socket.write(
          headers
            .map(header => `-${header}\n`)
            .join(''),
        );

        if (body !== null) {
          socket.write('\n');
          socket.write(body);
        }

        socket.end();
      });

      socket.on('data', (data) => {
        response += data.toString();
      });

      socket.on('close', () => {
        resolve(response);
      });

      socket.on('error', (err) => {
        socket.destroy();
        reject(err);
      });

      socket.connect({ port });
    });
  },
};

let instance = null;

ServerProcess.getInstance = function() {
  if (instance === null) {
    instance = new ServerProcess();
  }
  return instance;
};

ServerProcess.Error = function(message, err) {
  this.name = 'ServerProcess.Error';
  this.message = message;
  this.stack = err ? err.stack : new Error().stack;
};

ServerProcess.Error.prototype = Object.create(Error.prototype);

export default ServerProcess;
