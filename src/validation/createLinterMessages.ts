import { TextEditor } from 'atom'

import {
  LinterMessage,
  ParserConfig,
  SchemaPropsWithLine,
} from '../getParserConfig'
import generateRange from '../util/generateRange'
import { RawValidationMessage } from '../xmlService/XmlService'

export interface ValidationConfig {
  displaySchemaWarnings: boolean
}

/**
 * Creates a LinterMessage from message data referring to the current
 * XML document.
 */
const createCurrentDocumentLinterMessage = (
  rawValidationMessage: RawValidationMessage,
  filePath: string,
  textEditor: TextEditor
): LinterMessage => {
  return {
    severity:
      rawValidationMessage.level === 'warning'
        ? rawValidationMessage.level
        : 'error',
    excerpt:
      rawValidationMessage.lang === 'none'
        ? rawValidationMessage.text
        : `${
            rawValidationMessage.text
          } [${rawValidationMessage.lang.toUpperCase()}]`,
    location: {
      file: filePath,
      position: generateRange(textEditor, rawValidationMessage.line - 1),
    },
  }
}

/**
 * Creates a LinterMessage from message data referring to an external entity.
 * The message is relocated to the current XML document: When the entity is a
 * schema referenced from the current XML document, locates it at the schema
 * reference in the current XML document, otherwise puts it to the start of the
 * current XML document.
 */
const createExternalEntityLinterMessage = (
  rawValidationMessage: RawValidationMessage,
  filePath: string | undefined,
  textEditor: TextEditor,
  schemaProps: Array<SchemaPropsWithLine>
): LinterMessage | null => {
  const label =
    rawValidationMessage.level === 'warning'
      ? 'Schema parser warning: '
      : 'Could not process schema or catalog: '

  const schema = schemaProps.find(
    (sch) =>
      sch.path === rawValidationMessage.systemId &&
      sch.lang === rawValidationMessage.lang
  )

  return {
    severity: 'warning',
    excerpt: label + rawValidationMessage.text,
    location: {
      file: filePath,
      // when the path of the external entity matches a schema in the current
      // XML document, locate the message where the schema is referenced;
      // otherwise locate it at the start
      position: schema
        ? generateRange(textEditor, schema.lineOfReference)
        : [
            [0, 0],
            [0, 0],
          ],
    },
  }
}

/**
 * Creates linter messages from the response of a validation request to the
 * Java server.
 */
const createLinterMessages = (
  rawValidationMessages: Array<RawValidationMessage | null>,
  textEditor: TextEditor,
  validationConfig: ValidationConfig,
  parserConfig: ParserConfig
): Array<LinterMessage> => {
  const messages = rawValidationMessages
    .map((rawValidationMessage: RawValidationMessage | null) => {
      if (!rawValidationMessage) return null

      const filePath = textEditor.getPath()

      if (rawValidationMessage.systemId !== filePath) {
        // message refers to an external entity

        if (
          !validationConfig.displaySchemaWarnings &&
          rawValidationMessage.level === 'warning'
        ) {
          // exclude warnings referring to external entities when
          // `displaySchemaWarnings` in the user config isn't `true`
          return null
        }

        return createExternalEntityLinterMessage(
          rawValidationMessage,
          filePath,
          textEditor,
          parserConfig.schemaProps
        )
      }

      // message refers to current XML document
      return createCurrentDocumentLinterMessage(
        rawValidationMessage,
        filePath,
        textEditor
      )
    })
    .filter((message) => !!message)

  return messages as Array<LinterMessage>
}

export default createLinterMessages
