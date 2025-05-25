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
      if (char === 60 && !inQuote && !inTemplate && !inStyleScript && !inCDATA && !inComment) {
        trim(token) && tokens.push({
          tokenType: "text",
          value: trim(token),
          isSC: false
        });
        token = "";
        if (startsWith(html, "!--", globalIndex + 1)) {
          inComment = true;
          token += "!--";
          i += 3;
          continue;
        }
        if (startsWith(html, "![CDATA[", globalIndex + 1)) {
          inCDATA = true;
          token += "![CDATA[";
          i += 8;
          continue;
        }
        inTag = true;
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

export {
  __publicField,
  ATTR_REGEX,
  getBaseAttributes,
  getAttributes,
  toLowerCase,
  toUpperCase,
  startsWith,
  endsWith,
  fromCharCode,
  charCodeAt,
  defineProperties,
  isObj,
  isRoot,
  isTag,
  isNode,
  isPrimitive,
  trim,
  selfClosingTags,
  escape,
  DOM_ERROR,
  tokenize
};
//# sourceMappingURL=chunk-ZHY3EYQX.mjs.map