import { Rule } from './RuleStore';
declare const validateRules: (rules: Array<unknown>) => rules is Rule[];
export default validateRules;
