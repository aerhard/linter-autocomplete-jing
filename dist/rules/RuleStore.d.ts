export interface DocumentProps {
    rootScopes: readonly string[];
    filePath?: string;
    rootNs?: string;
    rootLocalName?: string;
    rootAttributes: Attributes;
    publicId?: string;
}
export interface Attributes {
    [key: string]: string;
}
interface RuleTestSpecs {
    grammarScope?: string;
    pathRegex?: string;
    rootNs?: string;
    rootLocalName?: string;
    rootAttributes?: Attributes;
    publicId?: string;
}
export declare type SchemaLang = 'rng' | 'rnc' | 'sch.iso' | 'sch.15' | 'xsd' | 'dtd' | 'none';
interface SchemaProps {
    path: string;
    lang: SchemaLang;
}
export interface RuleOutcome {
    xmlCatalog?: string;
    schemaProps?: Array<SchemaProps>;
    dtdValidation?: 'never' | 'always' | 'fallback';
    xIncludeAware?: boolean;
    xIncludeFixupBaseUris?: boolean;
    xIncludeFixupLanguage?: boolean;
}
export interface Rule {
    priority: number;
    test: RuleTestSpecs;
    outcome: RuleOutcome;
}
interface RuleMatcher {
    (documentProps: DocumentProps): boolean;
}
interface RuleWithMatcher {
    matches: RuleMatcher;
    outcome: RuleOutcome;
}
export default class RuleStore {
    private configRules;
    private packageRules;
    private allRules;
    setConfigRules(rules: Array<Rule>): void;
    setPackageRules(rules: Array<Rule>): void;
    getAll(): Array<RuleWithMatcher>;
    getMatchingOutcome(documentProps: DocumentProps): RuleOutcome | undefined;
}
export {};
