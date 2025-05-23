var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/parts/util.ts
var ATTR_REGEX = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
var getBaseAttributes = (tagStr) => {
  const attrs = {};
  const parts = tagStr.split(/\s+/);
  if (parts.length < 2) return attrs;
  const attrStr = tagStr.slice(parts[0].length);
  let match;
  while (match = ATTR_REGEX.exec(attrStr)) {
    const [, name, d, s, u] = match;
    name !== "/" && (attrs[name] = d ?? s ?? u ?? "");
  }
  return attrs;
};
var getAttributes = (tagStr, config) => {
  const { unsafeAttrs } = config || {};
  const baseAttrs = getBaseAttributes(tagStr);
  const attrs = {};
  for (const [key, value] of Object.entries(baseAttrs)) {
    if (!unsafeAttrs || !unsafeAttrs?.has(toLowerCase(key))) {
      attrs[key] = value;
    }
  }
  return attrs;
};
var toLowerCase = (str) => str.toLowerCase();
var toUpperCase = (str) => str.toUpperCase();
var startsWith = (str, prefix, position) => str.startsWith(prefix, position);
var endsWith = (str, suffix, position) => str.endsWith(suffix, position);
var fromCharCode = (char) => String.fromCharCode(char);
var charCodeAt = (str, index) => str.charCodeAt(index);
var defineProperties = (obj, props) => Object.defineProperties(obj, props);
var isObj = (node) => node !== null && typeof node === "object";
var isRoot = (node) => isObj(node) && isNode(node) && node.nodeName === "#document";
var isTag = (node) => isObj(node) && "tagName" in node;
var isNode = (node) => isObj(node) && "nodeName" in node;
var isPrimitive = (val) => typeof val === "string" || typeof val === "number";
var trim = (str) => str.trim();
var selfClosingTags = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "path",
  "circle",
  "ellipse",
  "line",
  "rect",
  "use",
  "stop",
  "polygon",
  "polyline"
]);
var escape = (str) => {
  if (str === null || str === "") {
    return false;
  } else {
    str = str.toString();
  }
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return str.replace(/[&<>"']/g, (m) => {
    return map[m];
  });
};
var tokenize = (html) => {
  const specialTags = ["script", "style"];
  const tokens = [];
  const len = html.length;
  let token = "", inTag = false, inQuote = false, quote = 0, inTemplate = false, inComment = false, inCDATA = false, inStyleScript = false;
  for (let i = 0; i < len; i++) {
    const char = charCodeAt(html, i);
    if (inComment) {
      token += fromCharCode(char);
      if (endsWith(token, "--") && charCodeAt(html, i + 1) === 62) {
        tokens.push({
          nodeType: "comment",
          value: `<${trim(token)}>`,
          isSC: false
        });
        inComment = false;
        token = "";
        i += 1;
      }
      continue;
    }
    if (inCDATA) {
      token += fromCharCode(char);
      if (endsWith(token, "]]") && charCodeAt(html, i + 1) === 62) {
        tokens.push({
          nodeType: "text",
          value: `<${escape(trim(token))}>`,
          isSC: false
        });
        inCDATA = false;
        token = "";
        i += 1;
      }
      continue;
    }
    if (inStyleScript) {
      const endSpecialTag = specialTags.find(
        (t) => startsWith(html, `/${t}`, i + 1)
      );
      if (char === 60 && endSpecialTag && !inTag && !inTemplate && !inQuote) {
        inStyleScript = false;
      }
      if (char === 96) {
        inTemplate = !inTemplate;
      }
    }
    if ((inTag && token.includes("=") || inStyleScript) && (char === 34 || char === 39)) {
      if (!inQuote) {
        quote = char;
        inQuote = true;
      } else if (char === quote) {
        inQuote = false;
      }
      token += fromCharCode(char);
      continue;
    }
    if (char === 60 && !inQuote && !inTemplate && !inStyleScript) {
      trim(token) && tokens.push({
        nodeType: "text",
        value: trim(token),
        isSC: false
      });
      token = "";
      inTag = true;
      if (startsWith(html, "!--", i + 1)) {
        inComment = true;
        token += "!--";
        i += 3;
        continue;
      }
      if (startsWith(html, "![CDATA[", i + 1)) {
        inCDATA = true;
        token += "![CDATA[";
        i += 8;
        continue;
      }
    } else if (char === 62 && inTag && !inQuote && !inTemplate && !inComment && !inStyleScript && !inCDATA) {
      const startSpecialTag = specialTags.find(
        (t) => t === token || startsWith(token, t)
      );
      if (startSpecialTag) {
        inStyleScript = true;
      }
      const isDocType = startsWith(toLowerCase(token), "!doctype");
      if (token) {
        const isSC = endsWith(token, "/");
        tokens.push({
          nodeType: isDocType ? "doctype" : "tag",
          value: isSC ? trim(token.slice(0, -1)) : trim(token),
          isSC
        });
      }
      token = "";
      inTag = false;
    } else {
      token += fromCharCode(char);
    }
  }
  trim(token) && tokens.push({ nodeType: "text", value: trim(token), isSC: false });
  return tokens;
};
var DOM_ERROR = "DomParserError:";

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
      CHILDNODES.slice(0).forEach((childNode) => node.removeChild(childNode));
      node.append(...newChildren);
    },
    querySelector(selector) {
      return ALL.find((node2) => node2.matches(selector)) ?? null;
    },
    querySelectorAll(selector) {
      return ALL.filter((node2) => node2.matches(selector));
    },
    getElementsByTagName(tagName) {
      return tagName === "*" ? ALL : ALL.filter(
        (node2) => node2.tagName.toLowerCase() === tagName.toLowerCase()
      );
    },
    getElementsByClassName(className) {
      return ALL.filter((node2) => {
        const classAttr = node2.attributes.get("class");
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
    }
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
    const { nodeType, value } = tokenize(String(n))[0];
    return createBasicNode(`#${nodeType}`, value);
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

// src/parts/parser.ts
function Parser() {
  return {
    parseFromString(htmlString) {
      const root = { nodeName: "#document", children: [] };
      if (!htmlString) return { root, tags: [], components: [] };
      const stack = [root];
      const components = /* @__PURE__ */ new Set();
      const tags = /* @__PURE__ */ new Set();
      tokenize(htmlString).forEach((token) => {
        const { nodeType, value, isSC } = token;
        const currentParent = stack[stack.length - 1];
        if (nodeType === "doctype") return;
        if (["text", "comment"].includes(nodeType)) {
          currentParent.children.push(
            {
              nodeName: `#${nodeType}`,
              nodeValue: value
            }
          );
          return;
        }
        const isClosing = value.startsWith("/");
        const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
        const tagNameLower = toLowerCase(tagName);
        const isSelfClosing = isSC || selfClosingTags.has(tagNameLower);
        (tagName[0] === toUpperCase(tagName[0]) || tagName.includes("-") ? components : tags).add(tagName);
        if (!isClosing) {
          const node = {
            tagName,
            nodeName: toUpperCase(tagName),
            attributes: getBaseAttributes(value),
            children: []
          };
          currentParent.children.push(node);
          !isSelfClosing && stack.push(node);
        } else if (!isSelfClosing && stack.length > 1) {
          stack.pop();
        }
      });
      return {
        root,
        components: Array.from(components),
        tags: Array.from(tags)
      };
    }
  };
}

// src/parts/dom-parser.ts
var DomParser = (config) => {
  if (config && !isObj(config)) {
    throw new Error(`${DOM_ERROR} 1st parameter is not an object.`);
  }
  let unsafeTags = /* @__PURE__ */ new Set();
  let unsafeTagDepth = 0;
  let unsafeAttrs = /* @__PURE__ */ new Set();
  const { filterTags, filterAttrs, onNodeCallback } = config || {};
  if (filterTags?.length) unsafeTags = new Set(filterTags);
  if (filterAttrs?.length) unsafeAttrs = new Set(filterAttrs);
  const getAttrOptions = { unsafeAttrs };
  return {
    parseFromString(htmlString) {
      if (htmlString && typeof htmlString !== "string") {
        throw new Error(`${DOM_ERROR} 1st parameter is not a string.`);
      }
      const root = createDocument();
      if (!htmlString) return { root, components: [], tags: [] };
      const stack = [root];
      const tagStack = [];
      const components = /* @__PURE__ */ new Set();
      const tags = /* @__PURE__ */ new Set();
      let newNode;
      tokenize(htmlString).forEach((token) => {
        const { nodeType, value, isSC } = token;
        if (nodeType === "doctype") {
          root.doctype = `<${value}>`;
          return;
        }
        const currentParent = stack[stack.length - 1];
        const isClosing = startsWith(value, "/");
        const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
        const isSelfClosing = isSC || selfClosingTags.has(tagName);
        if (nodeType === "tag" && !isSelfClosing) {
          if (!isClosing) {
            tagStack.push(tagName);
          } else {
            const expectedTag = tagStack.pop();
            if (expectedTag !== tagName) {
              if (expectedTag === void 0) {
                throw new Error(
                  `${DOM_ERROR} Mismatched closing tag: </${tagName}>. No open tag found.`
                );
              } else {
                throw new Error(
                  `${DOM_ERROR} Mismatched closing tag: </${tagName}>. Expected closing tag for <${expectedTag}>.`
                );
              }
            }
          }
        }
        if (unsafeTags.has(tagName)) {
          if (!isSelfClosing) {
            if (!isClosing) {
              unsafeTagDepth++;
            } else {
              unsafeTagDepth--;
            }
          }
          return;
        }
        if (unsafeTagDepth > 0) return;
        if (["text", "comment"].includes(nodeType)) {
          newNode = createBasicNode(
            `#${nodeType}`,
            value
          );
          currentParent.append(newNode);
          return;
        }
        (tagName[0] === toUpperCase(tagName[0]) || tagName.includes("-") ? components : tags).add(tagName);
        if (!isClosing) {
          const attributes = getAttributes(value, getAttrOptions);
          newNode = createElement.call(
            root,
            tagName,
            attributes
          );
          if (onNodeCallback) onNodeCallback(newNode, currentParent, root);
          const charset = attributes?.charset;
          if (tagName === "meta" && charset) {
            root.charset = toUpperCase(charset);
          }
          currentParent.append(newNode);
          !isSelfClosing && stack.push(newNode);
        } else if (!isSelfClosing && stack.length > 1) {
          stack.pop();
        }
      });
      if (tagStack.length > 0) {
        const unclosedTag = tagStack.pop();
        throw new Error(`${DOM_ERROR} Unclosed tag: <${unclosedTag}>.`);
      }
      return {
        root,
        components: Array.from(components),
        tags: Array.from(tags)
      };
    }
  };
};
export {
  ATTR_REGEX,
  DOM_ERROR,
  DomParser,
  Parser,
  charCodeAt,
  createBasicNode,
  createDocument,
  createElement,
  createNode,
  defineProperties,
  endsWith,
  escape,
  fromCharCode,
  getAttributes,
  getBaseAttributes,
  isNode,
  isObj,
  isPrimitive,
  isRoot,
  isTag,
  matchesSelector,
  selectorCache,
  selfClosingTags,
  startsWith,
  toLowerCase,
  toUpperCase,
  tokenize,
  trim
};
//# sourceMappingURL=index.mjs.map