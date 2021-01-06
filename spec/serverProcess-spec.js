'use babel';

import path from 'path';
import { it } from 'jasmine-fix';
import main from '../lib/main';

const ServerProcess = main.ServerProcess;

describe('ServerProcess', () => {
  describe('given a wrong java path', () => {
    it('should return a rejected promise', async() => {
      const serverProcessInstance = ServerProcess.getInstance();

      try {
        await serverProcessInstance.createIsReadyPromise({
          javaExecutablePath: path.resolve(__dirname, 'missing-java-executable'),
        });
        fail();
      } catch (err) {} // eslint-disable-line no-empty
    });
  });
});
