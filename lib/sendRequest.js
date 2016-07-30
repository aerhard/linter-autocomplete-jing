'use strict';

var _net = require('net');

var sendRequest = function sendRequest(headers, body, port) {
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
};

module.exports = sendRequest;