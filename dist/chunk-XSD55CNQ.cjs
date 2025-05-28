"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _chunkRMHPSCGUcjs = require('./chunk-RMHPSCGU.cjs');








var _chunkCLVEXPEPcjs = require('./chunk-CLVEXPEP.cjs');

// src/parts/dom-parser.ts
var DomParser = (config) => {
  if (config && !_chunkCLVEXPEPcjs.isObj.call(void 0, config)) {
    throw new Error(`${_chunkCLVEXPEPcjs.DOM_ERROR} 1st parameter is not an object.`);
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
        throw new Error(`${_chunkCLVEXPEPcjs.DOM_ERROR} 1st parameter is not a string.`);
      }
      const root = _chunkRMHPSCGUcjs.createDocument.call(void 0, );
      if (!htmlString) return { root, components: [], tags: [] };
      const stack = [root];
      const tagStack = [];
      const components = /* @__PURE__ */ new Set();
      const tags = /* @__PURE__ */ new Set();
      const tokens = _chunkCLVEXPEPcjs.tokenize.call(void 0, htmlString);
      const tLen = tokens.length;
      let newNode;
      for (let i = 0; i < tLen; i += 1) {
        const { tokenType, value, isSC } = tokens[i];
        if (tokenType === "doctype") {
          root.doctype = `<${value}>`;
          continue;
        }
        const currentParent = stack[stack.length - 1];
        const isClosing = _chunkCLVEXPEPcjs.startsWith.call(void 0, value, "/");
        const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
        const isSelfClosing = isSC || _chunkCLVEXPEPcjs.selfClosingTags.has(tagName);
        if (tokenType === "tag" && !isSelfClosing) {
          if (!isClosing) {
            tagStack.push(tagName);
          } else {
            const expectedTag = tagStack.pop();
            if (expectedTag !== tagName) {
              if (expectedTag === void 0) {
                throw new Error(
                  `${_chunkCLVEXPEPcjs.DOM_ERROR} Mismatched closing tag: </${tagName}>. No open tag found.`
                );
              } else {
                throw new Error(
                  `${_chunkCLVEXPEPcjs.DOM_ERROR} Mismatched closing tag: </${tagName}>. Expected closing tag for <${expectedTag}>.`
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
          newNode = _chunkRMHPSCGUcjs.createBasicNode.call(void 0, 
            `#${tokenType}`,
            value
          );
          currentParent.append(newNode);
          continue;
        }
        (tagName[0] === _chunkCLVEXPEPcjs.toUpperCase.call(void 0, tagName[0]) || tagName.includes("-") ? components : tags).add(tagName);
        if (!isClosing) {
          const attributes = _chunkCLVEXPEPcjs.getAttributes.call(void 0, value, getAttrOptions);
          newNode = _chunkRMHPSCGUcjs.createElement.call(
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
            root.charset = _chunkCLVEXPEPcjs.toUpperCase.call(void 0, charset);
          }
          !isSelfClosing && stack.push(newNode);
        } else if (!isSelfClosing && stack.length > 1) {
          stack.pop();
        }
      }
      if (tagStack.length > 0) {
        const unclosedTag = tagStack.pop();
        throw new Error(`${_chunkCLVEXPEPcjs.DOM_ERROR} Unclosed tag: <${unclosedTag}>.`);
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
//# sourceMappingURL=chunk-XSD55CNQ.cjs.map