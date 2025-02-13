"use strict";
var DOM = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/parts/parser.ts
  var parser_exports = {};
  __export(parser_exports, {
    Parser: () => Parser,
    getAttributes: () => getAttributes,
    tokenize: () => tokenize
  });

  // src/parts/util.ts
  var toLowerCase = (str) => str.toLowerCase();
  var toUpperCase = (str) => str.toUpperCase();
  var startsWith = (str, prefix) => str.startsWith(prefix);
  var endsWith = (str, suffix) => str.endsWith(suffix);
  var fromCharCode = (char) => String.fromCharCode(char);
  var charCodeAt = (str, index) => str.charCodeAt(index);
  var isObj = (node) => node !== null && typeof node === "object";
  var isTag = (node) => isObj(node) && "tagName" in node;
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
  return __toCommonJS(parser_exports);
})();
//# sourceMappingURL=parser.js.map