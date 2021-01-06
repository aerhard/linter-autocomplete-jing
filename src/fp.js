
import _concat from 'lodash/concat';
import _debounce from 'lodash/debounce';
import _filter from 'lodash/filter';
import _flatMap from 'lodash/flatMap';
import _get from 'lodash/get';
import _join from 'lodash/join';
import _map from 'lodash/map';
import _sortBy from 'lodash/sortBy';
import _split from 'lodash/split';
import _startsWith from 'lodash/startsWith';

export const concat = a => b => _concat(a, b);
export const debounce = (a, b) => _debounce(b, a);
export const filter = a => b => _filter(b, a);
export const flatMap = a => b => _flatMap(b, a);
export const get = a => b => _get(b, a);
export const join = a => b => _join(b, a);
export const map = a => b => _map(b, a);
export const sortBy = a => b => _sortBy(b, a);
export const split = a => b => _split(b, a);
export const startsWith = a => b => _startsWith(b, a);

export { default as allPass } from 'lodash/overEvery';
export { default as compact } from 'lodash/compact';
export { default as flow } from 'lodash/flow';
export { default as identity } from 'lodash/identity';
export { default as trim } from 'lodash/trim';
