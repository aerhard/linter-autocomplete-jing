import { TextEditor } from 'atom'

import { LinterMessage, ParserConfig } from '../getParserConfig'
import XmlService from '../xmlService/XmlService'
import createLinterMessages, { ValidationConfig } from './createLinterMessages'

/**
 * Requests validation of the current XML document from the XMLService and
 * transforms the response into linter messages.
 */
const validate = async (
  textEditor: TextEditor,
  validationConfig: ValidationConfig,
  parserConfig: ParserConfig,
  xmlService: XmlService
): Promise<Array<LinterMessage>> => {
  const rawValidationMessages = await xmlService.requestValidation(
    parserConfig,
    textEditor.getText()
  )

  const messages = createLinterMessages(
    rawValidationMessages,
    textEditor,
    validationConfig,
    parserConfig
  )

  return messages
}

export default validate
