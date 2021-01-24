import { ParserConfig } from '../getParserConfig'
import logError from '../util/logError'
import showErrorNotification from '../util/showErrorNotification'
import { request } from './client'
import ServerProcessManager, { ServerConfig } from './ServerProcessManager'
import {
  AutocompleteConfig,
  SuggestionOptions,
  buildAutocompleteRequestHeaders,
  buildValidationRequestHeaders,
} from './util'

export interface RawSuggestion {
  value: string
  documentation?: Array<string>
  listItem?: boolean
  empty?: boolean
  closing?: boolean
  attributes?: Array<string>
}

export interface RawValidationMessage {
  lang: string
  systemId: string
  line: number
  level: string
  text: string
}

const validationMessageRegex = /^([a-z0-9.]+?):((.*?):\s?)?((\d+):)?(?:\d+:\s)?(error|fatal|warning):\s(.*)$/

/**
 * Extracts message data from a plain-text Java error/warning.
 */
const getRawValidationMessage = (str: string): RawValidationMessage | null => {
  const match = validationMessageRegex.exec(str)
  if (!match) {
    logError(`Could not parse message "${str}"`)
    return null
  }

  const [, lang, , systemId, , line, level, text] = match

  return {
    lang,
    systemId,
    line: Number(line),
    level,
    text,
  }
}

/**
 * Provides an interface to request validation and autocomplete suggestions
 * from the Java server and handles its configuration and lifetime.
 */
export default class XmlService {
  private readonly serverProcessManager: ServerProcessManager

  private config: ServerConfig = {
    jvmArguments: '-Xms32m -Xmx256m',
    javaExecutablePath: 'java',
    schemaCacheSize: 10,
  }

  constructor(serverProcessManager?: ServerProcessManager) {
    this.serverProcessManager =
      serverProcessManager || new ServerProcessManager()
  }

  public async requestValidation(
    parserConfig: ParserConfig,
    body: string | null
  ): Promise<Array<RawValidationMessage | null>> {
    const port = await this.serverProcessManager.ensurePort(this.config)
    const headers = buildValidationRequestHeaders(parserConfig)

    const response = await request(port, headers, body)

    const messages = response
      .trim()
      .split(/\r?\n/)
      .map((responseLine: string) => {
        if (!responseLine) return null

        return getRawValidationMessage(responseLine)
      })

    return messages
  }

  public async requestAutocompleteSuggestions(
    parserConfig: ParserConfig,
    autocompleteConfig: AutocompleteConfig,
    suggestionOptions: SuggestionOptions,
    body: string | null
  ): Promise<Array<RawSuggestion>> {
    const port = await this.serverProcessManager.ensurePort(this.config)
    const headers = buildAutocompleteRequestHeaders(
      parserConfig,
      autocompleteConfig,
      suggestionOptions
    )

    try {
      const response = await request(port, headers, body)

      const rawSuggestions = JSON.parse(response)

      return rawSuggestions
    } catch (err) {
      logError('Error requesting suggestions', err)
      return []
    }
  }

  public setJavaExecutablePath(javaExecutablePath: string) {
    if (this.config.javaExecutablePath === javaExecutablePath) return

    this.config.javaExecutablePath = javaExecutablePath

    // `javaExecutablePath` gets read when the server process starts; in order
    // to update these settings, we shut down the process here so it will get
    // restarted with the new settings on the next call of
    // `ServerProcessManager.ensurePort()`
    if (!this.serverProcessManager.isStopped()) {
      this.serverProcessManager.shutdown()
    }
  }

  public setJvmArguments(jvmArguments: string) {
    if (this.config.jvmArguments === jvmArguments) return

    this.config.jvmArguments = jvmArguments

    // `jvmArguments` gets read when the server process starts; in order
    // to update these settings, we shut down the process here so it will get
    // restarted with the new settings on the next call of
    // `ServerProcessManager.ensurePort()`
    if (!this.serverProcessManager.isStopped()) {
      this.serverProcessManager.shutdown()
    }
  }

  public async setSchemaCacheSize(schemaCacheSize: number) {
    if (this.config.schemaCacheSize === schemaCacheSize) return

    this.config.schemaCacheSize = schemaCacheSize

    try {
      const port = await this.serverProcessManager.getPortIfStartupTriggered()

      // We only need to send a request to the server to update
      // `schemaCacheSize` when server startup has already been triggered. If
      // not, then the server will receive the latest value of `schemaCacheSize`
      // on the next call of `ServerProcessManager.ensurePort()`
      if (port === null) return

      await request(port, ['S', schemaCacheSize], null)
    } catch (err) {
      showErrorNotification(err)
    }
  }

  public async clearSchemaCache() {
    try {
      const port = await this.serverProcessManager.getPortIfReadyNow()

      // the server's schema cache is initially empty so there's no need to
      // clear it when the server is not yet ready to process requests
      if (port === null) return

      await request(port, ['C'], null)
    } catch (err) {
      showErrorNotification(err)
    }
  }

  public shutdown() {
    this.serverProcessManager.shutdown()
  }
}
