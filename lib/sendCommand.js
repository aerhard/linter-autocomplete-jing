'use strict';

var net = void 0;

var sendCommand = function sendCommand(args) {
  return function (server) {
    return new Promise(function (resolve, reject) {
      if (!net) net = require('net');

      var socket = new net.Socket();

      socket.on('connect', function () {
        var headers = args.map(function (arg) {
          return '-' + arg + '\n';
        }).join('');
        socket.write(headers);
        console.log('headers', headers);
        socket.end();
      });
      socket.on('close', resolve);
      socket.on('error', reject);

      socket.connect({ port: server.port });
    });
  };
};

module.exports = sendCommand;