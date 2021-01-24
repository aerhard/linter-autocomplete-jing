import { ParserConfig } from '../getParserConfig';
import { AutocompleteConfig } from '../xmlService/util';
import XmlService from '../xmlService/XmlService';
import { AutocompleteContext, Suggestion } from './util';
declare const getAttributeNameSuggestions: (ctx: AutocompleteContext, autocompleteConfig: AutocompleteConfig, parserConfig: ParserConfig, xmlService: XmlService, textPrecedingCursorInSameLine: string) => Promise<Suggestion[]>;
export default getAttributeNameSuggestions;
