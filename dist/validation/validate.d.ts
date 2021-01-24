import { TextEditor } from 'atom';
import { LinterMessage, ParserConfig } from '../getParserConfig';
import XmlService from '../xmlService/XmlService';
import { ValidationConfig } from './createLinterMessages';
declare const validate: (textEditor: TextEditor, validationConfig: ValidationConfig, parserConfig: ParserConfig, xmlService: XmlService) => Promise<Array<LinterMessage>>;
export default validate;
