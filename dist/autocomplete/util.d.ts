import { Point, ScopeDescriptor, TextEditor } from 'atom';
export interface AutocompleteContext {
    editor: TextEditor;
    bufferPosition: Point;
    scopeDescriptor: ScopeDescriptor;
    prefix: string;
    activatedManually: boolean;
}
export interface Suggestion {
    snippet: string;
    displayText: string;
    type: 'attribute' | 'value' | 'tag';
    rightLabel?: string;
    replacementPrefix: string;
    description?: string;
    retrigger?: boolean;
}
export declare const precedingTagDelimiterIsStartTagStartDelimiter: ({ editor, bufferPosition, }: AutocompleteContext) => boolean;
export declare const getNextTagEndDelimiterPosition: ({ editor, bufferPosition, }: AutocompleteContext) => Point | null;
export declare const nextTagDelimiterIsEndDelimiter: (ctx: AutocompleteContext) => boolean;
export declare const createAttributeSuggestionTexts: (attNameWithNs: string, tabstopMarkerId: number, suggestAttributeValue: boolean) => {
    snippet: string;
    displayText: string;
    tabstopMarkerId: number;
};
