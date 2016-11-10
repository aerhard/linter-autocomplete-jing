`
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var lodash_fp = require('lodash/fp');
var atom$1 = require('atom');
var net = require('net');
var spawn = _interopDefault(require('cross-spawn'));
var path = _interopDefault(require('path'));
var sax = _interopDefault(require('sax'));

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

















var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
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

var portRegex = /XML Tools Server listening on port (\d+)/;
var jarPath = '../vendor/xml-tools-server-0.4.5.jar';
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
    console.error('Server message on stderr: ' + data); // eslint-disable-line
  },
  onError: function onError(err) {
    console.error('Server error:', err); // eslint-disable-line
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

var mapWithKey = lodash_fp.map.convert({ cap: false });

var createGrammarScopeMatcher = function createGrammarScopeMatcher(value) {
  return function (_ref) {
    var rootScopes = _ref.rootScopes;
    return rootScopes.includes(value);
  };
};

var createPathRegexMatcher = function createPathRegexMatcher(pathRegexStr) {
  try {
    var _ret = function () {
      var pathRegex = new RegExp(pathRegexStr);

      return {
        v: function v(_ref2) {
          var filePath = _ref2.filePath;
          return pathRegex.test(filePath);
        }
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } catch (err) {
    console.error('Could not parse RegExp "' + pathRegexStr + '"', err); // eslint-disable-line no-console
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

var createRootAttributeMatcher = function createRootAttributeMatcher(value, name) {
  return function (_ref5) {
    var rootAttributes = _ref5.rootAttributes;
    return rootAttributes[name] === value;
  };
};

var sortByPriority = function sortByPriority(arr) {
  return arr.sort(function (a, b) {
    return b.priority - a.priority;
  });
};

var parse = lodash_fp.flow(lodash_fp.map(lodash_fp.flow(lodash_fp.update('test', function (_ref6) {
  var grammarScope = _ref6.grammarScope,
      pathRegex = _ref6.pathRegex,
      rootNs = _ref6.rootNs,
      rootLocalName = _ref6.rootLocalName,
      rootAttributes = _ref6.rootAttributes;

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
    var attributeMatchers = mapWithKey(createRootAttributeMatcher, rootAttributes);
    matchers.push.apply(matchers, toConsumableArray(attributeMatchers));
  }

  return matchers.length ? lodash_fp.allPass(matchers) : function () {
    return false;
  };
}), function (rule) {
  var newOutcome = {};
  var outcome = rule.outcome,
      settingsPath = rule.settingsPath;

  var basePath = path.dirname(settingsPath);

  if (outcome.xmlCatalog) {
    newOutcome.xmlCatalog = path.resolve(basePath, outcome.xmlCatalog);
  }
  if (outcome.schemaProps) {
    newOutcome.schemaProps = outcome.schemaProps.map(function (_ref7) {
      var schemaPath = _ref7.path;
      return {
        path: path.resolve(basePath, schemaPath)
      };
    });
  }
  return lodash_fp.merge(rule, { outcome: newOutcome });
})), sortByPriority);

var ruleProcessor = {
  parse: parse
};

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
  url: /^(?:[a-z][a-z0-9\+\-\.]*:)?\/\//i,
  previousTagBracket: /"[^<]*?"|'[^<]*?'|<\/|<|>/g,
  nextTagBracket: /"[^<]*?"|'[^<]*?'|<|\/>|>/g
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

    var addXsdSchemaPath = function addXsdSchemaPath(href) {
      return href && xsdSchemaPaths.push(regex.url.test(href) ? href : path.resolve(path.dirname(textEditor.getPath()), href));
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
            filePath: textEditor.getPath(),
            range: helpers.rangeFromLineNumber(textEditor, row)
          });
        }
      }

      if (lang) {
        schemaProps.push({
          lang: lang,
          line: row,
          path: regex.url.test(href) ? href : path.resolve(path.dirname(textEditor.getPath()), href)
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
    saxParser.ondoctype = function () {
      return hasDoctype = true;
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
      filePath: textEditor.getPath(),
      rootNs: rootNs,
      rootLocalName: rootLocalName,
      rootAttributes: rootAttributes
    };

    var rule = parsedRules.find(function (r) {
      return r.test(docProps);
    });

    var xmlCatalog = rule && 'xmlCatalog' in rule.outcome ? rule.outcome.xmlCatalog : config.xmlCatalog;

    var dtdValidation = rule && 'dtdValidation' in rule.outcome ? rule.outcome.dtdValidation : config.dtdValidation;

    if (rule && !schemaProps.length) {
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

    resolve({ schemaProps: schemaProps, messages: messages, xmlCatalog: xmlCatalog });
  });
};

var serverProcessInstance$1 = ServerProcess.getInstance();

var helpers$1 = require('atom-linter');

var messageRegex = /^([a-z0-9\.]+?):((.*?):\s?)?((\d+):)?(?:\d+:\s)?(error|fatal|warning):\s(.*)$/;

var parseMessage = function parseMessage(textEditor, schemaProps, config) {
  return function (str) {
    var match = messageRegex.exec(str);
    if (!match) {
      console.error('Could not parse message "' + str + '"'); // eslint-disable-line
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
        range: helpers$1.rangeFromLineNumber(textEditor, Number(line) - 1)
      };
    }

    if (!config.displaySchemaWarnings && level === 'warning') {
      return null;
    }

    var label = level === 'warning' ? 'Schema parser warning: ' : 'Could not process schema or catalog: ';

    var schema = schemaProps.find(function (sch) {
      return sch.path === systemId && sch.lang === lang;
    });
    var range = schema ? helpers$1.rangeFromLineNumber(textEditor, schema.line) : [[0, 0], [0, 0]];

    return {
      type: 'Warning',
      html: label + html,
      filePath: filePath,
      range: range
    };
  };
};

var validate = function validate(textEditor, config) {
  return function (_ref) {
    var _ref2 = slicedToArray(_ref, 2),
        _ref2$ = _ref2[1],
        schemaProps = _ref2$.schemaProps,
        messages = _ref2$.messages,
        xmlCatalog = _ref2$.xmlCatalog;

    var headers = ['V', 'r', 'UTF-8', textEditor.getPath(), xmlCatalog || ''].concat(toConsumableArray(schemaProps.map(function (schema) {
      return schema.lang + ' ' + (schema.path || '');
    })));
    var body = textEditor.getText();

    return serverProcessInstance$1.sendRequest(headers, body).then(lodash_fp.flow(lodash_fp.trim, lodash_fp.split(/\r?\n/), lodash_fp.filter(lodash_fp.identity), lodash_fp.map(parseMessage(textEditor, schemaProps, config)), lodash_fp.compact, lodash_fp.concat(messages), lodash_fp.sortBy('range[0][0]')));
  };
};

var serverProcessInstance$2 = ServerProcess.getInstance();

var getEndToken = function getEndToken(str) {
  var match = str.match(regex.endToken);
  return match ? match[1] : '';
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

var getEndBracketPosition = function getEndBracketPosition(_ref3) {
  var editor = _ref3.editor,
      bufferPosition = _ref3.bufferPosition;

  var position = null;

  editor.scanInBufferRange(regex.nextTagBracket, [bufferPosition, editor.getBuffer().getEndPosition()], function (_ref4) {
    var matchText = _ref4.matchText,
        range = _ref4.range,
        stop = _ref4.stop;

    if (!matchText.startsWith('\'') && !matchText.startsWith('"')) {
      if (matchText !== '<') {
        position = range.start;
      }
      stop();
    }
  });

  return position;
};

// linebreaks are not (yet?) supported in descriptions of autocomplete-plus
// suggestions, see https://github.com/atom/autocomplete-plus/pull/598;
// for now, this autocomplete provider uses n-dashs as a separator
var buildDescriptionString = lodash_fp.join(' \u2013 ');

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
  return function (_ref5) {
    var listItem = _ref5.listItem,
        value = _ref5.value,
        documentation = _ref5.documentation;
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

var buildAttributeNameSuggestion = function buildAttributeNameSuggestion(replacementPrefix, addSuffix) {
  return function (_ref6) {
    var value = _ref6.value,
        documentation = _ref6.documentation;

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

var buildElementSuggestion = function buildElementSuggestion(replacementPrefix, addSuffix) {
  return function (_ref7) {
    var value = _ref7.value,
        empty = _ref7.empty,
        closing = _ref7.closing,
        _ref7$attributes = _ref7.attributes,
        attributes = _ref7$attributes === undefined ? [] : _ref7$attributes,
        documentation = _ref7.documentation,
        preDefinedSnippet = _ref7.snippet;

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

    // don't retrigger autocomplete when a wildcard end tag snippet gets inserted
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
        var _buildAttributeString2 = buildAttributeStrings(attribute, index, true),
            attributeSnippet = _buildAttributeString2.snippet,
            newIndex = _buildAttributeString2.index;

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

var getTagNamePIPrefix = function getTagNamePIPrefix(precedingLineText) {
  var match = precedingLineText.match(regex.tagNamePI);
  return match ? match[1] || '' : null;
};

var getAttributeNameProps = function getAttributeNameProps(precedingLineText) {
  var match = precedingLineText.match(regex.attStartFromAttName);
  return match ? { prefix: match[1] || '', column: match.index } : null;
};

var getAttributeValueProps = function getAttributeValueProps(_ref8, hasDblQuotes) {
  var editor = _ref8.editor,
      bufferPosition = _ref8.bufferPosition;

  var attStartRegex = hasDblQuotes ? regex.attStartFromAttValueDouble : regex.attStartFromAttValueSingle;

  var result = void 0;

  editor.backwardsScanInBufferRange(attStartRegex, [bufferPosition, [0, 0]], function (_ref9) {
    var match = _ref9.match,
        stop = _ref9.stop;

    result = match;
    stop();
  });

  return result ? { name: result[1], prefix: result[2] || '' } : null;
};

var getQuotedScope = lodash_fp.find(function (scope) {
  return scope === 'string.quoted.double.xml' || scope === 'string.quoted.single.xml';
});

var includesTagScope = function includesTagScope(scopesArray) {
  return scopesArray.some(function (item) {
    return item === 'meta.tag.xml' || item === 'meta.tag.no-content.xml';
  });
};

var wildcardOptions = {
  none: '',
  localparts: 'w',
  all: 'wn'
};

var buildHeaders = function buildHeaders(editorPath, xmlCatalog, wildcardSuggestions, _ref10, type, fragment) {
  var lang = _ref10.lang,
      schemaPath = _ref10.path;
  return ['A', type, fragment || '', 'r' + wildcardOptions[wildcardSuggestions], 'UTF-8', editorPath, xmlCatalog || '', lang + ' ' + (schemaPath || '')];
};

var getSuggestions$1 = function getSuggestions$1(sharedConfig, suggestionOptions) {
  var options = sharedConfig.options,
      xmlCatalog = sharedConfig.xmlCatalog,
      currentSchemaProps = sharedConfig.currentSchemaProps,
      wildcardSuggestions = sharedConfig.wildcardSuggestions;
  var editor = options.editor;
  var type = suggestionOptions.type,
      fragment = suggestionOptions.fragment,
      body = suggestionOptions.body,
      clientData = suggestionOptions.clientData,
      filterFn = suggestionOptions.filterFn,
      builderFn = suggestionOptions.builderFn;


  var headers = buildHeaders(editor.getPath(), xmlCatalog, wildcardSuggestions, currentSchemaProps, type, fragment);

  return serverProcessInstance$2.sendRequest(headers, body).then(lodash_fp.flow(JSON.parse, function (data) {
    return clientData ? data.concat(clientData) : data;
  }, lodash_fp.filter(filterFn), lodash_fp.map(builderFn), lodash_fp.compact)).catch(function () {
    return [];
  });
};

var elementSuggestionFilter = function elementSuggestionFilter(prefix) {
  return function (_ref11) {
    var value = _ref11.value,
        closing = _ref11.closing;
    return closing ? ('/' + value).startsWith(prefix) : value.startsWith(prefix);
  };
};

var attributeValueFilter = function attributeValueFilter(prefix, endToken) {
  return function (_ref12) {
    var value = _ref12.value,
        listItem = _ref12.listItem;
    return value.startsWith(listItem ? endToken : prefix);
  };
};

var attributeNameFilter = function attributeNameFilter(prefix) {
  return function (_ref13) {
    var value = _ref13.value;
    return value.startsWith(prefix);
  };
};

var getPrecedingLineText = function getPrecedingLineText(_ref14) {
  var editor = _ref14.editor,
      bufferPosition = _ref14.bufferPosition;
  return editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);
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

  return getSuggestions$1(sharedConfig, {
    type: 'V',
    body: editor.getTextInBufferRange([[0, 0], endBracketPosition]) + '>',
    fragment: fragment,
    filterFn: attributeValueFilter(prefix, endToken),
    builderFn: buildAttributeValueSuggestion(prefix, endToken, hasDblQuotes)
  });
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

  var followingText = editor.getTextInBufferRange([bufferPosition, endBracketPosition]) + '>';

  var match = followingText.match(regex.attEndFromAttName);
  var textAfterAttribute = match ? followingText.substr(match[0].length) : followingText;
  var addSuffix = !match;

  return getSuggestions$1(sharedConfig, {
    type: 'N',
    body: textBeforeAttribute + textAfterAttribute,
    filterFn: attributeNameFilter(prefix),
    builderFn: buildAttributeNameSuggestion(prefix, addSuffix)
  });
};

var piSuggestions = [{
  value: '!--  -->',
  snippet: '!-- ${1} -->', // eslint-disable-line no-template-curly-in-string
  documentation: 'Comment'
}, {
  value: '![CDATA[]]>',
  snippet: '![CDATA[${1}]]>', // eslint-disable-line no-template-curly-in-string
  documentation: 'CDATA Section'
}];

var getElementPISuggestions = function getElementPISuggestions(sharedConfig, tagNamePIPrefix) {
  var options = sharedConfig.options;
  var editor = options.editor,
      bufferPosition = options.bufferPosition;


  var body = editor.getTextInBufferRange([[0, 0], [bufferPosition.row, bufferPosition.column - tagNamePIPrefix.length - 1]]);

  var addSuffix = !getEndBracketPosition(options);

  return getSuggestions$1(sharedConfig, {
    type: 'E',
    body: body,
    clientData: piSuggestions,
    filterFn: elementSuggestionFilter(tagNamePIPrefix),
    builderFn: buildElementSuggestion(tagNamePIPrefix, addSuffix)
  });
};

var suggest = function suggest(options, _ref15) {
  var autocompleteScope = _ref15.autocompleteScope,
      wildcardSuggestions = _ref15.wildcardSuggestions;
  return function (_ref16) {
    var _ref17 = slicedToArray(_ref16, 2),
        _ref17$ = _ref17[1],
        schemaProps = _ref17$.schemaProps,
        xmlCatalog = _ref17$.xmlCatalog;

    var currentSchemaProps = lodash_fp.find(function (_ref18) {
      var lang = _ref18.lang;
      return !!autocompleteScope[lang];
    }, schemaProps) || { type: 'none' };

    var scopesArray = options.scopeDescriptor.getScopesArray();
    var sharedConfig = { options: options, xmlCatalog: xmlCatalog, currentSchemaProps: currentSchemaProps, wildcardSuggestions: wildcardSuggestions };
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
var parsedConfigRules = [];
var parsedPackageRules = [];
var parsedRules = [];
var initialPackagesActivated = false;
var shouldSuppressAutocomplete = false;
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
      parsedConfigRules = ruleProcessor.parse(value);
      parsedRules = parsedConfigRules.concat(parsedPackageRules);
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
  var newGrammarScopes = lodash_fp.flow(lodash_fp.map('scopeName'), lodash_fp.filter(lodash_fp.startsWith('text.xml')))(grammars);

  grammarScopes.splice.apply(grammarScopes, [0, grammarScopes.length].concat(toConsumableArray(newGrammarScopes)));
};

var updateRules = function updateRules() {
  var activePackages = atom.packages.getActivePackages();

  var rules = lodash_fp.flow(lodash_fp.flatMap('settings'), lodash_fp.flatMap(function (_ref) {
    var settingsPath = _ref.path,
        scopedProperties = _ref.scopedProperties;
    return lodash_fp.flow(lodash_fp.get(['.text.xml', 'validation', 'rules']), lodash_fp.map(lodash_fp.set('settingsPath', settingsPath)))(scopedProperties);
  }), lodash_fp.compact)(activePackages);

  parsedPackageRules = ruleProcessor.parse(rules);
  parsedRules = parsedConfigRules.concat(parsedPackageRules);
};

var handlePackageChanges = function handlePackageChanges() {
  updateGrammarScopes();
  updateRules();
};

var main = {
  serverProcess: ServerProcess,
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
        return Promise.all([serverProcessInstance.ensureIsReady(localConfig), getSchemaProps(textEditor, parsedRules, localConfig)]).then(validate(textEditor, localConfig)).catch(addErrorNotification);
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

        return Promise.all([serverProcessInstance.ensureIsReady(localConfig), getSchemaProps(options.editor, parsedRules, localConfig)]).then(suggest(options, localConfig)).catch(addErrorNotification);
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
