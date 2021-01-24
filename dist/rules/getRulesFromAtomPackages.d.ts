import { Package } from 'atom';
import { Rule } from './RuleStore';
interface SettingsFile {
    path: string;
    properties?: {
        '.text.xml'?: {
            validation?: {
                rules?: Array<Rule>;
            };
        };
    };
}
declare module 'atom' {
    interface Package {
        settings?: Array<SettingsFile>;
    }
}
declare const getRulesFromAtomPackages: (packages: Array<Package>) => Array<Rule>;
export default getRulesFromAtomPackages;
