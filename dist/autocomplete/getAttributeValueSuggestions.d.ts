import { ParserConfig } from '../getParserConfig';
import { AutocompleteConfig } from '../xmlService/util';
import XmlService from '../xmlService/XmlService';
import { AutocompleteContext, Suggestion } from './util';
declare const getAttributeValueSuggestions: (ctx: AutocompleteContext, autocompleteConfig: AutocompleteConfig, parserConfig: ParserConfig, xmlService: XmlService, hasDblQuotes: boolean) => Promise<Suggestion[]>;
export default getAttributeValueSuggestions;
