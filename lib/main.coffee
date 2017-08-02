`
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var atom$1 = require('atom');
var net = require('net');
var spawn = _interopDefault(require('cross-spawn'));
var path = _interopDefault(require('path'));
var sax = _interopDefault(require('sax'));

function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global && global.Object === Object && global;

var freeSelf = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function('return this')();

var _Symbol = root.Symbol;

var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
var nativeObjectToString = objectProto$1.toString;
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;
function getRawTag(value) {
  var isOwn = hasOwnProperty$1.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var objectProto$2 = Object.prototype;
var nativeObjectToString$1 = objectProto$2.toString;
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

function isObjectLike(value) {
  return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
}

var argsTag = '[object Arguments]';
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var propertyIsEnumerable = objectProto.propertyIsEnumerable;
var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};

var isArray = Array.isArray;

var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;
function isFlattenable(value) {
  return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}

function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;
  predicate || (predicate = isFlattenable);
  result || (result = []);
  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

function copyArray(source, array) {
  var index = -1,
      length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

function concat$1() {
  var length = arguments.length;
  if (!length) {
    return [];
  }
  var args = Array(length - 1),
      array = arguments[0],
      index = length;
  while (index--) {
    args[index - 1] = arguments[index];
  }
  return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
}

function isObject(value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return value != null && (type == 'object' || type == 'function');
}

var now = function now() {
  return root.Date.now();
};

var symbolTag = '[object Symbol]';
function isSymbol(value) {
  return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag;
}

var NAN = 0 / 0;
var reTrim = /^\s+|\s+$/g;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? other + '' : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}

var FUNC_ERROR_TEXT = 'Expected a function';
var nativeMax = Math.max;
var nativeMin = Math.min;
function debounce$1(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;
    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }
  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = undefined;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }
  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }
  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }
  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var baseFor = createBaseFor();

function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

function stubFalse() {
  return false;
}

var freeExports = (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
var freeModule = freeExports && (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer$1 = moduleExports ? root.Buffer : undefined;
var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : undefined;
var isBuffer = nativeIsBuffer || stubFalse;

var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

var MAX_SAFE_INTEGER$1 = 9007199254740991;
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}

var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag = '[object Function]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

var freeExports$1 = (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var freeProcess = moduleExports$1 && freeGlobal.process;
var nodeUtil = function () {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();

var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

var objectProto$3 = Object.prototype;
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$2.call(value, key)) && !(skipIndexes && (
    key == 'length' ||
    isBuff && (key == 'offset' || key == 'parent') ||
    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
    isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

var objectProto$5 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$5;
  return value === proto;
}

function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

var nativeKeys = overArg(Object.keys, Object);

var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var asyncTag = '[object AsyncFunction]';
var funcTag$1 = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
}

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

function createBaseEach(eachFunc, fromRight) {
  return function (collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);
    while (fromRight ? index-- : ++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

var baseEach = createBaseEach(baseForOwn);

function baseFilter(collection, predicate) {
  var result = [];
  baseEach(collection, function (value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

function eq(value, other) {
  return value === other || value !== value && other !== other;
}

function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  return index < 0 ? undefined : data[index][1];
}

function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}

function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);
  this.size = data.size;
  return result;
}

function stackGet(key) {
  return this.__data__.get(key);
}

function stackHas(key) {
  return this.__data__.has(key);
}

var coreJsData = root['__core-js_shared__'];

var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return func + '';
    } catch (e) {}
  }
  return '';
}

var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype;
var objectProto$6 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$4 = objectProto$6.hasOwnProperty;
var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty$4).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

function getValue(object, key) {
  return object == null ? undefined : object[key];
}

function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

var Map = getNative(root, 'Map');

var nativeCreate = getNative(Object, 'create');

function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var HASH_UNDEFINED = '__lodash_hash_undefined__';
var objectProto$7 = Object.prototype;
var hasOwnProperty$5 = objectProto$7.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$5.call(data, key) ? data[key] : undefined;
}

var objectProto$8 = Object.prototype;
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty$6.call(data, key);
}

var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
  return this;
}

function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map || ListCache)(),
    'string': new Hash()
  };
}

function isKeyable(value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED$2);
  return this;
}

function setCacheHas(value) {
  return this.__data__.has(value);
}

function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

function cacheHas(cache, key) {
  return cache.has(key);
}

var COMPARE_PARTIAL_FLAG$2 = 1;
var COMPARE_UNORDERED_FLAG$1 = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
      arrLength = array.length,
      othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = bitmask & COMPARE_UNORDERED_FLAG$1 ? new SetCache() : undefined;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome(other, function (othValue, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

var Uint8Array = root.Uint8Array;

function mapToArray(map) {
  var index = -1,
      result = Array(map.size);
  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

function setToArray(set) {
  var index = -1,
      result = Array(set.size);
  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

var COMPARE_PARTIAL_FLAG$3 = 1;
var COMPARE_UNORDERED_FLAG$2 = 2;
var boolTag$1 = '[object Boolean]';
var dateTag$1 = '[object Date]';
var errorTag$1 = '[object Error]';
var mapTag$1 = '[object Map]';
var numberTag$1 = '[object Number]';
var regexpTag$1 = '[object RegExp]';
var setTag$1 = '[object Set]';
var stringTag$1 = '[object String]';
var symbolTag$1 = '[object Symbol]';
var arrayBufferTag$1 = '[object ArrayBuffer]';
var dataViewTag$1 = '[object DataView]';
var symbolProto = _Symbol ? _Symbol.prototype : undefined;
var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$1:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag$1:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;
    case boolTag$1:
    case dateTag$1:
    case numberTag$1:
      return eq(+object, +other);
    case errorTag$1:
      return object.name == other.name && object.message == other.message;
    case regexpTag$1:
    case stringTag$1:
      return object == other + '';
    case mapTag$1:
      var convert = mapToArray;
    case setTag$1:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3;
      convert || (convert = setToArray);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;
    case symbolTag$1:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

function stubArray() {
  return [];
}

var objectProto$11 = Object.prototype;
var propertyIsEnumerable$1 = objectProto$11.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function (symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  });
};

function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

var COMPARE_PARTIAL_FLAG$4 = 1;
var objectProto$10 = Object.prototype;
var hasOwnProperty$8 = objectProto$10.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$8.call(other, key))) {
      return false;
    }
  }
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;
    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

var DataView = getNative(root, 'DataView');

var Promise$1 = getNative(root, 'Promise');

var Set = getNative(root, 'Set');

var WeakMap = getNative(root, 'WeakMap');

var mapTag$2 = '[object Map]';
var objectTag$2 = '[object Object]';
var promiseTag = '[object Promise]';
var setTag$2 = '[object Set]';
var weakMapTag$1 = '[object WeakMap]';
var dataViewTag$2 = '[object DataView]';
var dataViewCtorString = toSource(DataView);
var mapCtorString = toSource(Map);
var promiseCtorString = toSource(Promise$1);
var setCtorString = toSource(Set);
var weakMapCtorString = toSource(WeakMap);
var getTag = baseGetTag;
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$2 || Map && getTag(new Map()) != mapTag$2 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set && getTag(new Set()) != setTag$2 || WeakMap && getTag(new WeakMap()) != weakMapTag$1) {
    getTag = function getTag(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag$2 ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : '';
        if (ctorString) {
            switch (ctorString) {
                case dataViewCtorString:
                    return dataViewTag$2;
                case mapCtorString:
                    return mapTag$2;
                case promiseCtorString:
                    return promiseTag;
                case setCtorString:
                    return setTag$2;
                case weakMapCtorString:
                    return weakMapTag$1;
            }
        }
        return result;
    };
}
var getTag$1 = getTag;

var COMPARE_PARTIAL_FLAG$1 = 1;
var argsTag$2 = '[object Arguments]';
var arrayTag$1 = '[object Array]';
var objectTag$1 = '[object Object]';
var objectProto$9 = Object.prototype;
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag$1 : getTag$1(object),
      othTag = othIsArr ? arrayTag$1 : getTag$1(other);
  objTag = objTag == argsTag$2 ? objectTag$1 : objTag;
  othTag = othTag == argsTag$2 ? objectTag$1 : othTag;
  var objIsObj = objTag == objectTag$1,
      othIsObj = othTag == objectTag$1,
      isSameTag = objTag == othTag;
  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$1)) {
    var objIsWrapped = objIsObj && hasOwnProperty$7.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$7.call(other, '__wrapped__');
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

var COMPARE_PARTIAL_FLAG = 1;
var COMPARE_UNORDERED_FLAG = 2;
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack();
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}

function isStrictComparable(value) {
  return value === value && !isObject(value);
}

function getMatchData(object) {
  var result = keys(object),
      length = result.length;
  while (length--) {
    var key = result[length],
        value = object[key];
    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

function matchesStrictComparable(key, srcValue) {
  return function (object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
  };
}

function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function (object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}

var FUNC_ERROR_TEXT$1 = 'Expected a function';
function memoize(func, resolver) {
  if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  var memoized = function memoized() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache)();
  return memoized;
}
memoize.Cache = MapCache;

var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
  var result = memoize(func, function (key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}

var reLeadingDot = /^\./;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = memoizeCapped(function (string) {
  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function (match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : number || match);
  });
  return result;
});

function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

var INFINITY = 1 / 0;
var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined;
var symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

function toString(value) {
  return value == null ? '' : baseToString(value);
}

function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

var INFINITY$1 = 1 / 0;
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = value + '';
  return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
}

function baseGet(object, path$$1) {
  path$$1 = castPath(path$$1, object);
  var index = 0,
      length = path$$1.length;
  while (object != null && index < length) {
    object = object[toKey(path$$1[index++])];
  }
  return index && index == length ? object : undefined;
}

function get$2(object, path$$1, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path$$1);
  return result === undefined ? defaultValue : result;
}

function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

function hasPath(object, path$$1, hasFunc) {
  path$$1 = castPath(path$$1, object);
  var index = -1,
      length = path$$1.length,
      result = false;
  while (++index < length) {
    var key = toKey(path$$1[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
}

function hasIn(object, path$$1) {
  return object != null && hasPath(object, path$$1, baseHasIn);
}

var COMPARE_PARTIAL_FLAG$5 = 1;
var COMPARE_UNORDERED_FLAG$3 = 2;
function baseMatchesProperty(path$$1, srcValue) {
  if (isKey(path$$1) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path$$1), srcValue);
  }
  return function (object) {
    var objValue = get$2(object, path$$1);
    return objValue === undefined && objValue === srcValue ? hasIn(object, path$$1) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
  };
}

function identity(value) {
  return value;
}

function baseProperty(key) {
  return function (object) {
    return object == null ? undefined : object[key];
  };
}

function basePropertyDeep(path$$1) {
  return function (object) {
    return baseGet(object, path$$1);
  };
}

function property(path$$1) {
  return isKey(path$$1) ? baseProperty(toKey(path$$1)) : basePropertyDeep(path$$1);
}

function baseIteratee(value) {
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
    return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }
  return property(value);
}

function filter$1(collection, predicate) {
  var func = isArray(collection) ? arrayFilter : baseFilter;
  return func(collection, baseIteratee(predicate, 3));
}

function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];
  baseEach(collection, function (value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

function map$1(collection, iteratee) {
  var func = isArray(collection) ? arrayMap : baseMap;
  return func(collection, baseIteratee(iteratee, 3));
}

function flatMap$1(collection, iteratee) {
  return baseFlatten(map$1(collection, iteratee), 1);
}

var arrayProto$1 = Array.prototype;
var nativeJoin = arrayProto$1.join;
function join$1(array, separator) {
  return array == null ? '' : nativeJoin.call(array, separator);
}

function baseSortBy(array, comparer) {
  var length = array.length;
  array.sort(comparer);
  while (length--) {
    array[length] = array[length].value;
  }
  return array;
}

function compareAscending(value, other) {
  if (value !== other) {
    var valIsDefined = value !== undefined,
        valIsNull = value === null,
        valIsReflexive = value === value,
        valIsSymbol = isSymbol(value);
    var othIsDefined = other !== undefined,
        othIsNull = other === null,
        othIsReflexive = other === other,
        othIsSymbol = isSymbol(other);
    if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
      return 1;
    }
    if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
      return -1;
    }
  }
  return 0;
}

function compareMultiple(object, other, orders) {
  var index = -1,
      objCriteria = object.criteria,
      othCriteria = other.criteria,
      length = objCriteria.length,
      ordersLength = orders.length;
  while (++index < length) {
    var result = compareAscending(objCriteria[index], othCriteria[index]);
    if (result) {
      if (index >= ordersLength) {
        return result;
      }
      var order = orders[index];
      return result * (order == 'desc' ? -1 : 1);
    }
  }
  return object.index - other.index;
}

function baseOrderBy(collection, iteratees, orders) {
  var index = -1;
  iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));
  var result = baseMap(collection, function (value, key, collection) {
    var criteria = arrayMap(iteratees, function (iteratee) {
      return iteratee(value);
    });
    return { 'criteria': criteria, 'index': ++index, 'value': value };
  });
  return baseSortBy(result, function (object, other) {
    return compareMultiple(object, other, orders);
  });
}

function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

var nativeMax$1 = Math.max;
function overRest(func, start, transform) {
  start = nativeMax$1(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = nativeMax$1(args.length - start, 0),
        array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

function constant(value) {
  return function () {
    return value;
  };
}

var defineProperty$1 = function () {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}();

var baseSetToString = !defineProperty$1 ? identity : function (func, string) {
  return defineProperty$1(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

var HOT_COUNT = 800;
var HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
  var count = 0,
      lastCalled = 0;
  return function () {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

var setToString = shortOut(baseSetToString);

function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index === 'undefined' ? 'undefined' : _typeof(index);
  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    return eq(object[index], value);
  }
  return false;
}

var sortBy$1 = baseRest(function (collection, iteratees) {
  if (collection == null) {
    return [];
  }
  var length = iteratees.length;
  if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
    iteratees = [];
  } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
    iteratees = [iteratees[0]];
  }
  return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
});

function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;
  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : end - start >>> 0;
  start >>>= 0;
  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return !start && end >= length ? array : baseSlice(array, start, end);
}

var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f';
var reComboHalfMarksRange = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange = '\\u20d0-\\u20ff';
var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
var rsVarRange = '\\ufe0e\\ufe0f';
var rsZWJ = '\\u200d';
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

var regexpTag$2 = '[object RegExp]';
function baseIsRegExp(value) {
  return isObjectLike(value) && baseGetTag(value) == regexpTag$2;
}

var nodeIsRegExp = nodeUtil && nodeUtil.isRegExp;
var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;

function asciiToArray(string) {
  return string.split('');
}

var rsAstralRange$1 = '\\ud800-\\udfff';
var rsComboMarksRange$1 = '\\u0300-\\u036f';
var reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange$1 = '\\u20d0-\\u20ff';
var rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
var rsVarRange$1 = '\\ufe0e\\ufe0f';
var rsAstral = '[' + rsAstralRange$1 + ']';
var rsCombo = '[' + rsComboRange$1 + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange$1 + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ$1 = '\\u200d';
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange$1 + ']?';
var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');
function unicodeToArray(string) {
    return string.match(reUnicode) || [];
}

function stringToArray(string) {
  return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
}

var MAX_ARRAY_LENGTH = 4294967295;
function split$1(string, separator, limit) {
  if (limit && typeof limit != 'number' && isIterateeCall(string, separator, limit)) {
    separator = limit = undefined;
  }
  limit = limit === undefined ? MAX_ARRAY_LENGTH : limit >>> 0;
  if (!limit) {
    return [];
  }
  string = toString(string);
  if (string && (typeof separator == 'string' || separator != null && !isRegExp(separator))) {
    separator = baseToString(separator);
    if (!separator && hasUnicode(string)) {
      return castSlice(stringToArray(string), 0, limit);
    }
  }
  return string.split(separator, limit);
}

function baseClamp(number, lower, upper) {
  if (number === number) {
    if (upper !== undefined) {
      number = number <= upper ? number : upper;
    }
    if (lower !== undefined) {
      number = number >= lower ? number : lower;
    }
  }
  return number;
}

var INFINITY$2 = 1 / 0;
var MAX_INTEGER = 1.7976931348623157e+308;
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY$2 || value === -INFINITY$2) {
    var sign = value < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}

function startsWith$1(string, target, position) {
  string = toString(string);
  position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
  target = baseToString(target);
  return string.slice(position, position + target.length) == target;
}

function arrayEvery(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;
  while (++index < length) {
    if (!predicate(array[index], index, array)) {
      return false;
    }
  }
  return true;
}

function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}

function flatRest(func) {
  return setToString(overRest(func, undefined, flatten), func + '');
}

function createOver(arrayFunc) {
  return flatRest(function (iteratees) {
    iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
    return baseRest(function (args) {
      var thisArg = this;
      return arrayFunc(iteratees, function (iteratee) {
        return apply(iteratee, thisArg, args);
      });
    });
  });
}

var overEvery = createOver(arrayEvery);

function compact(array) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];
  while (++index < length) {
    var value = array[index];
    if (value) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var objectCreate = Object.create;
var baseCreate = function () {
  function object() {}
  return function (proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object();
    object.prototype = undefined;
    return result;
  };
}();

function baseLodash() {
}

function LodashWrapper(value, chainAll) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__chain__ = !!chainAll;
  this.__index__ = 0;
  this.__values__ = undefined;
}
LodashWrapper.prototype = baseCreate(baseLodash.prototype);
LodashWrapper.prototype.constructor = LodashWrapper;

var metaMap = WeakMap && new WeakMap();

function noop() {
}

var getData = !metaMap ? noop : function (func) {
  return metaMap.get(func);
};

var realNames = {};

var objectProto$12 = Object.prototype;
var hasOwnProperty$9 = objectProto$12.hasOwnProperty;
function getFuncName(func) {
  var result = func.name + '',
      array = realNames[result],
      length = hasOwnProperty$9.call(realNames, result) ? array.length : 0;
  while (length--) {
    var data = array[length],
        otherFunc = data.func;
    if (otherFunc == null || otherFunc == func) {
      return data.name;
    }
  }
  return result;
}

var MAX_ARRAY_LENGTH$1 = 4294967295;
function LazyWrapper(value) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__dir__ = 1;
  this.__filtered__ = false;
  this.__iteratees__ = [];
  this.__takeCount__ = MAX_ARRAY_LENGTH$1;
  this.__views__ = [];
}
LazyWrapper.prototype = baseCreate(baseLodash.prototype);
LazyWrapper.prototype.constructor = LazyWrapper;

function wrapperClone(wrapper) {
  if (wrapper instanceof LazyWrapper) {
    return wrapper.clone();
  }
  var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
  result.__actions__ = copyArray(wrapper.__actions__);
  result.__index__ = wrapper.__index__;
  result.__values__ = wrapper.__values__;
  return result;
}

var objectProto$13 = Object.prototype;
var hasOwnProperty$10 = objectProto$13.hasOwnProperty;
function lodash(value) {
  if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
    if (value instanceof LodashWrapper) {
      return value;
    }
    if (hasOwnProperty$10.call(value, '__wrapped__')) {
      return wrapperClone(value);
    }
  }
  return new LodashWrapper(value);
}
lodash.prototype = baseLodash.prototype;
lodash.prototype.constructor = lodash;

function isLaziable(func) {
  var funcName = getFuncName(func),
      other = lodash[funcName];
  if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
    return false;
  }
  if (func === other) {
    return true;
  }
  var data = getData(other);
  return !!data && func === data[0];
}

var FUNC_ERROR_TEXT$2 = 'Expected a function';
var WRAP_CURRY_FLAG = 8;
var WRAP_PARTIAL_FLAG = 32;
var WRAP_ARY_FLAG = 128;
var WRAP_REARG_FLAG = 256;
function createFlow(fromRight) {
  return flatRest(function (funcs) {
    var length = funcs.length,
        index = length,
        prereq = LodashWrapper.prototype.thru;
    if (fromRight) {
      funcs.reverse();
    }
    while (index--) {
      var func = funcs[index];
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT$2);
      }
      if (prereq && !wrapper && getFuncName(func) == 'wrapper') {
        var wrapper = new LodashWrapper([], true);
      }
    }
    index = wrapper ? index : length;
    while (++index < length) {
      func = funcs[index];
      var funcName = getFuncName(func),
          data = funcName == 'wrapper' ? getData(func) : undefined;
      if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && data[9] == 1) {
        wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
      } else {
        wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
      }
    }
    return function () {
      var args = arguments,
          value = args[0];
      if (wrapper && args.length == 1 && isArray(value)) {
        return wrapper.plant(value).value();
      }
      var index = 0,
          result = length ? funcs[index].apply(this, args) : value;
      while (++index < length) {
        result = funcs[index].call(this, result);
      }
      return result;
    };
  });
}

var flow = createFlow();

function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

function baseIsNaN(value) {
  return value !== value;
}

function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;
  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

function baseIndexOf(array, value, fromIndex) {
  return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
}

function charsEndIndex(strSymbols, chrSymbols) {
  var index = strSymbols.length;
  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

function charsStartIndex(strSymbols, chrSymbols) {
  var index = -1,
      length = strSymbols.length;
  while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

var reTrim$1 = /^\s+|\s+$/g;
function trim(string, chars, guard) {
  string = toString(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrim$1, '');
  }
  if (!string || !(chars = baseToString(chars))) {
    return string;
  }
  var strSymbols = stringToArray(string),
      chrSymbols = stringToArray(chars),
      start = charsStartIndex(strSymbols, chrSymbols),
      end = charsEndIndex(strSymbols, chrSymbols) + 1;
  return castSlice(strSymbols, start, end).join('');
}

var concat = function concat(a) {
  return function (b) {
    return concat$1(a, b);
  };
};
var debounce = function debounce(a, b) {
  return debounce$1(b, a);
};
var filter = function filter(a) {
  return function (b) {
    return filter$1(b, a);
  };
};
var flatMap = function flatMap(a) {
  return function (b) {
    return flatMap$1(b, a);
  };
};
var get = function get(a) {
  return function (b) {
    return get$2(b, a);
  };
};
var join = function join(a) {
  return function (b) {
    return join$1(b, a);
  };
};
var map = function map(a) {
  return function (b) {
    return map$1(b, a);
  };
};
var sortBy = function sortBy(a) {
  return function (b) {
    return sortBy$1(b, a);
  };
};
var split = function split(a) {
  return function (b) {
    return split$1(b, a);
  };
};
var startsWith = function startsWith(a) {
  return function (b) {
    return startsWith$1(b, a);
  };
};

var portRegex = /XML Tools Server listening on port (\d+)/;
var jarPath = '../vendor/xml-tools-server-0.4.8.jar';
var initialPort = 0;
function ServerProcess() {
  this.state = this.STOPPED;
  this.isReadyPromise = null;
  this.javaProcess = null;
  this.port = null;
}
ServerProcess.prototype = {
  STOPPED: 'STOPPED',
  INITIALIZING: 'INITIALIZING',
  READY: 'READY',
  getState: function getState() {
    return this.state;
  },
  isReady: function isReady() {
    return this.state === this.READY;
  },
  ensureIsReady: function ensureIsReady(config) {
    if (!this.isReadyPromise) {
      this.isReadyPromise = this.createIsReadyPromise(config);
    }
    return this.isReadyPromise;
  },
  createIsReadyPromise: function createIsReadyPromise(config) {
    var _this = this;
    this.state = this.INITIALIZING;
    return new Promise(function (resolve, reject) {
      var args = [].concat(toConsumableArray(config.jvmArguments.split(/\s+/)), ['-jar', path.resolve(__dirname, jarPath), initialPort, config.schemaCacheSize]);
      _this.javaProcess = spawn(config.javaExecutablePath, args, {});
      _this.setStartupListeners(config, resolve, reject);
    });
  },
  setStartupListeners: function setStartupListeners(config, resolve, reject) {
    var _this2 = this;
    var onData = function onData(data) {
      var match = data.toString().match(portRegex);
      if (match) {
        _this2.port = Number(match[1]);
        _this2.removeListeners();
        _this2.setExecutionListeners();
        _this2.state = _this2.READY;
        resolve(_this2);
      } else {
        reject(new ServerProcess.Error('Unexpected server start message "' + data + '"'));
        _this2.exit();
      }
    };
    this.javaProcess.stdout.on('data', onData);
    this.javaProcess.stderr.on('data', onData);
    this.javaProcess.on('error', function (err) {
      reject(new ServerProcess.Error('Failed to execute "' + config.javaExecutablePath + '".\n' + 'Please adjust the Java executable path in the "linter-autocomplete-jing" ' + 'package settings', err));
      _this2.exit();
    });
  },
  onStdOut: function onStdOut() {},
  onStdErr: function onStdErr(data) {
    console.error('Server message on stderr: ' + data);
  },
  onError: function onError(err) {
    console.error('Server error:', err);
  },
  setExecutionListeners: function setExecutionListeners() {
    var _this3 = this;
    this.javaProcess.stdout.on('data', function (data) {
      return _this3.onStdOut(data);
    });
    this.javaProcess.stderr.on('data', function (data) {
      return _this3.onStdErr(data);
    });
    this.javaProcess.on('error', function (err) {
      _this3.onError(err);
      _this3.exit();
    });
  },
  removeListeners: function removeListeners() {
    this.javaProcess.stdout.removeAllListeners('data');
    this.javaProcess.stderr.removeAllListeners('data');
    this.javaProcess.removeAllListeners('error');
  },
  exit: function exit() {
    this.state = this.STOPPED;
    if (this.javaProcess) {
      this.removeListeners();
      this.javaProcess.kill();
      this.javaProcess = null;
    }
    this.isReadyPromise = null;
    this.port = null;
  },
  sendRequest: function sendRequest(headers, body) {
    var port = this.port;
    return new Promise(function (resolve, reject) {
      var response = '';
      var socket = new net.Socket();
      socket.on('connect', function () {
        socket.write(headers.map(function (header) {
          return '-' + header + '\n';
        }).join(''));
        if (body !== null) {
          socket.write('\n');
          socket.write(body);
        }
        socket.end();
      });
      socket.on('data', function (data) {
        response += data.toString();
      });
      socket.on('close', function () {
        resolve(response);
      });
      socket.on('error', function (err) {
        socket.destroy();
        reject(err);
      });
      socket.connect({ port: port });
    });
  }
};
var instance = null;
ServerProcess.getInstance = function () {
  if (instance === null) {
    instance = new ServerProcess();
  }
  return instance;
};
ServerProcess.Error = function (message, err) {
  this.name = 'ServerProcess.Error';
  this.message = message;
  this.stack = err ? err.stack : new Error().stack;
};
ServerProcess.Error.prototype = Object.create(Error.prototype);

var nameStartChar = [':', 'A-Z', '_', 'a-z', '\\xC0-\\xD6', '\\xD8-\\xF6', '\\u00F8-\\u02FF', '\\u0370-\\u037D', '\\u037F-\\u1FFF', '\\u200C-\\u200D', '\\u2070-\\u218F', '\\u2C00-\\u2FEF', '\\u3001-\\uD7FF', '\\uF900-\\uFDCF', '\\uFDF0-\\uFFFD'].join('');
var nameChar = [nameStartChar, '\\-', '\\.', '0-9', '\\u00B7', '\\u0300-\\u036F', '\\u203F-\\u2040'].join('');
var spaceChar = ['\\u0020', '\\u0009', '\\u000D', '\\u000A'].join('');
var regex = {
  tagNamePI: new RegExp('<(!|/|/?[' + nameStartChar + '][' + nameChar + ']*)?$'),
  attStartFromAttName: new RegExp('(?:^|[' + spaceChar + '])([' + nameStartChar + '][' + nameChar + ']*)?$'),
  attStartFromAttValueDouble: new RegExp('([' + nameStartChar + '][' + nameChar + ']*)="([^"]*)?'),
  attStartFromAttValueSingle: new RegExp('([' + nameStartChar + '][' + nameChar + ']*)=\'([^\']*)?'),
  attEndFromAttName: new RegExp('^[' + nameChar + ']*=(".*?"|\'.*?\')'),
  endToken: new RegExp('(?:^|["' + spaceChar + '])([^' + spaceChar + ']+)$'),
  spaces: new RegExp('[' + spaceChar + ']+'),
  url: /^(?:[a-z][a-z0-9+\-.]*:)?\/\//i,
  previousTagBracket: /"[^<]*?"|'[^<]*?'|<\/|<|>/g,
  nextTagBracket: /"[^<]*?"|'[^<]*?'|<|\/>|>/g,
  publicId: /\s*[^\s]+\s*PUBLIC\s*("([^"]+)"|'([^']+)')/
};

var helpers = require('atom-linter');
var getPseudoAtts = function getPseudoAtts(body) {
  var pseudoAtts = {};
  body.replace(/(\w+)="(.+?)"/g, function (unused, key, value) {
    return pseudoAtts[key] = value;
  });
  return pseudoAtts;
};
var getXsiNamespacePrefixes = function getXsiNamespacePrefixes(attributes) {
  var prefixes = [];
  Object.keys(attributes).forEach(function (key) {
    var match = key.match(/xmlns:(.*)/);
    if (match && attributes[key] === 'http://www.w3.org/2001/XMLSchema-instance') {
      prefixes.push(match[1]);
    }
  });
  return prefixes;
};
var hasEvenIndex = function hasEvenIndex(unused, index) {
  return index % 2;
};
var splitQName = function splitQName(qName) {
  var colonIndex = qName.indexOf(':');
  return [qName.substr(0, colonIndex), qName.substr(colonIndex + 1)];
};
var getSchemaProps = function getSchemaProps(textEditor, parsedRules, config) {
  return new Promise(function (resolve) {
    var filePath = textEditor.getPath();
    var dirname = filePath ? path.dirname(filePath) : __dirname;
    var messages = [];
    var schemaProps = [];
    var xsdSchemaPaths = [];
    var saxParser = sax.parser(true);
    var row = 0;
    var done = false;
    var hasDoctype = false;
    var rootNs = null;
    var rootLocalName = null;
    var rootAttributes = {};
    var publicId = null;
    var addXsdSchemaPath = function addXsdSchemaPath(href) {
      return href && xsdSchemaPaths.push(regex.url.test(href) ? href : path.resolve(dirname, href));
    };
    var onProcessingInstruction = function onProcessingInstruction(node) {
      if (node.name !== 'xml-model') return;
      var _getPseudoAtts = getPseudoAtts(node.body),
          href = _getPseudoAtts.href,
          type = _getPseudoAtts.type,
          schematypens = _getPseudoAtts.schematypens;
      var lang = void 0;
      if (href) {
        if (type === 'application/relax-ng-compact-syntax') {
          lang = 'rnc';
        } else if (schematypens === 'http://relaxng.org/ns/structure/1.0') {
          lang = path.extname(href) === '.rnc' ? 'rnc' : 'rng';
        } else if (schematypens === 'http://purl.oclc.org/dsdl/schematron') {
          lang = 'sch.iso';
        } else if (schematypens === 'http://www.ascc.net/xml/schematron') {
          lang = 'sch.15';
        } else if (schematypens === 'http://www.w3.org/2001/XMLSchema') {
          addXsdSchemaPath(href);
        } else {
          messages.push({
            type: 'Warning',
            html: 'Unknown schema type',
            filePath: filePath,
            range: helpers.generateRange(textEditor, row)
          });
        }
      }
      if (lang) {
        schemaProps.push({
          lang: lang,
          line: row,
          path: regex.url.test(href) ? href : path.resolve(dirname, href)
        });
      }
    };
    var onOpenTag = function onOpenTag(node) {
      if (done) return;
      var _splitQName = splitQName(node.name),
          _splitQName2 = slicedToArray(_splitQName, 2),
          rootNsPrefix = _splitQName2[0],
          localName = _splitQName2[1];
      rootNs = rootNsPrefix ? node.attributes['xmlns:' + rootNsPrefix] : node.attributes.xmlns;
      rootLocalName = localName;
      rootAttributes = node.attributes;
      getXsiNamespacePrefixes(node.attributes).forEach(function (prefix) {
        var noNamespaceSchemaLocation = node.attributes[prefix + ':noNamespaceSchemaLocation'];
        if (noNamespaceSchemaLocation) {
          addXsdSchemaPath(noNamespaceSchemaLocation.trim());
        }
        var schemaLocation = node.attributes[prefix + ':schemaLocation'];
        if (schemaLocation) {
          schemaLocation.trim().split(regex.spaces).filter(hasEvenIndex).forEach(addXsdSchemaPath);
        }
      });
      done = true;
    };
    saxParser.onerror = function () {
      return done = true;
    };
    saxParser.ondoctype = function (str) {
      hasDoctype = true;
      var match = str.match(regex.publicId);
      if (match) {
        publicId = match[2] || match[3];
      }
    };
    saxParser.onprocessinginstruction = onProcessingInstruction;
    saxParser.onopentag = onOpenTag;
    var textBuffer = textEditor.getBuffer();
    var lineCount = textBuffer.getLineCount();
    var chunkSize = 64;
    while (!done && row < lineCount) {
      var line = textBuffer.lineForRow(row);
      var lineLength = line.length;
      var column = 0;
      while (!done && column < lineLength) {
        saxParser.write(line.substr(column, chunkSize));
        column += chunkSize;
      }
      row++;
    }
    if (xsdSchemaPaths.length) {
      schemaProps.push({
        lang: 'xsd',
        path: xsdSchemaPaths.join('*')
      });
    }
    var docProps = {
      rootScopes: textEditor.getRootScopeDescriptor().scopes,
      filePath: filePath,
      rootNs: rootNs,
      rootLocalName: rootLocalName,
      rootAttributes: rootAttributes,
      publicId: publicId
    };
    var rule = parsedRules.find(function (r) {
      return r.test(docProps);
    });
    var xmlCatalog = rule && 'xmlCatalog' in rule.outcome ? rule.outcome.xmlCatalog : config.xmlCatalog;
    var dtdValidation = rule && 'dtdValidation' in rule.outcome ? rule.outcome.dtdValidation : config.dtdValidation;
    var xIncludeAware = rule && 'xIncludeAware' in rule.outcome ? rule.outcome.xIncludeAware : config.xIncludeAware;
    var xIncludeFixupBaseUris = rule && 'xIncludeFixupBaseUris' in rule.outcome ? rule.outcome.xIncludeFixupBaseUris : config.xIncludeFixupBaseUris;
    var xIncludeFixupLanguage = rule && 'xIncludeFixupLanguage' in rule.outcome ? rule.outcome.xIncludeFixupLanguage : config.xIncludeFixupLanguage;
    if (rule && 'schemaProps' in rule.outcome && !schemaProps.length) {
      schemaProps.push.apply(schemaProps, toConsumableArray(rule.outcome.schemaProps));
    }
    if (hasDoctype && (dtdValidation === 'always' || dtdValidation === 'fallback' && !schemaProps.length)) {
      schemaProps.push({
        lang: 'dtd',
        line: saxParser.line,
        path: null
      });
    }
    if (!schemaProps.length) {
      schemaProps.push({
        lang: 'none',
        path: null
      });
    }
    resolve({
      schemaProps: schemaProps,
      messages: messages,
      xmlCatalog: xmlCatalog,
      xIncludeAware: xIncludeAware,
      xIncludeFixupBaseUris: xIncludeFixupBaseUris,
      xIncludeFixupLanguage: xIncludeFixupLanguage
    });
  });
};

var helpers$1 = require('atom-linter');
var messageRegex = /^([a-z0-9.]+?):((.*?):\s?)?((\d+):)?(?:\d+:\s)?(error|fatal|warning):\s(.*)$/;
var parseMessage = function parseMessage(textEditor, schemaProps, config) {
  return function (str) {
    var match = messageRegex.exec(str);
    if (!match) {
      console.error('Could not parse message "' + str + '"');
      return null;
    }
    var _match = slicedToArray(match, 8),
        lang = _match[1],
        systemId = _match[3],
        line = _match[5],
        level = _match[6],
        text = _match[7];
    var filePath = textEditor.getPath();
    var html = document.createElement('div').appendChild(document.createTextNode(text)).parentNode.innerHTML;
    if (systemId === filePath) {
      return {
        type: level === 'warning' ? 'Warning' : 'Error',
        html: lang === 'none' ? html : '<span class="badge badge-flexible">' + lang.toUpperCase() + '</span> ' + html,
        filePath: filePath,
        range: helpers$1.generateRange(textEditor, Number(line) - 1)
      };
    }
    if (!config.displaySchemaWarnings && level === 'warning') {
      return null;
    }
    var label = level === 'warning' ? 'Schema parser warning: ' : 'Could not process schema or catalog: ';
    var schema = schemaProps.find(function (sch) {
      return sch.path === systemId && sch.lang === lang;
    });
    var range = schema ? helpers$1.generateRange(textEditor, schema.line) : [[0, 0], [0, 0]];
    return {
      type: 'Warning',
      html: label + html,
      filePath: filePath,
      range: range
    };
  };
};

var serverProcessInstance$1 = ServerProcess.getInstance();
var buildHeaders = function buildHeaders(textEditor, localConfig) {
  var schemaProps = localConfig.schemaProps,
      xmlCatalog = localConfig.xmlCatalog,
      xIncludeAware = localConfig.xIncludeAware,
      xIncludeFixupBaseUris = localConfig.xIncludeFixupBaseUris,
      xIncludeFixupLanguage = localConfig.xIncludeFixupLanguage;
  var xIncludeOption = xIncludeAware ? 'x' : '';
  var xIncludeFixupOption = xIncludeFixupBaseUris ? 'f' : '';
  var xIncludeLanguageOption = xIncludeFixupLanguage ? 'l' : '';
  return ['V', 'r' + xIncludeOption + xIncludeFixupOption + xIncludeLanguageOption, 'UTF-8', textEditor.getPath(), xmlCatalog || ''].concat(toConsumableArray(schemaProps.map(function (schema) {
    return schema.lang + ' ' + (schema.path || '');
  })));
};
var requestValidation = function requestValidation(textEditor, config, localConfig) {
  var schemaProps = localConfig.schemaProps,
      messages = localConfig.messages;
  var headers = buildHeaders(textEditor, localConfig);
  var body = textEditor.getText();
  return serverProcessInstance$1.sendRequest(headers, body).then(flow(trim, split(/\r?\n/), filter(identity), map(parseMessage(textEditor, schemaProps, config)), compact, concat(messages), sortBy('range[0][0]')));
};

var validate = function validate(textEditor, config) {
  return function (_ref) {
    var _ref2 = slicedToArray(_ref, 2),
        localConfig = _ref2[1];
    return requestValidation(textEditor, config, localConfig);
  };
};

var serverProcessInstance$2 = ServerProcess.getInstance();
var wildcardOptions = {
  none: '',
  localparts: 'w',
  all: 'wn'
};
var buildHeaders$1 = function buildHeaders$1(sharedConfig, suggestionOptions) {
  var editor = sharedConfig.options.editor,
      xmlCatalog = sharedConfig.xmlCatalog,
      xIncludeAware = sharedConfig.xIncludeAware,
      xIncludeFixupBaseUris = sharedConfig.xIncludeFixupBaseUris,
      xIncludeFixupLanguage = sharedConfig.xIncludeFixupLanguage,
      _sharedConfig$current = sharedConfig.currentSchemaProps,
      lang = _sharedConfig$current.lang,
      schemaPath = _sharedConfig$current.path,
      wildcardSuggestions = sharedConfig.wildcardSuggestions;
  var type = suggestionOptions.type,
      fragment = suggestionOptions.fragment,
      splitPoint = suggestionOptions.splitPoint;
  var processingOptions = ['r', wildcardOptions[wildcardSuggestions], xIncludeAware ? 'x' : '', xIncludeFixupBaseUris ? 'f' : '', xIncludeFixupLanguage ? 'l' : ''].join('');
  return ['A', type, fragment || '', splitPoint || '', processingOptions, 'UTF-8', editor.getPath(), xmlCatalog || '', lang + ' ' + (schemaPath || '')];
};
var requestSuggestions = function requestSuggestions(sharedConfig, suggestionOptions) {
  var body = suggestionOptions.body,
      clientData = suggestionOptions.clientData,
      filterFn = suggestionOptions.filterFn,
      builderFn = suggestionOptions.builderFn;
  var headers = buildHeaders$1(sharedConfig, suggestionOptions);
  return serverProcessInstance$2.sendRequest(headers, body).then(flow(JSON.parse, function (data) {
    return clientData ? data.concat(clientData) : data;
  }, filter(filterFn), map(builderFn), compact)).catch(function () {
    return [];
  });
};

var getEndBracketPosition = function getEndBracketPosition(_ref) {
  var editor = _ref.editor,
      bufferPosition = _ref.bufferPosition;
  var position = null;
  editor.scanInBufferRange(regex.nextTagBracket, [bufferPosition, editor.getBuffer().getEndPosition()], function (_ref2) {
    var matchText = _ref2.matchText,
        range = _ref2.range,
        stop = _ref2.stop;
    if (!matchText.startsWith('\'') && !matchText.startsWith('"')) {
      if (matchText !== '<') {
        position = [range.start.row, range.start.column + matchText.length];
      }
      stop();
    }
  });
  return position;
};
var buildDescriptionString = join(' \u2013 ');
var buildAttributeStrings = function buildAttributeStrings(attribute, index, addSuffix) {
  var _attribute$split = attribute.split('#'),
      _attribute$split2 = slicedToArray(_attribute$split, 2),
      qName = _attribute$split2[0],
      nsUri = _attribute$split2[1];
  if (typeof nsUri === 'string') {
    var nsPrefix = 'ns${' + ++index + '}';
    var _attNameSnippet = qName.replace(/\*/g, function () {
      return '${' + ++index + '}';
    });
    var nsUriSnippet = nsUri === '*' ? '${' + ++index + '}' : nsUri;
    var _suffix = addSuffix ? '="${' + ++index + '}"' : '';
    var displayText = nsUri === '' ? qName + ' [no namespace]' : qName + ' (' + nsUri + ')';
    return {
      snippet: nsPrefix + ':' + _attNameSnippet + _suffix + ' xmlns:' + nsPrefix + '="' + nsUriSnippet + '"',
      displayText: displayText,
      index: index
    };
  }
  var attNameSnippet = qName.replace(/\*/g, function () {
    return '${' + ++index + '}';
  });
  var suffix = addSuffix ? '="${' + ++index + '}"' : '';
  return {
    snippet: '' + attNameSnippet + suffix,
    displayText: qName,
    index: index
  };
};

var buildAttributeNameSuggestion = function buildAttributeNameSuggestion(replacementPrefix, addSuffix) {
  return function (_ref) {
    var value = _ref.value,
        documentation = _ref.documentation;
    var _buildAttributeString = buildAttributeStrings(value, 0, addSuffix),
        snippet = _buildAttributeString.snippet,
        displayText = _buildAttributeString.displayText;
    return {
      snippet: snippet,
      displayText: displayText,
      type: 'attribute',
      replacementPrefix: replacementPrefix,
      description: documentation ? buildDescriptionString(documentation) : undefined,
      retrigger: addSuffix
    };
  };
};
var getAttributeNameProps = function getAttributeNameProps(precedingLineText) {
  var match = precedingLineText.match(regex.attStartFromAttName);
  return match ? { prefix: match[1] || '', column: match.index } : null;
};
var attributeNameFilter = function attributeNameFilter(prefix) {
  return function (_ref2) {
    var value = _ref2.value;
    return value.startsWith(prefix);
  };
};
var getAttributeNameSuggestions = function getAttributeNameSuggestions(sharedConfig, precedingLineText) {
  var options = sharedConfig.options;
  var editor = options.editor,
      bufferPosition = options.bufferPosition;
  var attributeNameProps = getAttributeNameProps(precedingLineText);
  if (!attributeNameProps) return [];
  var endBracketPosition = getEndBracketPosition(options);
  if (!endBracketPosition) return [];
  var prefix = attributeNameProps.prefix,
      prefixStartColumn = attributeNameProps.column;
  var textBeforeAttribute = editor.getTextInBufferRange([[0, 0], [bufferPosition.row, prefixStartColumn]]);
  var followingText = editor.getTextInBufferRange([bufferPosition, endBracketPosition]);
  var match = followingText.match(regex.attEndFromAttName);
  var textAfterAttribute = match ? followingText.substr(match[0].length) : followingText;
  var addSuffix = !match;
  return requestSuggestions(sharedConfig, {
    type: 'N',
    body: textBeforeAttribute + textAfterAttribute,
    filterFn: attributeNameFilter(prefix),
    builderFn: buildAttributeNameSuggestion(prefix, addSuffix)
  });
};

var getEndToken = function getEndToken(str) {
  var match = str.match(regex.endToken);
  return match ? match[1] : '';
};
var escape = function escape(quoteChar) {
  var quoteReplacements = {
    '"': '&quot;',
    '\'': '&apos;'
  };
  var replacements = defineProperty({
    '&': '&amp;',
    '<': '&lt;'
  }, quoteChar, quoteReplacements[quoteChar]);
  var reg = new RegExp(Object.keys(replacements).join('|'), 'g');
  return function (str) {
    return str.replace(reg, function (match) {
      return replacements[match];
    });
  };
};
var escapeWithDblQuotes = escape('"');
var escapeWithSingleQuotes = escape('\'');
var buildAttributeValueSuggestion = function buildAttributeValueSuggestion(prefix, endToken, hasDblQuotes) {
  return function (_ref) {
    var listItem = _ref.listItem,
        value = _ref.value,
        documentation = _ref.documentation;
    return {
      snippet: hasDblQuotes ? escapeWithDblQuotes(value) : escapeWithSingleQuotes(value),
      displayText: value,
      type: 'value',
      rightLabel: listItem ? 'List Item' : undefined,
      replacementPrefix: listItem ? endToken : prefix,
      description: documentation ? buildDescriptionString(documentation) : undefined
    };
  };
};
var getAttributeValueProps = function getAttributeValueProps(_ref2, hasDblQuotes) {
  var editor = _ref2.editor,
      bufferPosition = _ref2.bufferPosition;
  var attStartRegex = hasDblQuotes ? regex.attStartFromAttValueDouble : regex.attStartFromAttValueSingle;
  var result = void 0;
  editor.backwardsScanInBufferRange(attStartRegex, [bufferPosition, [0, 0]], function (_ref3) {
    var match = _ref3.match,
        stop = _ref3.stop;
    result = match;
    stop();
  });
  return result ? { name: result[1], prefix: result[2] || '' } : null;
};
var attributeValueFilter = function attributeValueFilter(prefix, endToken) {
  return function (_ref4) {
    var value = _ref4.value,
        listItem = _ref4.listItem;
    return value.startsWith(listItem ? endToken : prefix);
  };
};
var getAttributeValueSuggestions = function getAttributeValueSuggestions(sharedConfig, precedingLineText, quotedScope) {
  var options = sharedConfig.options;
  var editor = options.editor;
  var hasDblQuotes = quotedScope === 'string.quoted.double.xml';
  var attributeValueProps = getAttributeValueProps(options, hasDblQuotes);
  if (!attributeValueProps) return [];
  var endBracketPosition = getEndBracketPosition(options);
  if (!endBracketPosition) return [];
  var fragment = attributeValueProps.name,
      prefix = attributeValueProps.prefix;
  var endToken = getEndToken(prefix);
  var head = editor.getTextInBufferRange([[0, 0], endBracketPosition]);
  var splitPoint = Buffer.byteLength(head);
  return requestSuggestions(sharedConfig, {
    type: 'V',
    body: editor.getText(),
    fragment: fragment,
    splitPoint: splitPoint,
    filterFn: attributeValueFilter(prefix, endToken),
    builderFn: buildAttributeValueSuggestion(prefix, endToken, hasDblQuotes)
  });
};

var buildElementSuggestion = function buildElementSuggestion(replacementPrefix, addSuffix) {
  return function (_ref) {
    var value = _ref.value,
        empty = _ref.empty,
        closing = _ref.closing,
        _ref$attributes = _ref.attributes,
        attributes = _ref$attributes === undefined ? [] : _ref$attributes,
        documentation = _ref.documentation,
        preDefinedSnippet = _ref.snippet;
    if (preDefinedSnippet) {
      return {
        snippet: preDefinedSnippet,
        displayText: value,
        type: 'tag',
        replacementPrefix: replacementPrefix,
        description: documentation,
        retrigger: false
      };
    }
    if (closing) {
      var _snippet = addSuffix ? '/' + value + '>' : '/' + value;
      return {
        snippet: _snippet,
        displayText: _snippet,
        type: 'tag',
        replacementPrefix: replacementPrefix,
        description: 'Closing Tag',
        retrigger: false
      };
    }
    var _value$split = value.split('#'),
        _value$split2 = slicedToArray(_value$split, 2),
        tagName = _value$split2[0],
        nsUri = _value$split2[1];
    var index = 0;
    var tagNameSnippet = tagName.replace(/\*/g, function () {
      return '${' + ++index + '}';
    });
    var hasEndTagSnippet = index > 0;
    var retrigger = void 0;
    var snippet = void 0;
    var displayText = void 0;
    if (addSuffix) {
      var nsSnippet = void 0;
      if (typeof nsUri === 'string') {
        var nsUriSnippet = nsUri === '*' ? '${' + ++index + '}' : nsUri;
        nsSnippet = ['xmlns="' + nsUriSnippet + '"'];
        displayText = nsUri === '' ? tagName + ' [no namespace]' : tagName + ' (' + nsUri + ')';
      } else {
        nsSnippet = [];
        displayText = tagName;
      }
      var attributeSnippets = attributes.map(function (attribute) {
        var _buildAttributeString = buildAttributeStrings(attribute, index, true),
            attributeSnippet = _buildAttributeString.snippet,
            newIndex = _buildAttributeString.index;
        index = newIndex;
        return attributeSnippet;
      });
      var startTagContent = [tagNameSnippet].concat(nsSnippet).concat(attributeSnippets).join(' ');
      snippet = empty ? startTagContent + '/>' : startTagContent + '>${' + ++index + '}</' + tagNameSnippet + '>';
      retrigger = !hasEndTagSnippet && index > 0;
    } else {
      displayText = tagName;
      snippet = tagNameSnippet;
      retrigger = false;
    }
    return {
      snippet: snippet,
      displayText: displayText,
      type: 'tag',
      replacementPrefix: replacementPrefix,
      description: documentation ? buildDescriptionString(documentation) : undefined,
      retrigger: retrigger
    };
  };
};
var piSuggestions = [{
  value: '!--  -->',
  snippet: '!-- ${1} -->',
  documentation: 'Comment'
}, {
  value: '![CDATA[]]>',
  snippet: '![CDATA[${1}]]>',
  documentation: 'CDATA Section'
}];
var elementSuggestionFilter = function elementSuggestionFilter(prefix) {
  return function (_ref2) {
    var value = _ref2.value,
        closing = _ref2.closing;
    return closing ? ('/' + value).startsWith(prefix) : value.startsWith(prefix);
  };
};
var getElementPISuggestions = function getElementPISuggestions(sharedConfig, tagNamePIPrefix) {
  var options = sharedConfig.options;
  var editor = options.editor,
      bufferPosition = options.bufferPosition;
  var body = editor.getTextInBufferRange([[0, 0], [bufferPosition.row, bufferPosition.column - tagNamePIPrefix.length - 1]]);
  var addSuffix = !getEndBracketPosition(options);
  return requestSuggestions(sharedConfig, {
    type: 'E',
    body: body,
    clientData: piSuggestions,
    filterFn: elementSuggestionFilter(tagNamePIPrefix),
    builderFn: buildElementSuggestion(tagNamePIPrefix, addSuffix)
  });
};

var getPreviousTagBracket = function getPreviousTagBracket(_ref) {
  var editor = _ref.editor,
      bufferPosition = _ref.bufferPosition;
  var bracket = null;
  editor.backwardsScanInBufferRange(regex.previousTagBracket, [bufferPosition, [0, 0]], function (_ref2) {
    var matchText = _ref2.matchText,
        stop = _ref2.stop;
    if (!matchText.startsWith('\'') && !matchText.startsWith('"')) {
      bracket = matchText;
      stop();
    }
  });
  return bracket;
};
var getTagNamePIPrefix = function getTagNamePIPrefix(precedingLineText) {
  var match = precedingLineText.match(regex.tagNamePI);
  return match ? match[1] || '' : null;
};
var getQuotedScope = function getQuotedScope(scopes) {
  return scopes.find(function (scope) {
    return scope === 'string.quoted.double.xml' || scope === 'string.quoted.single.xml';
  });
};
var includesTagScope = function includesTagScope(scopesArray) {
  return scopesArray.some(function (item) {
    return item.startsWith('meta.tag.xml') || item === 'meta.tag.no-content.xml';
  });
};
var getPrecedingLineText = function getPrecedingLineText(_ref3) {
  var editor = _ref3.editor,
      bufferPosition = _ref3.bufferPosition;
  return editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);
};
var suggest = function suggest(options, _ref4) {
  var autocompleteScope = _ref4.autocompleteScope,
      wildcardSuggestions = _ref4.wildcardSuggestions;
  return function (_ref5) {
    var _ref6 = slicedToArray(_ref5, 2),
        _ref6$ = _ref6[1],
        schemaProps = _ref6$.schemaProps,
        xmlCatalog = _ref6$.xmlCatalog,
        xIncludeAware = _ref6$.xIncludeAware,
        xIncludeFixupBaseUris = _ref6$.xIncludeFixupBaseUris,
        xIncludeFixupLanguage = _ref6$.xIncludeFixupLanguage;
    var currentSchemaProps = schemaProps.find(function (_ref7) {
      var lang = _ref7.lang;
      return !!autocompleteScope[lang];
    }) || { type: 'none' };
    var scopesArray = options.scopeDescriptor.getScopesArray();
    var sharedConfig = {
      options: options,
      xmlCatalog: xmlCatalog,
      xIncludeAware: xIncludeAware,
      xIncludeFixupBaseUris: xIncludeFixupBaseUris,
      xIncludeFixupLanguage: xIncludeFixupLanguage,
      currentSchemaProps: currentSchemaProps,
      wildcardSuggestions: wildcardSuggestions
    };
    var precedingLineText = getPrecedingLineText(options);
    var tagNamePIPrefix = getTagNamePIPrefix(precedingLineText);
    if (tagNamePIPrefix !== null) {
      return getElementPISuggestions(sharedConfig, tagNamePIPrefix);
    }
    if (includesTagScope(scopesArray)) {
      var quotedScope = getQuotedScope(scopesArray);
      if (quotedScope) {
        return getAttributeValueSuggestions(sharedConfig, precedingLineText, quotedScope);
      }
      if (getPreviousTagBracket(options) === '<') {
        return getAttributeNameSuggestions(sharedConfig, precedingLineText);
      }
    }
    return [];
  };
};

var createGrammarScopeMatcher = function createGrammarScopeMatcher(value) {
  return function (_ref) {
    var rootScopes = _ref.rootScopes;
    return rootScopes.includes(value);
  };
};
var createPathRegexMatcher = function createPathRegexMatcher(pathRegexStr) {
  try {
    var pathRegex = new RegExp(pathRegexStr);
    return function (_ref2) {
      var filePath = _ref2.filePath;
      return pathRegex.test(filePath);
    };
  } catch (err) {
    console.error('Could not parse RegExp "' + pathRegexStr + '"', err);
    return function () {
      return false;
    };
  }
};
var createRootNsMatcher = function createRootNsMatcher(value) {
  return function (_ref3) {
    var rootNs = _ref3.rootNs;
    return value === rootNs;
  };
};
var createRootLocalNameMatcher = function createRootLocalNameMatcher(value) {
  return function (_ref4) {
    var rootLocalName = _ref4.rootLocalName;
    return value === rootLocalName;
  };
};
var createRootAttributeMatcher = function createRootAttributeMatcher(name, value) {
  return function (_ref5) {
    var rootAttributes = _ref5.rootAttributes;
    return rootAttributes[name] === value;
  };
};
var createPublicIdMatcher = function createPublicIdMatcher(value) {
  return function (_ref6) {
    var publicId = _ref6.publicId;
    return value === publicId;
  };
};
var sortByPriority = function sortByPriority(arr) {
  return arr.sort(function (a, b) {
    return b.priority - a.priority;
  });
};
var createTestFn = function createTestFn(_ref7) {
  var grammarScope = _ref7.grammarScope,
      pathRegex = _ref7.pathRegex,
      rootNs = _ref7.rootNs,
      rootLocalName = _ref7.rootLocalName,
      rootAttributes = _ref7.rootAttributes,
      publicId = _ref7.publicId;
  var matchers = [];
  if (grammarScope) {
    matchers.push(createGrammarScopeMatcher(grammarScope));
  }
  if (pathRegex) {
    matchers.push(createPathRegexMatcher(pathRegex));
  }
  if (rootNs) {
    matchers.push(createRootNsMatcher(rootNs));
  }
  if (rootLocalName) {
    matchers.push(createRootLocalNameMatcher(rootLocalName));
  }
  if (rootAttributes) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;
    try {
      for (var _iterator = Object.keys(rootAttributes)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var name = _step.value;
        matchers.push(createRootAttributeMatcher(name, rootAttributes[name]));
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  if (publicId) {
    matchers.push(createPublicIdMatcher(grammarScope));
  }
  return matchers.length ? overEvery(matchers) : function () {
    return false;
  };
};
var parseRule = function parseRule(_ref8) {
  var test = _ref8.test,
      outcome = _ref8.outcome,
      settingsPath = _ref8.settingsPath;
  var testFn = createTestFn(test);
  var newOutcome = {};
  var basePath = path.dirname(settingsPath);
  if (outcome.xmlCatalog) {
    newOutcome.xmlCatalog = path.resolve(basePath, outcome.xmlCatalog);
  }
  if (outcome.schemaProps) {
    newOutcome.schemaProps = outcome.schemaProps.map(function (_ref9) {
      var schemaPath = _ref9.path,
          lang = _ref9.lang;
      return {
        path: path.resolve(basePath, schemaPath),
        lang: lang
      };
    });
  }
  return {
    test: testFn,
    outcome: Object.assign({}, outcome, newOutcome)
  };
};
var parseRules = flow(map(parseRule), sortByPriority);
var RuleManager = function () {
  function RuleManager() {
    classCallCheck(this, RuleManager);
    this.parsedConfigRules = [];
    this.parsedPackageRules = [];
    this.parsedRules = [];
  }
  createClass(RuleManager, [{
    key: 'updateConfigRules',
    value: function updateConfigRules(rules) {
      this.parsedConfigRules = parseRules(rules);
      this.parsedRules = this.parsedConfigRules.concat(this.parsedPackageRules);
    }
  }, {
    key: 'updatePackageRules',
    value: function updatePackageRules(rules) {
      this.parsedPackageRules = parseRules(rules);
      this.parsedRules = this.parsedConfigRules.concat(this.parsedPackageRules);
    }
  }, {
    key: 'getParsedRules',
    value: function getParsedRules() {
      return this.parsedRules;
    }
  }]);
  return RuleManager;
}();

var serverProcessInstance = ServerProcess.getInstance();
if (serverProcessInstance.onError === ServerProcess.prototype.onError) {
  serverProcessInstance.onError = function (err) {
    atom.notifications.addError('[linter-autocomplete-jing] ' + err.message, {
      detail: err.stack,
      dismissable: true
    });
  };
}
var subscriptions = void 0;
var initialPackagesActivated = false;
var shouldSuppressAutocomplete = false;
var ruleManager = new RuleManager();
var grammarScopes = [];
var localConfig = {};
var addErrorNotification = function addErrorNotification(err) {
  atom.notifications.addError('[linter-autocomplete-jing] ' + err.message, {
    detail: err.stack,
    dismissable: true
  });
  return [];
};
var setServerConfig = function setServerConfig(args) {
  if (serverProcessInstance.isReadyPromise) {
    serverProcessInstance.isReadyPromise.then(function () {
      return serverProcessInstance.sendRequest(args, null);
    }).catch(addErrorNotification);
  }
};
var setLocalConfig = function setLocalConfig(key) {
  return function (value) {
    if (key === 'rules') {
      ruleManager.updateConfigRules(value);
      return;
    }
    localConfig[key] = value;
    if (!serverProcessInstance.isReady) return;
    if (['javaExecutablePath', 'jvmArguments'].includes(key)) {
      serverProcessInstance.exit();
    } else if (key === 'schemaCacheSize') {
      setServerConfig(['S', value]);
    }
  };
};
var triggerAutocomplete = function triggerAutocomplete(editor) {
  atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
    activatedManually: false
  });
};
var cancelAutocomplete = function cancelAutocomplete(editor) {
  atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:cancel', {
    activatedManually: false
  });
};
var updateGrammarScopes = function updateGrammarScopes() {
  var grammars = atom.grammars.getGrammars();
  var newGrammarScopes = flow(map('scopeName'), filter(startsWith('text.xml')))(grammars);
  grammarScopes.splice.apply(grammarScopes, [0, grammarScopes.length].concat(toConsumableArray(newGrammarScopes)));
};
var updateRules = function updateRules() {
  var activePackages = atom.packages.getActivePackages();
  var rules = flow(flatMap('settings'), flatMap(function (_ref) {
    var settingsPath = _ref.path,
        scopedProperties = _ref.scopedProperties;
    return flow(get(['.text.xml', 'validation', 'rules']), map(function (_ref2) {
      var test = _ref2.test,
          outcome = _ref2.outcome;
      return { test: test, outcome: outcome, settingsPath: settingsPath };
    }))(scopedProperties);
  }), compact)(activePackages);
  ruleManager.updatePackageRules(rules);
};
var handlePackageChanges = debounce(500, function () {
  updateGrammarScopes();
  updateRules();
});
var main = {
  ServerProcess: ServerProcess,
  ruleManager: ruleManager,
  activate: function activate() {
    require('atom-package-deps').install();
    subscriptions = new atom$1.CompositeDisposable();
    Object.keys(atom.config.get('linter-autocomplete-jing')).forEach(function (key) {
      return subscriptions.add(atom.config.observe('linter-autocomplete-jing.' + key, setLocalConfig(key)));
    });
    subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-autocomplete-jing:clear-schema-cache': function linterAutocompleteJingClearSchemaCache() {
        return setServerConfig(['C']);
      }
    }));
    var setPackageListeners = function setPackageListeners() {
      subscriptions.add(atom.packages.onDidActivatePackage(handlePackageChanges));
      subscriptions.add(atom.packages.onDidDeactivatePackage(handlePackageChanges));
    };
    if (initialPackagesActivated) {
      setPackageListeners();
    } else {
      subscriptions.add(atom.packages.onDidActivateInitialPackages(function () {
        initialPackagesActivated = true;
        handlePackageChanges();
        setPackageListeners();
      }));
    }
    serverProcessInstance.ensureIsReady(localConfig).catch(addErrorNotification);
  },
  deactivate: function deactivate() {
    subscriptions.dispose();
    serverProcessInstance.exit();
  },
  provideLinter: function provideLinter() {
    return {
      name: 'Jing',
      grammarScopes: grammarScopes,
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        return Promise.all([serverProcessInstance.ensureIsReady(localConfig), getSchemaProps(textEditor, ruleManager.getParsedRules(), localConfig)]).then(validate(textEditor, localConfig)).catch(addErrorNotification);
      }
    };
  },
  provideAutocomplete: function provideAutocomplete() {
    return {
      selector: '.text.xml',
      disableForSelector: '.comment, .string.unquoted.cdata.xml',
      inclusionPriority: localConfig.autocompletePriority,
      excludeLowerPriority: true,
      getSuggestions: function getSuggestions(options) {
        if (shouldSuppressAutocomplete) {
          cancelAutocomplete(options.editor);
          shouldSuppressAutocomplete = false;
          return null;
        }
        return Promise.all([serverProcessInstance.ensureIsReady(localConfig), getSchemaProps(options.editor, ruleManager.getParsedRules(), localConfig)]).then(suggest(options, localConfig)).catch(addErrorNotification);
      },
      onDidInsertSuggestion: function onDidInsertSuggestion(data) {
        var editor = data.editor,
            suggestion = data.suggestion;
        if (suggestion.retrigger) {
          setTimeout(function () {
            return triggerAutocomplete(editor);
          }, 1);
        } else {
          shouldSuppressAutocomplete = true;
          setTimeout(function () {
            shouldSuppressAutocomplete = false;
          }, 300);
        }
      }
    };
  }
};

module.exports = main;
`
