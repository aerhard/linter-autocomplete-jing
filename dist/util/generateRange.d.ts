import { TextEditor } from 'atom';
export declare type RangeCompatible = [[number, number], [number, number]];
declare function generateRange(textEditor: TextEditor, line?: number): RangeCompatible;
export default generateRange;
