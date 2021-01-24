import path from 'path'

import ServerProcessManager from './ServerProcessManager'

describe('ServerProcessManager', () => {
  describe('ensurePort()', () => {
    describe('given a wrong java path', () => {
      it('should return a rejected promise', async () => {
        const serverProcessManager = new ServerProcessManager()

        const config = {
          javaExecutablePath: path.resolve(
            __dirname,
            'missing-java-executable'
          ),
          jvmArguments: '',
          schemaCacheSize: 10,
        }

        try {
          await serverProcessManager.ensurePort(config)
          fail()
        } catch (err) {} // eslint-disable-line no-empty
      })
    })
  })
})
