import {
  createBasicNode,
  createDocument,
  createElement
} from "./chunk-JA6OOB2C.mjs";
import {
  DOM_ERROR,
  getAttributes,
  isObj,
  selfClosingTags,
  startsWith,
  toUpperCase,
  tokenize
} from "./chunk-ZHY3EYQX.mjs";

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

export {
  DomParser
};
//# sourceMappingURL=chunk-6LMD6C3R.mjs.map