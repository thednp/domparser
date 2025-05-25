"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _chunkR4DWLBYHcjs = require('./chunk-R4DWLBYH.cjs');








var _chunkMYYMTVW7cjs = require('./chunk-MYYMTVW7.cjs');

// src/parts/dom-parser.ts
var DomParser = (config) => {
  if (config && !_chunkMYYMTVW7cjs.isObj.call(void 0, config)) {
    throw new Error(`${_chunkMYYMTVW7cjs.DOM_ERROR} 1st parameter is not an object.`);
  }
  let unsafeTags = /* @__PURE__ */ new Set();
  let unsafeTagDepth = 0;
  let unsafeAttrs = /* @__PURE__ */ new Set();
  const { filterTags, filterAttrs, onNodeCallback } = config || {};
  if (_optionalChain([filterTags, 'optionalAccess', _ => _.length])) unsafeTags = new Set(filterTags);
  if (_optionalChain([filterAttrs, 'optionalAccess', _2 => _2.length])) unsafeAttrs = new Set(filterAttrs);
  const getAttrOptions = { unsafeAttrs };
  return {
    parseFromString(htmlString) {
      if (htmlString && typeof htmlString !== "string") {
        throw new Error(`${_chunkMYYMTVW7cjs.DOM_ERROR} 1st parameter is not a string.`);
      }
      const root = _chunkR4DWLBYHcjs.createDocument.call(void 0, );
      if (!htmlString) return { root, components: [], tags: [] };
      const stack = [root];
      const tagStack = [];
      const components = /* @__PURE__ */ new Set();
      const tags = /* @__PURE__ */ new Set();
      const tokens = _chunkMYYMTVW7cjs.tokenize.call(void 0, htmlString);
      const tLen = tokens.length;
      let newNode;
      for (let i = 0; i < tLen; i += 1) {
        const { tokenType, value, isSC } = tokens[i];
        if (tokenType === "doctype") {
          root.doctype = `<${value}>`;
          continue;
        }
        const currentParent = stack[stack.length - 1];
        const isClosing = _chunkMYYMTVW7cjs.startsWith.call(void 0, value, "/");
        const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
        const isSelfClosing = isSC || _chunkMYYMTVW7cjs.selfClosingTags.has(tagName);
        if (tokenType === "tag" && !isSelfClosing) {
          if (!isClosing) {
            tagStack.push(tagName);
          } else {
            const expectedTag = tagStack.pop();
            if (expectedTag !== tagName) {
              if (expectedTag === void 0) {
                throw new Error(
                  `${_chunkMYYMTVW7cjs.DOM_ERROR} Mismatched closing tag: </${tagName}>. No open tag found.`
                );
              } else {
                throw new Error(
                  `${_chunkMYYMTVW7cjs.DOM_ERROR} Mismatched closing tag: </${tagName}>. Expected closing tag for <${expectedTag}>.`
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
          newNode = _chunkR4DWLBYHcjs.createBasicNode.call(void 0, 
            `#${tokenType}`,
            value
          );
          currentParent.append(newNode);
          continue;
        }
        (tagName[0] === _chunkMYYMTVW7cjs.toUpperCase.call(void 0, tagName[0]) || tagName.includes("-") ? components : tags).add(tagName);
        if (!isClosing) {
          const attributes = _chunkMYYMTVW7cjs.getAttributes.call(void 0, value, getAttrOptions);
          newNode = _chunkR4DWLBYHcjs.createElement.call(
            root,
            tagName,
            attributes
          );
          currentParent.append(newNode);
          stack.slice(1, -1).map(
            (parent) => parent.registerChild(newNode)
          );
          if (onNodeCallback) onNodeCallback(newNode, currentParent, root);
          const charset = _optionalChain([attributes, 'optionalAccess', _3 => _3.charset]);
          if (tagName === "meta" && charset) {
            root.charset = _chunkMYYMTVW7cjs.toUpperCase.call(void 0, charset);
          }
          !isSelfClosing && stack.push(newNode);
        } else if (!isSelfClosing && stack.length > 1) {
          stack.pop();
        }
      }
      if (tagStack.length > 0) {
        const unclosedTag = tagStack.pop();
        throw new Error(`${_chunkMYYMTVW7cjs.DOM_ERROR} Unclosed tag: <${unclosedTag}>.`);
      }
      return {
        root,
        components: Array.from(components),
        tags: Array.from(tags)
      };
    }
  };
};



exports.DomParser = DomParser;
//# sourceMappingURL=chunk-YV3WSZTX.cjs.map