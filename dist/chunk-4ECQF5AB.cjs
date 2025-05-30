"use strict";Object.defineProperty(exports, "__esModule", {value: true});





var _chunkCLVEXPEPcjs = require('./chunk-CLVEXPEP.cjs');

// src/parts/parser.ts
function Parser() {
  return {
    parseFromString(htmlString) {
      const root = { nodeName: "#document", children: [] };
      if (!htmlString) return { root, tags: [], components: [] };
      const stack = [root];
      const components = /* @__PURE__ */ new Set();
      const tags = /* @__PURE__ */ new Set();
      const tokens = _chunkCLVEXPEPcjs.tokenize.call(void 0, htmlString);
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
        const tagNameLower = _chunkCLVEXPEPcjs.toLowerCase.call(void 0, tagName);
        const isSelfClosing = isSC || _chunkCLVEXPEPcjs.selfClosingTags.has(tagNameLower);
        (tagName[0] === _chunkCLVEXPEPcjs.toUpperCase.call(void 0, tagName[0]) || tagName.includes("-") ? components : tags).add(tagName);
        if (!isClosing) {
          const node = {
            tagName,
            nodeName: _chunkCLVEXPEPcjs.toUpperCase.call(void 0, tagName),
            attributes: _chunkCLVEXPEPcjs.getBaseAttributes.call(void 0, value),
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



exports.Parser = Parser;
//# sourceMappingURL=chunk-4ECQF5AB.cjs.map