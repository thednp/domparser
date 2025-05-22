"use strict";
var Parser = (() => {
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
  return __toCommonJS(parser_exports);
})();
//# sourceMappingURL=parser.js.map