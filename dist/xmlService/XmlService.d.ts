import { ParserConfig } from '../getParserConfig';
import ServerProcessManager from './ServerProcessManager';
import { AutocompleteConfig, SuggestionOptions } from './util';
export interface RawSuggestion {
    value: string;
    documentation?: Array<string>;
    listItem?: boolean;
    empty?: boolean;
    closing?: boolean;
    attributes?: Array<string>;
}
export interface RawValidationMessage {
    lang: string;
    systemId: string;
    line: number;
    level: string;
    text: string;
}
export default class XmlService {
    private readonly serverProcessManager;
    private config;
    constructor(serverProcessManager?: ServerProcessManager);
    requestValidation(parserConfig: ParserConfig, body: string | null): Promise<Array<RawValidationMessage | null>>;
    requestAutocompleteSuggestions(parserConfig: ParserConfig, autocompleteConfig: AutocompleteConfig, suggestionOptions: SuggestionOptions, body: string | null): Promise<Array<RawSuggestion>>;
    setJavaExecutablePath(javaExecutablePath: string): void;
    setJvmArguments(jvmArguments: string): void;
    setSchemaCacheSize(schemaCacheSize: number): Promise<void>;
    clearSchemaCache(): Promise<void>;
    shutdown(): void;
}
