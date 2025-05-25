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
    Parser: () => Parser
  });

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
  var toLowerCase = (str) => str.toLowerCase();
  var toUpperCase = (str) => str.toUpperCase();
  var startsWith = (str, prefix, position) => str.startsWith(prefix, position);
  var endsWith = (str, suffix, position) => str.endsWith(suffix, position);
  var fromCharCode = (char) => String.fromCharCode(char);
  var charCodeAt = (str, index) => str.charCodeAt(index);
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
    let token = "";
    let scriptContent = "";
    let inTag = false;
    let inQuote = false;
    let quote = 0;
    let inTemplate = false;
    let inComment = false;
    let inCDATA = false;
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
          if (endsWith(token, "--") && charCodeAt(html, globalIndex + 1) === 62) {
            tokens.push({
              tokenType: "comment",
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
          if (endsWith(token, "]]") && charCodeAt(html, globalIndex + 1) === 62) {
            tokens.push({
              tokenType: "text",
              value: `<${escape(trim(token))}>`,
              isSC: false
            });
            inCDATA = false;
            token = "";
            i += 1;
          }
          continue;
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
            tokenType: "text",
            value: trim(token),
            isSC: false
          });
          token = "";
          inTag = true;
          if (startsWith(chunk, "!--", i + 1)) {
            inComment = true;
            token += "!--";
            i += 3;
            continue;
          }
          if (startsWith(chunk, "![CDATA[", i + 1)) {
            inCDATA = true;
            token += "![CDATA[";
            i += 8;
            continue;
          }
        } else if (char === 62 && inTag && !inTemplate && !inComment && !inStyleScript && !inCDATA) {
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
  return __toCommonJS(parser_exports);
})();
//# sourceMappingURL=parser.js.map