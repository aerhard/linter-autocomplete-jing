import { ParserConfig } from '../getParserConfig';
import { AutocompleteConfig } from '../xmlService/util';
import XmlService from '../xmlService/XmlService';
import { AutocompleteContext } from './util';
declare const suggest: (ctx: AutocompleteContext, autocompleteConfig: AutocompleteConfig, parserConfig: ParserConfig, xmlService: XmlService) => Promise<import("./util").Suggestion[]>;
export default suggest;
