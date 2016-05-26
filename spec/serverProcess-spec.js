'use babel';

import path from 'path';
import serverProcess from '../lib/serverProcess';

describe('serverProcess', () => {
  describe('given a wrong java path', () => {
    it('should return a rejected promise', () => {
      const promise = serverProcess.createIsReadyPromise({
        javaExecutablePath: path.resolve(__dirname, 'missing-java-executable'),
      });

      waitsForPromise(
        () => promise
        .then(() => {
          throw new Error('expected error');
        })
        .catch(err => {
          expect(err instanceof Error).toBe(true);
        })
      );
    });
  });
});
