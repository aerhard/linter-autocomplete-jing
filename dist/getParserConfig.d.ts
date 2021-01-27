import { TextEditor } from 'atom';
import RuleStore, { SchemaLang } from './rules/RuleStore';
import { RangeCompatible } from './util/generateRange';
export interface DefaultParserConfig {
    xmlCatalog: string;
    dtdValidation: 'never' | 'always' | 'fallback';
    xIncludeAware: boolean;
    xIncludeFixupBaseUris: boolean;
    xIncludeFixupLanguage: boolean;
}
export interface SchemaPropsWithLine {
    lang: SchemaLang;
    path: string | null;
    lineOfReference?: number;
}
export interface ParserConfig {
    filePath?: string;
    schemaProps: Array<SchemaPropsWithLine>;
    xmlCatalog: string;
    xIncludeAware: boolean;
    xIncludeFixupBaseUris: boolean;
    xIncludeFixupLanguage: boolean;
}
export interface LinterMessage {
    severity: 'warning' | 'error';
    excerpt: string;
    location: {
        file?: string;
        position: RangeCompatible;
    };
}
declare const getParserConfig: (textEditor: TextEditor, ruleStore: RuleStore, defaults: DefaultParserConfig) => {
    xmlModelWarnings: Array<LinterMessage>;
    parserConfig: ParserConfig;
};
export default getParserConfig;
