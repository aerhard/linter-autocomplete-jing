'use babel';

import path from 'path';
import main from '../lib/main.coffee';

const ServerProcess = main.ServerProcess;

describe('ServerProcess', () => {
  describe('given a wrong java path', () => {
    it('should return a rejected promise', () => {
      const serverProcessInstance = ServerProcess.getInstance();
      const promise = serverProcessInstance.createIsReadyPromise({
        javaExecutablePath: path.resolve(__dirname, 'missing-java-executable'),
      });

      waitsForPromise(
        () => promise
        .then(() => {
          throw new Error('expected error');
        })
        .catch((err) => {
          expect(err instanceof Error).toBe(true);
        }),
      );
    });
  });
});
