import { TextEditor } from 'atom';
import { AutocompleteContext, Suggestion } from './autocomplete/util';
import { LinterMessage } from './getParserConfig';
import XmlService from './xmlService/XmlService';
export declare const xmlService: XmlService;
export declare function activate(): void;
export declare function deactivate(): void;
export declare function provideLinter(): {
    name: string;
    grammarScopes: string[];
    scope: string;
    lintsOnChange: boolean;
    lint(textEditor: TextEditor): Promise<Array<LinterMessage> | null>;
};
export declare function provideAutocomplete(): {
    selector: string;
    disableForSelector: string;
    inclusionPriority: number;
    excludeLowerPriority: boolean;
    getSuggestions(ctx: AutocompleteContext): Promise<Array<Suggestion> | null>;
    onDidInsertSuggestion({ editor, suggestion, }: {
        editor: TextEditor;
        suggestion: Suggestion;
    }): void;
};
