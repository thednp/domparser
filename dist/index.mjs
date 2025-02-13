// src/parts/util.ts
var toLowerCase = (str) => str.toLowerCase();
var toUpperCase = (str) => str.toUpperCase();
var startsWith = (str, prefix) => str.startsWith(prefix);
var endsWith = (str, suffix) => str.endsWith(suffix);
var fromCharCode = (char) => String.fromCharCode(char);
var charCodeAt = (str, index) => str.charCodeAt(index);
var defineProperties = (obj, props) => Object.defineProperties(obj, props);
var isObj = (node) => node !== null && typeof node === "object";
var isRoot = (node) => isObj(node) && isNode(node) && node.nodeName === "#document";
var isTag = (node) => isObj(node) && "tagName" in node;
var isNode = (node) => isObj(node) && "nodeName" in node;
var isPrimitive = (val) => typeof val === "string" || typeof val === "number";
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
var DOM_ERROR = "DomError:";
var PARSER_ERROR = "ParserError:";

// src/parts/sanitize.ts
var encodeEntities = (str) => str.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[char] || /* istanbul ignore next @preserve */
char);
var sanitizeUrl = (url) => {
  const decoded = decodeURIComponent(url.trim());
  if (/^(?:javascript|data|vbscript):/i.test(decoded)) return "";
  return encodeEntities(decoded);
};
var sanitizeAttrValue = (attrName, initialValue) => {
  if (!initialValue) return "";
  const name = toLowerCase(attrName);
  const value = initialValue.trim();
  if (name === "src" || name === "href" || name === "action" || name === "formaction" || endsWith(name, "url")) {
    return sanitizeUrl(value);
  }
  return encodeEntities(value);
};

// src/parts/parser.ts
var getAttributes = (tagStr, config) => {
  const { sanitizeFn, unsafeAttrs } = config || {};
  const attrs = {};
  const parts = tagStr.split(/\s+/);
  if (parts.length < 2) return attrs;
  const attrStr = tagStr.slice(parts[0].length);
  const attrRegex = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
  let match;
  while (match = attrRegex.exec(attrStr)) {
    const [, name, d, s, u] = match;
    const value = d ?? s ?? u ?? "";
    if (name && name !== "/" && !unsafeAttrs?.has(toLowerCase(name))) {
      attrs[name] = sanitizeFn ? sanitizeFn(toLowerCase(name), value) : value;
    }
  }
  return attrs;
};
var tokenize = (html) => {
  const tokens = [];
  let token = "", inTag = false, inQuote = false, quote = 0, isComment = false;
  for (let i = 0; i < html.length; i++) {
    const char = charCodeAt(html, i);
    if (isComment) {
      token += fromCharCode(char);
      if (endsWith(token, "--")) {
        if (charCodeAt(html, i + 1) === 62) {
          tokens.push({
            nodeType: "comment",
            value: token.trim(),
            isSC: false
          });
          token = "";
          isComment = false;
          i++;
        }
      }
      continue;
    }
    if (inTag && (char === 34 || char === 39)) {
      if (!inQuote) {
        quote = char;
        inQuote = true;
      } else if (char === quote) inQuote = false;
      token += fromCharCode(char);
      continue;
    }
    if (char === 60 && !inQuote) {
      token.trim() && tokens.push({
        nodeType: "text",
        // value: encodeEntities(token.trim()),
        value: token.trim(),
        isSC: false
      });
      token = "";
      inTag = true;
      if (charCodeAt(html, i + 1) === 33 && charCodeAt(html, i + 2) === 45 && charCodeAt(html, i + 3) === 45) {
        isComment = true;
        token += "!--";
        i += 3;
        continue;
      }
    } else if (char === 62 && !inQuote && inTag && !isComment) {
      if (token) {
        const isSC = endsWith(token, "/");
        const isDocType = startsWith(token, "!doctype");
        tokens.push({
          nodeType: isDocType ? "doctype" : "tag",
          value: isSC ? token.slice(0, -1).trim() : token.trim(),
          isSC
        });
      }
      token = "";
      inTag = false;
    } else {
      token += fromCharCode(char);
    }
  }
  token.trim() && tokens.push({
    nodeType: "text",
    // value: encodeEntities(token.trim()),
    value: token.trim(),
    isSC: false
  });
  return tokens;
};
function Parser(config = {}) {
  let unsafeTags = /* @__PURE__ */ new Set();
  let unsafeAttrs = /* @__PURE__ */ new Set();
  const { filterTags, filterAttrs, onNodeCallback, sanitizeFn } = config;
  if (filterTags?.length) unsafeTags = new Set(filterTags);
  if (filterAttrs?.length) unsafeAttrs = new Set(filterAttrs);
  const getAttrOptions = { unsafeAttrs };
  if (typeof sanitizeFn === "function") getAttrOptions.sanitizeFn = sanitizeFn;
  return {
    parseFromString(htmlString) {
      const root = {
        nodeName: "#document",
        childNodes: [],
        children: [],
        all: []
      };
      if (!htmlString) return { root, components: [], tags: [] };
      const stack = [root];
      const tagStack = [];
      const components = /* @__PURE__ */ new Set();
      const tags = /* @__PURE__ */ new Set();
      let parentIsSafe = true;
      let newNode;
      const append = (node, parent) => {
        if (onNodeCallback) {
          onNodeCallback(node, parent, root);
        } else {
          if (isTag(node)) {
            parent.children.push(node);
            root.all.push(node);
          }
          parent.childNodes.push(node);
        }
      };
      tokenize(htmlString).forEach((token) => {
        const { nodeType, value, isSC } = token;
        if (nodeType === "doctype") {
          root.doctype = `<${value}>`;
          return;
        }
        const currentParent = stack[stack.length - 1];
        if (["text", "comment"].includes(nodeType)) {
          newNode = {
            nodeName: `#${nodeType}`,
            nodeValue: nodeType === "text" ? value : `<${value}>`
          };
          append(newNode, currentParent);
          return;
        }
        const isClosing = startsWith(value, "/");
        const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
        const tagNameLower = toLowerCase(tagName);
        const isSelfClosing = isSC || selfClosingTags.has(tagNameLower);
        if (!isSelfClosing) {
          if (!isClosing) {
            tagStack.push(tagName);
          } else {
            const expectedTag = tagStack.pop();
            if (expectedTag !== tagName) {
              if (expectedTag === void 0) {
                throw new Error(
                  `ParserError: Mismatched closing tag: </${tagName}>. No open tag found.`
                );
              } else {
                throw new Error(
                  `ParserError: Mismatched closing tag: </${tagName}>. Expected closing tag for <${expectedTag}>.`
                );
              }
            }
          }
        }
        if (unsafeTags.has(tagNameLower)) {
          if (isClosing) {
            parentIsSafe = true;
          } else {
            parentIsSafe = false;
          }
          return;
        }
        if (!parentIsSafe) return;
        (tagName[0] === toUpperCase(tagName[0]) || tagName.includes("-") ? components : tags).add(tagName);
        if (!isClosing) {
          newNode = {
            tagName,
            nodeName: toUpperCase(tagName),
            attributes: getAttributes(value, getAttrOptions),
            children: [],
            childNodes: []
          };
          const charset = newNode.attributes?.charset;
          if (tagName === "meta" && charset) {
            root.charset = toUpperCase(charset);
          }
          append(newNode, currentParent);
          !isSelfClosing && stack.push(newNode);
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

// src/parts/selectors.ts
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
  const selectors = selector.split(",").map((s) => s.trim());
  return selectors.some(
    (simpleSelector) => matchesSingleSelector(node, simpleSelector)
  );
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
  return childNodes.map(
    (n) => isTag(n) ? outerHTML(n, depth) : space + n.nodeValue
  ).join("\n");
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
    nodeValue: nodeName === "#comment" ? `<!-- ${text} -->` : text
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
          innerText: {
            enumerable: false,
            get: () => textContent(child)
          },
          textContent: {
            enumerable: false,
            get: () => textContent(child)
          },
          // Add node relationship properties
          parentNode: {
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
    return createBasicNode(`#${nodeType}`, value.replace(/!--|--/g, "").trim());
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
    tagName.toUpperCase(),
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
var addDomPrototype = (node, ownerDocument) => {
  if (isTag(node)) {
    const { tagName, attributes, childNodes } = node;
    const newNode = createElement.call(
      ownerDocument,
      tagName,
      attributes
    );
    newNode.append(...childNodes);
    return Object.assign(node, newNode);
  } else {
    const { nodeName, nodeValue } = node;
    return Object.assign(node, {
      ...createBasicNode(nodeName, nodeValue)
    });
  }
};
var createDocument = () => createNode.call(null, "#document");

// src/parts/dom.ts
var Dom = (startHTML = void 0, config = {}) => {
  if (startHTML && typeof startHTML !== "string") {
    throw new Error(`${DOM_ERROR} 1st parameter is not a string.`);
  }
  if (config && !isObj(config)) {
    throw new Error(`${DOM_ERROR} 2nd parameter is not an object.`);
  }
  const { onNodeCallback: callback, ...rest } = config;
  const rootNode = createDocument();
  const defaultOpts = {
    onNodeCallback: (node, parent) => {
      if (typeof callback === "function") {
        callback(node, parent, rootNode);
      }
      const child = addDomPrototype(node, rootNode);
      const currentParent = isRoot(parent) ? rootNode : parent;
      currentParent.append(child);
      return child;
    },
    sanitizeFn: sanitizeAttrValue,
    filterTags: [],
    filterAttrs: []
  };
  const options = Object.assign({}, defaultOpts, rest);
  const { root: { charset, doctype } } = Parser(options).parseFromString(startHTML);
  Object.assign(rootNode, { charset, doctype });
  return rootNode;
};
export {
  DOM_ERROR,
  Dom,
  PARSER_ERROR,
  Parser,
  addDomPrototype,
  charCodeAt,
  createBasicNode,
  createDocument,
  createElement,
  createNode,
  defineProperties,
  encodeEntities,
  endsWith,
  fromCharCode,
  getAttributes,
  isNode,
  isObj,
  isPrimitive,
  isRoot,
  isTag,
  matchesSelector,
  sanitizeAttrValue,
  sanitizeUrl,
  selfClosingTags,
  startsWith,
  toLowerCase,
  toUpperCase,
  tokenize
};
//# sourceMappingURL=index.mjs.map