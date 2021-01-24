import { TextEditor } from 'atom';
import { LinterMessage, ParserConfig } from '../getParserConfig';
import { RawValidationMessage } from '../xmlService/XmlService';
export interface ValidationConfig {
    displaySchemaWarnings: boolean;
}
declare const createLinterMessages: (rawValidationMessages: Array<RawValidationMessage | null>, textEditor: TextEditor, validationConfig: ValidationConfig, parserConfig: ParserConfig) => Array<LinterMessage>;
export default createLinterMessages;
