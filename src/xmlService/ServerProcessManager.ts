import { ChildProcess } from 'child_process'
import path from 'path'

import spawn from 'cross-spawn'

import logError from '../util/logError'
import showErrorNotification from '../util/showErrorNotification'

const jarPath = '../vendor/xml-tools-server-0.4.8.jar'

/**
 * Global server configuration.
 */
export interface ServerConfig {
  jvmArguments: string
  javaExecutablePath: string
  schemaCacheSize: number
}

class ServerProcessError extends Error {
  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'ServerProcessError'
    if (cause) {
      this.stack = cause.stack
    }
  }
}

enum State {
  STOPPED,
  INITIALIZING,
  READY,
}

/**
 * Manages startup and shutdown of the Java server process.
 */
export default class ServerProcessManager {
  private state: State = State.STOPPED

  /**
   * A promise resolving with the Java server's port once server
   * startup is complete. `null` when the server has been shut down
   * or server startup hasn't been triggered yet.
   */
  private portPromise: Promise<number> | null = null
  private javaProcess: ChildProcess | null = null

  public isStopped() {
    return this.state === State.INITIALIZING
  }

  /**
   * Returns a promise resolving with the server's port if server startup is
   * complete.
   */
  public async getPortIfReadyNow() {
    if (this.state !== State.READY) return null

    return this.portPromise
  }

  /**
   * Returns a promise resolving with the server's port if server startup has
   * already been triggered.
   */
  public async getPortIfStartupTriggered() {
    return this.portPromise
  }

  /**
   * Returns a promise resolving with the server's port. If server startup
   * hasn't been triggered yet or the server has been shut down, a new server
   * process gets started.
   */
  public ensurePort(config: ServerConfig) {
    if (!this.portPromise) {
      this.portPromise = this.startup(config)
    }
    return this.portPromise
  }

  public shutdown() {
    this.state = State.STOPPED
    if (this.javaProcess) {
      this.removeListeners(this.javaProcess)
      this.javaProcess.kill()
      this.javaProcess = null
    }
    this.portPromise = null
  }

  /**
   * Starts the Java server process and returns a promise resolving with the
   * port of the Java server.
   */
  private async startup(config: ServerConfig) {
    this.state = State.INITIALIZING

    try {
      const args = [
        ...config.jvmArguments.split(/\s+/),
        '-jar',
        path.resolve(__dirname, jarPath),
        '0', // initial port
        String(config.schemaCacheSize),
      ]
      this.javaProcess = spawn(config.javaExecutablePath, args, {})

      const port = await this.waitForPort(
        config.javaExecutablePath,
        this.javaProcess
      )

      this.removeListeners(this.javaProcess)
      this.setDefaultListeners(this.javaProcess)

      this.state = State.READY

      return port
    } catch (err) {
      this.shutdown()
      throw err
    }
  }

  /**
   * Returns a Promise resolving with the Java server's port. The port is read
   * from the server's startup message on the standard output stream. If the
   * port couldn't get determined, if data arrives on the standard error stream
   * or if the process emits an error event, the Promise gets rejected.
   */
  private waitForPort(
    javaExecutablePath: string,
    javaProcess: ChildProcess
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!javaProcess.stdout || !javaProcess.stderr) {
        return reject(
          new ServerProcessError(
            'Configuration error: the Java child process must provide standard streams'
          )
        )
      }

      javaProcess.stdout.on('data', (data: Buffer) => {
        const match = data
          .toString()
          .match(/XML Tools Server listening on port (\d+)/)
        if (match) {
          const port = Number(match[1])
          resolve(port)
        } else {
          reject(
            new ServerProcessError(
              `Unexpected message on server startup: "${data}"`
            )
          )
        }
      })

      javaProcess.stderr.on('data', (data: Buffer) => {
        reject(
          new ServerProcessError(
            `Unexpected error on server startup: "${data}"`
          )
        )
      })

      javaProcess.on('error', (err: Error) => {
        reject(
          new ServerProcessError(
            'Failed to run Java server. Please make sure Java is installed ' +
              'and can be run with the Java executable path in the ' +
              '"linter-autocomplete-jing" package settings ' +
              `("${javaExecutablePath}").`,
            err
          )
        )
      })
    })
  }

  private setDefaultListeners(javaProcess: ChildProcess) {
    javaProcess.stderr?.on('data', (data) => {
      logError(`Server message on standard error stream: "${data}"`)
    })

    javaProcess.on('error', (err) => {
      showErrorNotification(err)
      this.shutdown()
    })
  }

  private removeListeners(javaProcess: ChildProcess) {
    javaProcess.stdout?.removeAllListeners('data')
    javaProcess.stderr?.removeAllListeners('data')
    javaProcess.removeAllListeners('error')
  }
}
