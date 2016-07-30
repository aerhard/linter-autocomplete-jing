
import { Socket } from 'net';

const sendRequest = (headers, body, port) =>
  new Promise((resolve, reject) => {
    let response = '';

    const socket = new Socket();

    socket.on('connect', () => {
      socket.write(
        headers
          .map(header => `-${header}\n`)
          .join('')
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

module.exports = sendRequest;
