import { ParserConfig, SchemaPropsWithLine } from '../getParserConfig';
export interface AutocompleteConfig {
    autocompletePriority: number;
    autocompleteScope: {
        rng: boolean;
        rnc: boolean;
        xsd: boolean;
    };
    wildcardSuggestions: 'none' | 'localparts' | 'all';
}
export interface SuggestionOptions {
    type: 'N' | 'V' | 'E';
    attName?: string;
    tagEndDelimiterBufferIndex?: number;
}
export declare const buildValidationRequestHeaders: (parserConfig: ParserConfig) => Array<string>;
export declare const getSchemaForSuggestions: (autocompleteConfig: AutocompleteConfig, schemaProps: Array<SchemaPropsWithLine>) => SchemaPropsWithLine;
export declare const buildAutocompleteRequestHeaders: (parserConfig: ParserConfig, autocompleteConfig: AutocompleteConfig, suggestionOptions: SuggestionOptions) => Array<string | number>;
