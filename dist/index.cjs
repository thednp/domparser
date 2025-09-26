const require_util = require('./util-DVTj_GWo.cjs');
const require_prototype = require('./prototype-MIu8v-er.cjs');
const require_parser = require('./parser-BzQuJgBc.cjs');
const require_dom_parser = require('./dom-parser-BzGeVYGi.cjs');

//#region package.json
var version = "0.1.6";

//#endregion
exports.ATTR_REGEX = require_util.ATTR_REGEX;
exports.DOM_ERROR = require_util.DOM_ERROR;
exports.DomParser = require_dom_parser.DomParser;
exports.Parser = require_parser.Parser;
exports.charCodeAt = require_util.charCodeAt;
exports.createBasicNode = require_prototype.createBasicNode;
exports.createDocument = require_prototype.createDocument;
exports.createElement = require_prototype.createElement;
exports.createNode = require_prototype.createNode;
exports.defineProperties = require_util.defineProperties;
exports.endsWith = require_util.endsWith;
exports.escape = require_util.escape;
exports.fromCharCode = require_util.fromCharCode;
exports.getAttributes = require_util.getAttributes;
exports.getBaseAttributes = require_util.getBaseAttributes;
exports.isNode = require_util.isNode;
exports.isObj = require_util.isObj;
exports.isPrimitive = require_util.isPrimitive;
exports.isRoot = require_util.isRoot;
exports.isTag = require_util.isTag;
exports.matchesSelector = require_prototype.matchesSelector;
exports.selectorCache = require_prototype.selectorCache;
exports.selfClosingTags = require_util.selfClosingTags;
exports.startsWith = require_util.startsWith;
exports.toLowerCase = require_util.toLowerCase;
exports.toUpperCase = require_util.toUpperCase;
exports.tokenize = require_util.tokenize;
exports.trim = require_util.trim;
Object.defineProperty(exports, 'version', {
  enumerable: true,
  get: function () {
    return version;
  }
});
//# sourceMappingURL=index.cjs.map