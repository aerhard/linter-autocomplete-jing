'use strict';

var net = void 0;

var setServerConfig = function setServerConfig(args) {
  return function (server) {
    return new Promise(function (resolve, reject) {
      if (!net) net = require('net');

      var socket = new net.Socket();

      socket.on('connect', function () {
        var headers = args.map(function (arg) {
          return '-' + arg + '\n';
        }).join('');
        socket.end(headers);
      });
      socket.on('close', resolve);
      socket.on('error', function (err) {
        socket.destroy();
        reject(err);
      });

      socket.connect({ port: server.port });
    });
  };
};

module.exports = setServerConfig;