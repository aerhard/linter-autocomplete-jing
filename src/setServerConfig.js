
let net;

const setServerConfig = args => server =>
  new Promise((resolve, reject) => {
    if (!net) net = require('net');

    const socket = new net.Socket();

    socket.on('connect', () => {
      const headers = args
        .map(arg => `-${arg}\n`)
        .join('');
      socket.end(headers);
    });
    socket.on('close', resolve);
    socket.on('error', err => {
      socket.destroy();
      reject(err);
    });

    socket.connect({ port: server.port });
  });

module.exports = setServerConfig;
