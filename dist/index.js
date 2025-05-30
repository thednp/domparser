"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/parts/util.ts
  var ATTR_REGEX = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
  var getBaseAttributes = (token) => {
    const attrs = {};
    const [tagName, ...parts] = token.split(/\s+/);
    if (parts.length < 1) return attrs;
    const attrStr = token.slice(tagName.length);
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
    "?xml",
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
      return "";
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
  var DOM_ERROR = "DomParserError:";
  var DEFAULT_CHUNK_SIZE = 64 * 1024;
  var DEFAULT_MAX_SCRIPT_SIZE = 128 * 1024;
  var tokenize = (html, options = {}) => {
    const {
      maxScriptSize = DEFAULT_MAX_SCRIPT_SIZE,
      chunkSize = DEFAULT_CHUNK_SIZE
    } = options;
    const specialTags = ["script", "style"];
    const tokens = [];
    const len = html.length;
    const COM_START = ["!--", "![CDATA["];
    const COM_END = ["--", "]]"];
    let COM_TYPE = 0;
    let token = "";
    let scriptContent = "";
    let inTag = false;
    let inQuote = false;
    let quote = 0;
    let inPre = false;
    let inTemplate = false;
    let inComment = false;
    let inStyleScript = false;
    let currentChunkStart = 0;
    while (currentChunkStart < len) {
      const chunkEnd = Math.min(currentChunkStart + chunkSize, len);
      const chunk = html.slice(currentChunkStart, chunkEnd);
      for (let i = 0; i < chunk.length; i++) {
        const globalIndex = currentChunkStart + i;
        const char = charCodeAt(chunk, i);
        if (inStyleScript) {
          const endSpecialTag = specialTags.find(
            (t) => startsWith(html, `/${t}`, globalIndex + 1)
          );
          if (char === 60 && endSpecialTag && !inTemplate && !inQuote) {
            if (scriptContent.length < maxScriptSize) {
              tokens.push({
                tokenType: "text",
                value: trim(scriptContent),
                isSC: false
              });
            }
            tokens.push({
              tokenType: "tag",
              value: "/" + endSpecialTag,
              isSC: false
            });
            scriptContent = "";
            inStyleScript = false;
            i += endSpecialTag.length + 2;
          } else {
            if (scriptContent.length >= maxScriptSize) {
              continue;
            }
            if (char === 96) {
              inTemplate = !inTemplate;
            } else if (!inTemplate && (char === 34 || char === 39)) {
              if (!inQuote) {
                quote = char;
                inQuote = true;
              } else if (char === quote) {
                inQuote = false;
              }
            }
            scriptContent += fromCharCode(char);
          }
          continue;
        }
        if (inComment) {
          token += fromCharCode(char);
          if (endsWith(token, COM_END[COM_TYPE]) && charCodeAt(html, globalIndex + 1) === 62) {
            const tokenValue = COM_TYPE === 1 ? escape(token) : token;
            tokens.push({
              tokenType: "comment",
              value: `<${trim(tokenValue)}>`,
              isSC: false
            });
            inComment = false;
            token = "";
            i += 1;
          }
          continue;
        }
        if (inTag && token.includes("=") && (char === 34 || char === 39)) {
          if (!inQuote) {
            quote = char;
            inQuote = true;
          } else if (char === quote) {
            inQuote = false;
          }
          token += fromCharCode(char);
          continue;
        }
        if (char === 60 && !inQuote && !inTemplate) {
          const value = trim(token);
          value && tokens.push({
            tokenType: "text",
            value: inPre ? token : value,
            isSC: false
          });
          token = "";
          const commentStart = COM_START.find(
            (cs) => startsWith(html, cs, globalIndex + 1)
          );
          if (commentStart) {
            COM_TYPE = COM_START.indexOf(commentStart);
            inComment = true;
            token += commentStart;
            i += commentStart.length;
            continue;
          }
          inTag = true;
        } else if (char === 62 && inTag && !inTemplate) {
          if (token === "/pre") {
            inPre = false;
          } else if (token === "pre" || startsWith(token, "pre")) {
            inPre = true;
          }
          const startSpecialTag = specialTags.find(
            (t) => t === token || startsWith(token, t)
          );
          if (startSpecialTag && !endsWith(token, "/")) {
            inStyleScript = true;
          }
          const isDocType = startsWith(toLowerCase(token), "!doctype");
          if (token) {
            const isSC = endsWith(token, "/");
            const [tagName] = token.split(/\s/);
            const value = inQuote ? tagName + (isSC ? "/" : "") : token;
            tokens.push({
              tokenType: isDocType ? "doctype" : "tag",
              value: isSC ? trim(value.slice(0, -1)) : trim(value),
              isSC
            });
          }
          token = "";
          inTag = false;
          inQuote = false;
        } else {
          token += fromCharCode(char);
        }
      }
      currentChunkStart = chunkEnd;
    }
    const lastToken = trim(token);
    if (lastToken) {
      tokens.push({
        tokenType: "text",
        value: lastToken,
        isSC: false
      });
    }
    return tokens;
  };

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
    const { childNodes, nodeName } = node;
    if (nodeName === "BR") return "\n";
    if (!childNodes.length) return "";
    const hasTagChild = childNodes.some(isTag);
    return childNodes.map((n) => isTag(n) ? textContent(n) : n.nodeValue).join(
      hasTagChild ? "\n" : ""
    );
  };
  var innerHTML = (node, depth = 0) => {
    const { childNodes: childContents } = node;
    const childNodes = childContents.filter((c) => c.nodeName !== "#comment");
    if (!childNodes.length) return "";
    const childIsText = childNodes.length === 1 && !isTag(childNodes[0]);
    const space = depth && !childIsText ? "  ".repeat(depth) : "";
    return childNodes.map((n) => isTag(n) ? outerHTML(n, depth) : space + n.nodeValue).join("\n");
  };
  var outerHTML = (node, depth = 0) => {
    const { attributes, tagName, childNodes: childContents } = node;
    const childNodes = childContents.filter((c) => c.nodeName !== "#comment");
    const space = depth ? "  ".repeat(depth) : "";
    const hasChildren = childNodes.length > 0;
    const childIsText = childNodes.length === 1 && !isTag(childNodes[0]);
    const hasAttributes = attributes.size > 0;
    const isSelfClosing = selfClosingTags.has(tagName);
    const attrStr = hasAttributes ? " " + Array.from(attributes).map(([key, val]) => `${key}="${trim(val)}"`).join(" ") : "";
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

  // src/parts/parser.ts
  function Parser() {
    return {
      parseFromString(htmlString) {
        const root = { nodeName: "#document", children: [] };
        if (!htmlString) return { root, tags: [], components: [] };
        const stack = [root];
        const components = /* @__PURE__ */ new Set();
        const tags = /* @__PURE__ */ new Set();
        const tokens = tokenize(htmlString);
        const tLen = tokens.length;
        for (let i = 0; i < tLen; i += 1) {
          const { tokenType, value, isSC } = tokens[i];
          const currentParent = stack[stack.length - 1];
          if (tokenType === "doctype") continue;
          if (["text", "comment"].includes(tokenType)) {
            currentParent.children.push(
              {
                nodeName: `#${tokenType}`,
                nodeValue: value
              }
            );
            continue;
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
        }
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
        const tokens = tokenize(htmlString);
        const tLen = tokens.length;
        let newNode;
        for (let i = 0; i < tLen; i += 1) {
          const { tokenType, value, isSC } = tokens[i];
          if (tokenType === "doctype") {
            root.doctype = `<${value}>`;
            continue;
          }
          const currentParent = stack[stack.length - 1];
          const isClosing = startsWith(value, "/");
          const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
          const isSelfClosing = isSC || selfClosingTags.has(tagName);
          if (tokenType === "tag" && !isSelfClosing) {
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
            continue;
          }
          if (unsafeTagDepth > 0) continue;
          if (["text", "comment"].includes(tokenType)) {
            newNode = createBasicNode(
              `#${tokenType}`,
              value
            );
            currentParent.append(newNode);
            continue;
          }
          (tagName[0] === toUpperCase(tagName[0]) || tagName.includes("-") ? components : tags).add(tagName);
          if (!isClosing) {
            const attributes = getAttributes(value, getAttrOptions);
            newNode = createElement.call(
              root,
              tagName,
              attributes
            );
            currentParent.append(newNode);
            stack.slice(1, -1).map(
              (parent) => parent.registerChild(newNode)
            );
            if (onNodeCallback) onNodeCallback(newNode, currentParent, root);
            const charset = attributes?.charset;
            if (tagName === "meta" && charset) {
              root.charset = toUpperCase(charset);
            }
            !isSelfClosing && stack.push(newNode);
          } else if (!isSelfClosing && stack.length > 1) {
            stack.pop();
          }
        }
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
})();
//# sourceMappingURL=index.js.map