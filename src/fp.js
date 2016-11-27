
import _concat from 'lodash-es/concat';
import _debounce from 'lodash-es/debounce';
import _filter from 'lodash-es/filter';
import _flatMap from 'lodash-es/flatMap';
import _get from 'lodash-es/get';
import _join from 'lodash-es/join';
import _map from 'lodash-es/map';
import _sortBy from 'lodash-es/sortBy';
import _split from 'lodash-es/split';
import _startsWith from 'lodash-es/startsWith';

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

export { default as allPass } from 'lodash-es/overEvery';
export { default as compact } from 'lodash-es/compact';
export { default as flow } from 'lodash-es/flow';
export { default as identity } from 'lodash-es/identity';
export { default as trim } from 'lodash-es/trim';
