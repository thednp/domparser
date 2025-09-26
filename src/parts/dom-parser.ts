// dom-parser.ts
import { createBasicNode, createDocument, createElement } from "./prototype";
import type {
  ChildNode,
  DOMNode,
  DomParserOptions,
  DomParserResult,
  GetAttributesOptions,
  RootNode,
} from "./types";

import {
  DOM_ERROR,
  getAttributes,
  isObj,
  selfClosingTags,
  startsWith,
  tokenize,
  toUpperCase,
} from "./util";

/**
 * **DomParser**
 *
 * Unlike the basic **Parser**, **DomParser** creates a new `Document` like instance with DOM-like
 * methods and properties and populates it with `Node` like objects resulted from the parsing
 * of a given HTML markup.
 *
 * @example
 * ```ts
 * const config = {
 *   // On creating new node callback function
 *   onNodeCallback?: myFunction(node: DOMNode) => DOMNode | YOURNode,
 *   // Common dangerous tags that could lead to XSS attacks
 *   filterTags: [
 *     "script", "style", "iframe", "object", "embed", "base", "form",
 *     "input", "button", "textarea", "select", "option"
 *   ],
 *   // Unsafe attributes that could lead to XSS attacks
 *   filterAttrs: [
 *     "onerror", "onload", "onunload", "onclick", "ondblclick", "onmousedown",
 *     "onmouseup", "onmouseover", "onmousemove", "onmouseout", "onkeydown",
 *     "onkeypress", "onkeyup", "onchange", "onsubmit", "onreset", "onselect",
 *     "onblur", "onfocus", "formaction", "href", "xlink:href", "action"
 *   ]
 * }
 * const { root: doc, components, tags } = DomParser.parseFromString("<!doctype html><html>This is starting html</html>", config);
 * console.log(doc.documentElement.outerHTML);
 * // > "<html>This is starting html</html>"
 * ```
 *
 * @param startHTML Initial HTML content
 * @param config the `Parser` options to apply to the parsing of the startHTML markup.
 * @returns The `Document` like root node
 */
export const DomParser = (
  config?: Partial<DomParserOptions>,
) => {
  if (config && !isObj(config)) {
    throw new Error(`${DOM_ERROR} 1st parameter is not an object.`);
  }

  // Common dangerous tags that could lead to XSS
  let unsafeTags = new Set<string>();
  let unsafeTagDepth = 0;

  // Unsafe attributes that could lead to XSS
  let unsafeAttrs = new Set<string>();

  // Apply config
  const { filterTags, filterAttrs, onNodeCallback } = config || {};
  if (filterTags?.length) unsafeTags = new Set(filterTags);
  if (filterAttrs?.length) unsafeAttrs = new Set(filterAttrs);
  const getAttrOptions = { unsafeAttrs } as GetAttributesOptions;
  // don't override the default function unless it's actualy set

  return {
    parseFromString(htmlString?: string) {
      if (htmlString && typeof htmlString !== "string") {
        throw new Error(`${DOM_ERROR} 1st parameter is not a string.`);
      }
      const root = createDocument();
      if (!htmlString) return { root, components: [], tags: [] };

      const stack: (RootNode | DOMNode)[] = [root];
      const tagStack: string[] = [];
      const components = new Set<string>();
      const tags = new Set<string>();
      const tokens = tokenize(htmlString);
      const tLen = tokens.length;
      let newNode: ChildNode;

      for (let i = 0; i < tLen; i += 1) {
        const { tokenType, value, isSC } = tokens[i];

        // Skip doctype, but store it as a root property
        if (tokenType === "doctype") {
          root.doctype = `<${value}>`;
          continue;
        }

        const currentParent = stack[stack.length - 1];
        const isClosing = startsWith(value, "/");
        const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
        const isSelfClosing = isSC || selfClosingTags.has(tagName);

        // Tag Matching Detection Logic
        if (tokenType === "tag" && !isSelfClosing) {
          // Start Tag (and not self-closing)
          if (!isClosing) {
            // Push tag name onto the tag stack
            tagStack.push(tagName);
            // Closing Tag
          } else {
            // Pop the last opened tag
            const expectedTag = tagStack.pop();
            if (expectedTag !== tagName) {
              if (expectedTag === undefined) {
                throw new Error(
                  `${DOM_ERROR} Mismatched closing tag: </${tagName}>. No open tag found.`,
                );
              } else {
                throw new Error(
                  `${DOM_ERROR} Mismatched closing tag: </${tagName}>. Expected closing tag for <${expectedTag}>.`,
                );
              }
            }
          }
        }

        // Skip unsafe tags AND their children
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

        // Don't process anything while inside unsafe tags
        if (unsafeTagDepth > 0) continue;

        if (["text", "comment"].includes(tokenType)) {
          newNode = createBasicNode(
            `#${tokenType as "text" | "comment"}`,
            value,
          ) as ChildNode;
          currentParent.append(newNode);
          continue;
        }

        // Register tag/component type
        (tagName[0] === toUpperCase(tagName[0]) || tagName.includes("-")
          ? components
          : tags).add(tagName);

        if (!isClosing) {
          const attributes = getAttributes(value, getAttrOptions);
          newNode = createElement.call(
            root,
            tagName as DOMNode["tagName"],
            attributes,
          );
          currentParent.append(newNode);
          stack.slice(1, -1).map((parent) =>
            (parent as DOMNode).registerChild(newNode as DOMNode)
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

      // Check for unclosed tags at the end
      // an edge case where end tag is malformed `</incomplete`
      if (tagStack.length > 0) {
        const unclosedTag = tagStack.pop();
        throw new Error(`${DOM_ERROR} Unclosed tag: <${unclosedTag}>.`);
      }

      return {
        root,
        components: Array.from(components),
        tags: Array.from(tags),
      } satisfies DomParserResult;
    },
  };
};
