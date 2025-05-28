"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }














var _chunkCLVEXPEPcjs = require('./chunk-CLVEXPEP.cjs');

// src/parts/selectors.ts
var SelectorCacheMap = class extends Map {
  constructor() {
    super();
    _chunkCLVEXPEPcjs.__publicField.call(void 0, this, "hits", 0);
    _chunkCLVEXPEPcjs.__publicField.call(void 0, this, "misses", 0);
    this.misses = 0;
    this.hits = 0;
  }
  hit() {
    this.hits += 1;
  }
  miss() {
    this.hits += 1;
  }
  getMatchFunction(selector, maxSize = 100) {
    let matchFn = this.get(selector);
    if (!matchFn) {
      this.miss();
      if (this.size >= maxSize) {
        const firstKey = this.keys().next().value;
        if (firstKey) this.delete(firstKey);
      }
      const parts = selector.split(",").map((s) => s.trim());
      matchFn = (node) => parts.some((part) => matchesSingleSelector(node, part));
      this.set(selector, matchFn);
    } else {
      this.hit();
    }
    return matchFn;
  }
  clear() {
    super.clear();
    this.misses = 0;
    this.hits = 0;
  }
  getStats() {
    return {
      size: this.size,
      hits: this.hits,
      misses: this.misses,
      // prevent division by ZERO
      hitRate: this.hits / (this.hits + this.misses || 1)
    };
  }
};
var selectorCache = new SelectorCacheMap();
var SELECTOR_REGEX = /([.#]?[\w-]+|\[[\w-]+(?:=[^\]]+)?\])+/g;
var parseSelector = (selector) => {
  const parts = [];
  const matches = selector.match(SELECTOR_REGEX) || /* istanbul ignore next @preserve */
  [];
  for (const match of matches) {
    if (_chunkCLVEXPEPcjs.startsWith.call(void 0, match, "#")) {
      parts.push({ type: "#", name: "id", value: match.slice(1) });
    } else if (_chunkCLVEXPEPcjs.startsWith.call(void 0, match, ".")) {
      parts.push({ type: ".", name: "class", value: match.slice(1) });
    } else if (_chunkCLVEXPEPcjs.startsWith.call(void 0, match, "[")) {
      const [name, value] = match.slice(1, -1).split("=");
      parts.push({
        type: "[",
        name,
        value: value ? value.replace(/['"]/g, "") : void 0
      });
    } else {
      parts.push({ type: "", name: match });
    }
  }
  return parts;
};
var matchesSingleSelector = (node, selector) => {
  const parts = parseSelector(selector);
  return parts.every((part) => {
    switch (part.type) {
      case "#": {
        return node.attributes.get("id") === part.value;
      }
      case ".": {
        const classes = _optionalChain([node, 'access', _ => _.attributes, 'access', _2 => _2.get, 'call', _3 => _3("class"), 'optionalAccess', _4 => _4.split, 'call', _5 => _5(/\s+/)]) || [];
        return classes.includes(part.value);
      }
      case "[": {
        const attrValue = node.attributes.get(part.name);
        return part.value ? attrValue === part.value : attrValue !== void 0;
      }
      default: {
        return _chunkCLVEXPEPcjs.toLowerCase.call(void 0, node.tagName) === _chunkCLVEXPEPcjs.toLowerCase.call(void 0, part.name);
      }
    }
  });
};
var matchesSelector = (node, selector) => {
  const matcher = selectorCache.getMatchFunction(selector);
  return matcher(node);
};

// src/parts/prototype.ts
var textContent = (node) => {
  if (!_chunkCLVEXPEPcjs.isTag.call(void 0, node)) return node.nodeValue;
  const { childNodes, nodeName } = node;
  if (nodeName === "BR") return "\n";
  if (!childNodes.length) return "";
  const hasTagChild = childNodes.some(_chunkCLVEXPEPcjs.isTag);
  return childNodes.map((n) => _chunkCLVEXPEPcjs.isTag.call(void 0, n) ? textContent(n) : n.nodeValue).join(
    hasTagChild ? "\n" : ""
  );
};
var innerHTML = (node, depth = 0) => {
  const { childNodes: childContents } = node;
  const childNodes = childContents.filter((c) => c.nodeName !== "#comment");
  if (!childNodes.length) return "";
  const childIsText = childNodes.length === 1 && !_chunkCLVEXPEPcjs.isTag.call(void 0, childNodes[0]);
  const space = depth && !childIsText ? "  ".repeat(depth) : "";
  return childNodes.map((n) => _chunkCLVEXPEPcjs.isTag.call(void 0, n) ? outerHTML(n, depth) : space + n.nodeValue).join("\n");
};
var outerHTML = (node, depth = 0) => {
  const { attributes, tagName, childNodes: childContents } = node;
  const childNodes = childContents.filter((c) => c.nodeName !== "#comment");
  const space = depth ? "  ".repeat(depth) : "";
  const hasChildren = childNodes.length > 0;
  const childIsText = childNodes.length === 1 && !_chunkCLVEXPEPcjs.isTag.call(void 0, childNodes[0]);
  const hasAttributes = attributes.size > 0;
  const isSelfClosing = _chunkCLVEXPEPcjs.selfClosingTags.has(tagName);
  const attrStr = hasAttributes ? " " + Array.from(attributes).map(([key, val]) => `${key}="${_chunkCLVEXPEPcjs.trim.call(void 0, val)}"`).join(" ") : "";
  let output = `${space}<${tagName}${attrStr}${isSelfClosing ? " /" : ""}>`;
  output += !childIsText && hasChildren ? "\n" : "";
  output += hasChildren ? innerHTML(node, depth + 1) : "";
  output += !childIsText && hasChildren ? `
${space}` : "";
  output += !isSelfClosing ? `</${tagName}>` : "";
  return output;
};
function createBasicNode(nodeName, text) {
  return {
    nodeName,
    // nodeValue: nodeName !== "#text" ? `<${text}>` : text,
    nodeValue: text
  };
}
function createNode(nodeName, ...childNodes) {
  const ALL = [];
  const CHILDREN = [];
  const CHILDNODES = [];
  const nodeIsRoot = nodeName === "#document";
  const ownerDocument = _nullishCoalesce(this, () => ( void 0));
  const node = {
    nodeName,
    append(...nodes) {
      for (const child of nodes) {
        if (!_chunkCLVEXPEPcjs.isNode.call(void 0, child)) {
          throw new Error(`${_chunkCLVEXPEPcjs.DOM_ERROR} Invalid node.`);
        }
        CHILDNODES.push(child);
        if (_chunkCLVEXPEPcjs.isTag.call(void 0, child)) {
          ALL.push(child);
          CHILDREN.push(child);
          _optionalChain([ownerDocument, 'optionalAccess', _6 => _6.register, 'call', _7 => _7(child)]);
          _chunkCLVEXPEPcjs.defineProperties.call(void 0, child, {
            innerHTML: {
              enumerable: false,
              get: () => innerHTML(child)
            },
            outerHTML: {
              enumerable: false,
              get: () => outerHTML(child)
            }
          });
        }
        _chunkCLVEXPEPcjs.defineProperties.call(void 0, child, {
          // Add text generation methods
          textContent: {
            enumerable: false,
            get: () => textContent(child)
          },
          // Add node relationship properties
          parentNode: {
            enumerable: false,
            get: () => node
          },
          parentElement: {
            enumerable: false,
            get: () => node
          },
          ownerDocument: {
            enumerable: false,
            get: () => ownerDocument
          }
        });
        child.remove = () => {
          node.removeChild(child);
        };
      }
    },
    cleanup: () => {
      ALL.length = 0;
      CHILDREN.length = 0;
      CHILDNODES.length = 0;
    },
    // Root document methods
    ..._chunkCLVEXPEPcjs.isRoot.call(void 0, { nodeName }) && {
      createElement(tagName, first, ...rest) {
        return createElement.call(
          node,
          tagName,
          first,
          ...rest
        );
      },
      createElementNS(_ns, tagName, first, ...rest) {
        return createElement.call(node, tagName, first, ...rest);
      },
      createComment(content) {
        return createBasicNode("#comment", content);
      },
      createTextNode(content) {
        return createBasicNode("#text", content);
      },
      getElementById(id) {
        return _nullishCoalesce(ALL.find((node2) => node2.attributes.get("id") === id), () => ( null));
      }
    },
    // Element methods
    ...!nodeIsRoot && {
      matches(selector) {
        return matchesSelector(node, selector);
      }
    },
    // Shared methods
    contains: (childNode) => {
      if (!childNode || !_chunkCLVEXPEPcjs.isTag.call(void 0, childNode)) {
        throw new Error(
          "DomError: the childNode parameter must be a valid DOMNode"
        );
      }
      if (node.children.includes(childNode)) {
        return true;
      }
      let currentParent = childNode.parentNode;
      while (currentParent) {
        if (currentParent === node) {
          return true;
        }
        currentParent = currentParent.parentNode;
      }
      return false;
    },
    removeChild(childNode) {
      if (!childNode || !_chunkCLVEXPEPcjs.isNode.call(void 0, childNode)) {
        throw new Error(
          "DomError: the childNode parameter must be a valid ChildNode"
        );
      }
      const indexOf = (arr) => arr.indexOf(childNode);
      if (_chunkCLVEXPEPcjs.isTag.call(void 0, childNode)) {
        const idx1 = indexOf(ALL);
        const idx2 = indexOf(CHILDREN);
        if (idx1 > -1) ALL.splice(idx1, 1);
        if (idx2 > -1) CHILDREN.splice(idx2, 1);
        childNode.cleanup();
        _optionalChain([ownerDocument, 'optionalAccess', _8 => _8.deregister, 'call', _9 => _9(childNode)]);
      }
      const idx3 = indexOf(CHILDNODES);
      if (idx3 > -1) CHILDNODES.splice(idx3, 1);
    },
    replaceChildren: (...newChildren) => {
      CHILDNODES.slice(0).forEach((child) => node.removeChild(child));
      node.append(...newChildren);
    },
    querySelector(selector) {
      return _nullishCoalesce(ALL.find((n) => n.matches(selector)), () => ( null));
    },
    querySelectorAll(selector) {
      return ALL.filter((n) => n.matches(selector));
    },
    getElementsByTagName(tagName) {
      return tagName === "*" ? ALL : ALL.filter((n) => n.tagName.toLowerCase() === tagName.toLowerCase());
    },
    getElementsByClassName(className) {
      return ALL.filter((n) => {
        const classAttr = n.attributes.get("class");
        return _nullishCoalesce(_optionalChain([classAttr, 'optionalAccess', _10 => _10.split, 'call', _11 => _11(/\s+/), 'access', _12 => _12.includes, 'call', _13 => _13(className)]), () => ( false));
      });
    }
  };
  _chunkCLVEXPEPcjs.defineProperties.call(void 0, node, {
    childNodes: {
      enumerable: true,
      get: () => CHILDNODES
    },
    children: {
      enumerable: true,
      get: () => CHILDREN
    },
    // Add tag-specific property
    ...!nodeIsRoot ? {
      registerChild: {
        enumerable: false,
        value: (child) => {
          ALL.push(child);
        }
      }
    } : {}
  });
  if (nodeIsRoot) {
    _chunkCLVEXPEPcjs.defineProperties.call(void 0, node, {
      all: {
        enumerable: true,
        get: () => ALL
      },
      documentElement: {
        enumerable: true,
        get: () => ALL.find((node2) => _chunkCLVEXPEPcjs.toUpperCase.call(void 0, node2.tagName) === "HTML")
      },
      head: {
        enumerable: true,
        get: () => ALL.find((node2) => _chunkCLVEXPEPcjs.toUpperCase.call(void 0, node2.tagName) === "HEAD")
      },
      body: {
        enumerable: true,
        get: () => ALL.find((node2) => _chunkCLVEXPEPcjs.toUpperCase.call(void 0, node2.tagName) === "BODY")
      },
      register: {
        enumerable: false,
        value: (child) => {
          ALL.push(child);
        }
      },
      deregister: {
        enumerable: false,
        value: (child) => {
          const idx = ALL.indexOf(child);
          if (idx > -1) ALL.splice(idx, 1);
        }
      }
    });
  }
  if (_optionalChain([childNodes, 'optionalAccess', _14 => _14.length])) {
    node.append(...childNodes);
  }
  return node;
}
var convertToNode = (n) => {
  if (_chunkCLVEXPEPcjs.isPrimitive.call(void 0, n)) {
    const { tokenType, value } = _chunkCLVEXPEPcjs.tokenize.call(void 0, String(n))[0];
    return createBasicNode(`#${tokenType}`, value);
  }
  return n;
};
function createElement(tagName, first, ...args) {
  const childNodes = [];
  let attributes = /* @__PURE__ */ new Map();
  if (first) {
    if (_chunkCLVEXPEPcjs.isObj.call(void 0, first) && !_chunkCLVEXPEPcjs.isNode.call(void 0, first)) {
      attributes = new Map(Object.entries(first));
    } else {
      childNodes.push(convertToNode(first));
    }
  }
  const nodes = args.map(convertToNode).filter(_chunkCLVEXPEPcjs.isNode);
  childNodes.push(...nodes);
  const node = createNode.call(
    this,
    _chunkCLVEXPEPcjs.toUpperCase.call(void 0, tagName),
    ...childNodes
  );
  const charset = attributes.get("charset");
  if (tagName === "meta" && charset) {
    this.charset = _chunkCLVEXPEPcjs.toUpperCase.call(void 0, charset);
  }
  _chunkCLVEXPEPcjs.defineProperties.call(void 0, node, {
    tagName: {
      enumerable: true,
      get: () => tagName
    },
    attributes: {
      enumerable: true,
      get: () => attributes
    },
    id: {
      enumerable: true,
      get: () => _nullishCoalesce(attributes.get("id"), () => ( ""))
    },
    className: {
      enumerable: true,
      get: () => _nullishCoalesce(attributes.get("class"), () => ( ""))
    }
  });
  node.hasAttribute = (attrName) => attributes.has(attrName);
  node.getAttribute = (attrName) => _nullishCoalesce(attributes.get(attrName), () => ( null));
  node.setAttribute = (attrName, attrValue) => {
    attributes.set(attrName, attrValue);
  };
  node.hasAttributeNS = (_namespace, attrName) => attributes.has(attrName);
  node.getAttributeNS = (_namespace, attrName) => _nullishCoalesce(attributes.get(attrName), () => ( null));
  node.setAttributeNS = (_namespace, attrName, attrValue) => {
    attributes.set(attrName, attrValue);
  };
  node.closest = (selector) => {
    if (!selector) throw new Error("DomError: selector must be a string");
    if (node.matches(selector)) return node;
    let currentParent = node.parentNode;
    while (!_chunkCLVEXPEPcjs.isRoot.call(void 0, currentParent)) {
      if (currentParent.matches(selector)) {
        return currentParent;
      }
      currentParent = currentParent.parentNode;
    }
    return null;
  };
  return node;
}
var createDocument = () => createNode.call(null, "#document");








exports.selectorCache = selectorCache; exports.matchesSelector = matchesSelector; exports.createBasicNode = createBasicNode; exports.createNode = createNode; exports.createElement = createElement; exports.createDocument = createDocument;
//# sourceMappingURL=chunk-RMHPSCGU.cjs.map