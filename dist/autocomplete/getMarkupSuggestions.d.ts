import { ParserConfig } from '../getParserConfig';
import { AutocompleteConfig } from '../xmlService/util';
import XmlService from '../xmlService/XmlService';
import { AutocompleteContext, Suggestion } from './util';
declare const getMarkupSuggestions: (ctx: AutocompleteContext, autocompleteConfig: AutocompleteConfig, parserConfig: ParserConfig, xmlService: XmlService, markupFragmentPrecedingCursor: string) => Promise<Suggestion[]>;
export default getMarkupSuggestions;
