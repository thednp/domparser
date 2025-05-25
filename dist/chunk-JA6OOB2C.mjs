import {
  DOM_ERROR,
  __publicField,
  defineProperties,
  isNode,
  isObj,
  isPrimitive,
  isRoot,
  isTag,
  selfClosingTags,
  startsWith,
  toLowerCase,
  toUpperCase,
  tokenize
} from "./chunk-ZHY3EYQX.mjs";

// src/parts/selectors.ts
var SelectorCacheMap = class extends Map {
  constructor() {
    super();
    __publicField(this, "hits", 0);
    __publicField(this, "misses", 0);
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
    if (startsWith(match, "#")) {
      parts.push({ type: "#", name: "id", value: match.slice(1) });
    } else if (startsWith(match, ".")) {
      parts.push({ type: ".", name: "class", value: match.slice(1) });
    } else if (startsWith(match, "[")) {
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
        const classes = node.attributes.get("class")?.split(/\s+/) || [];
        return classes.includes(part.value);
      }
      case "[": {
        const attrValue = node.attributes.get(part.name);
        return part.value ? attrValue === part.value : attrValue !== void 0;
      }
      default: {
        return toLowerCase(node.tagName) === toLowerCase(part.name);
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
  if (!isTag(node)) return node.nodeValue;
  const { childNodes } = node;
  if (!childNodes.length) return "";
  return childNodes.map(
    (n) => isTag(n) ? textContent(n) : n.nodeValue
  ).join("\n");
};
var innerHTML = ({ childNodes }, depth = 0) => {
  if (!childNodes.length) return "";
  const childIsText = childNodes.length === 1 && !isTag(childNodes[0]);
  const space = depth && !childIsText ? "  ".repeat(depth) : "";
  return childNodes.filter((n) => n.nodeName !== "#comment").map((n) => isTag(n) ? outerHTML(n, depth) : space + n.nodeValue).join("\n");
};
var outerHTML = (node, depth = 0) => {
  const space = depth ? "  ".repeat(depth) : "";
  const { attributes, tagName, childNodes } = node;
  const hasChildren = childNodes.length > 0;
  const childIsText = childNodes.length === 1 && !isTag(childNodes[0]);
  const hasAttributes = attributes.size > 0;
  const isSelfClosing = selfClosingTags.has(tagName);
  const attrStr = hasAttributes ? " " + Array.from(attributes).map(([key, val]) => `${key}="${val}"`).join(" ") : "";
  let output = `${space}<${tagName}${attrStr}${isSelfClosing ? " /" : ""}>`;
  output += hasChildren && !childIsText ? "\n" : "";
  output += hasChildren ? innerHTML(node, depth + 1) : "";
  output += !childIsText && hasChildren ? `
${space}` : "";
  output += !isSelfClosing ? `</${tagName}>` : "";
  return output;
};
function createBasicNode(nodeName, text) {
  return {
    nodeName,
    nodeValue: nodeName !== "#text" ? `<${text}>` : text
  };
}
function createNode(nodeName, ...childNodes) {
  const ALL = [];
  const CHILDREN = [];
  const CHILDNODES = [];
  const nodeIsRoot = nodeName === "#document";
  const ownerDocument = this ?? void 0;
  const node = {
    nodeName,
    append(...nodes) {
      for (const child of nodes) {
        if (!isNode(child)) {
          throw new Error(`${DOM_ERROR} Invalid node.`);
        }
        CHILDNODES.push(child);
        if (isTag(child)) {
          ALL.push(child);
          CHILDREN.push(child);
          ownerDocument?.register(child);
          defineProperties(child, {
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
        defineProperties(child, {
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
    ...isRoot({ nodeName }) && {
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
        return ALL.find((node2) => node2.attributes.get("id") === id) ?? null;
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
      if (!childNode || !isTag(childNode)) {
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
      if (!childNode || !isNode(childNode)) {
        throw new Error(
          "DomError: the childNode parameter must be a valid ChildNode"
        );
      }
      const indexOf = (arr) => arr.indexOf(childNode);
      if (isTag(childNode)) {
        const idx1 = indexOf(ALL);
        const idx2 = indexOf(CHILDREN);
        if (idx1 > -1) ALL.splice(idx1, 1);
        if (idx2 > -1) CHILDREN.splice(idx2, 1);
        childNode.cleanup();
        ownerDocument?.deregister(childNode);
      }
      const idx3 = indexOf(CHILDNODES);
      if (idx3 > -1) CHILDNODES.splice(idx3, 1);
    },
    replaceChildren: (...newChildren) => {
      CHILDNODES.slice(0).forEach((child) => node.removeChild(child));
      node.append(...newChildren);
    },
    querySelector(selector) {
      return ALL.find((n) => n.matches(selector)) ?? null;
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
        return classAttr?.split(/\s+/).includes(className) ?? false;
      });
    }
  };
  defineProperties(node, {
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
    defineProperties(node, {
      all: {
        enumerable: true,
        get: () => ALL
      },
      documentElement: {
        enumerable: true,
        get: () => ALL.find((node2) => toUpperCase(node2.tagName) === "HTML")
      },
      head: {
        enumerable: true,
        get: () => ALL.find((node2) => toUpperCase(node2.tagName) === "HEAD")
      },
      body: {
        enumerable: true,
        get: () => ALL.find((node2) => toUpperCase(node2.tagName) === "BODY")
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
  if (childNodes?.length) {
    node.append(...childNodes);
  }
  return node;
}
var convertToNode = (n) => {
  if (isPrimitive(n)) {
    const { tokenType, value } = tokenize(String(n))[0];
    return createBasicNode(`#${tokenType}`, value);
  }
  return n;
};
function createElement(tagName, first, ...args) {
  const childNodes = [];
  let attributes = /* @__PURE__ */ new Map();
  if (first) {
    if (isObj(first) && !isNode(first)) {
      attributes = new Map(Object.entries(first));
    } else {
      childNodes.push(convertToNode(first));
    }
  }
  const nodes = args.map(convertToNode).filter(isNode);
  childNodes.push(...nodes);
  const node = createNode.call(
    this,
    toUpperCase(tagName),
    ...childNodes
  );
  const charset = attributes.get("charset");
  if (tagName === "meta" && charset) {
    this.charset = toUpperCase(charset);
  }
  defineProperties(node, {
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
      get: () => attributes.get("id") ?? ""
    },
    className: {
      enumerable: true,
      get: () => attributes.get("class") ?? ""
    }
  });
  node.hasAttribute = (attrName) => attributes.has(attrName);
  node.getAttribute = (attrName) => attributes.get(attrName) ?? null;
  node.setAttribute = (attrName, attrValue) => {
    attributes.set(attrName, attrValue);
  };
  node.hasAttributeNS = (_namespace, attrName) => attributes.has(attrName);
  node.getAttributeNS = (_namespace, attrName) => attributes.get(attrName) ?? null;
  node.setAttributeNS = (_namespace, attrName, attrValue) => {
    attributes.set(attrName, attrValue);
  };
  node.closest = (selector) => {
    if (!selector) throw new Error("DomError: selector must be a string");
    if (node.matches(selector)) return node;
    let currentParent = node.parentNode;
    while (!isRoot(currentParent)) {
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

export {
  selectorCache,
  matchesSelector,
  createBasicNode,
  createNode,
  createElement,
  createDocument
};
//# sourceMappingURL=chunk-JA6OOB2C.mjs.map