import ServerProcess from './ServerProcess';
import RuleManager from './RuleManager';
declare const _default: {
    ServerProcess: typeof ServerProcess;
    ruleManager: RuleManager;
    activate(): void;
    deactivate(): void;
    provideLinter(): {
        name: string;
        grammarScopes: any[];
        scope: string;
        lintsOnChange: boolean;
        lint(textEditor: any): Promise<any>;
    };
    provideAutocomplete(): {
        selector: string;
        disableForSelector: string;
        inclusionPriority: any;
        excludeLowerPriority: boolean;
        getSuggestions(options: any): Promise<any> | null;
        onDidInsertSuggestion(data: any): void;
    };
};
export default _default;
