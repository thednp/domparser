// dom.ts
import { createBasicNode, createDocument, createElement } from "./prototype.ts";
import { DOM_ERROR, isObj } from "./util.ts";
import type {
  ChildNode,
  DomParserOptions,
  DomParserResult,
  RootNode,
} from "./types.ts";

import type { DOMNode, GetAttributesOptions } from "./types.ts";

import {
  getAttributes,
  selfClosingTags,
  startsWith,
  toUpperCase,
} from "./util.ts";

import { tokenize } from "./util.ts";

/**
 * **DomParser**
 *
 * Unlike the basic **Parser**, **DomParser** creates a new `Document` like instance with DOM-like
 * methods and properties and populates it with `Node` like objects resulted from the parsing
 * of a given HTML markup.
 *
 * **Features**
 * * The **DomParser** is ~2Kb gZipped and has additional features compared to the basic **Parser**.
 * * It handles basic HTML elements, custom elements, UI frameworks components,
 * special attributes, and text and comment nodes.
 * * It allows you to filter tags and unsafe attributes; _by default the filters are empty_.
 *
 * The DOM representation is a plain object with the following structure:
 * ```ts
 *  type TextNode = {
 *   nodeName: "#text";
 *   ownerDocument: RootNode;
 *   parentNode: RootNode | DOMNode;
 *   textContent: string;
 *   nodeValue: string;
 *   remove: () => void;
 * };
 *  type DOMNode = {
 *   tagName: string;
 *   nodeName: string;
 *   textContent: string;
 *   innerHTML: string;
 *   outerHTML: string;
 *   attributes: Map<string, string>;
 *   hasAttribute: (attrName: string) => boolean;
 *   getAttribute: (attrName: string) => string;
 *   setAttribute: (attrName: string, attrValue: string) => void;
 *   hasAttributeNS: (ns: string, attrName: string) => boolean;
 *   getAttributeNS: (ns: string, attrName: string) => string;
 *   setAttributeNS: (ns: string, attrName: string, attrValue: string) => void;
 *   remove: () => void;
 *   cleanup: () => void;
 *   removeChild: (childNode: DOMNode | TextNode | CommentNode) => void;
 *   append: (childNode: DOMNode | TextNode | CommentNode) => void;
 *   replaceChildren: (...newChildren: DOMNode[]) => void;
 *   children: DOMNode[];
 *   childNodes: (DOMNode | TextNode | CommentNode)[];
 *   contains: (childNode: DOMNode) => boolean;
 *   matches: (selector: string) => boolean;
 *   closest: (selector: string) => DOMNode | null;
 *   ownerDocument: RootNode;
 *   parentNode: RootNode | DOMNode;
 *   querySelector: (selector: string) => DOMNode | null;
 *   querySelectorAll: (selector: string) => DOMNode[];
 *   getElementsByClassName: (className: string) => DOMNode[];
 *   getElementsByTagName: (tagName: string) => DOMNode[];
 * };
 *
 *  // this is the return of DomParser()
 *  type RootNode = {
 *   nodeName: string;
 *   doctype?: string;
 *   charset?: string;
 *   documentElement: DOMNode | null;
 *   head: DOMNode | null;
 *   body: DOMNode | null;
 *   all: DOMNode[];
 *   children: DOMNode[];
 *   childNodes: (DOMNode | TextNode | CommentNode)[];
 *   createElement: (tagName: string, first: Attributes | DOMNode, ...childNodes: (DOMNode | TextNode)[]);
 *   createElementNS: (ns: string, tagName: string, first: Attributes | DOMNode, ...childNodes: (DOMNode | TextNode)[]);
 *   createTextNode: (content: string) => TextNode;
 *   createComment: (content: string) => CommentNode;
 *   cleanup: () => void;
 *   removeChild: (childNode: DOMNode | TextNode | CommentNode) => void;
 *   replaceChildren: (...newChildren: DOMNode[]) => void;
 *   append: (childNode: DOMNode | TextNode | CommentNode) => void;
 *   contains: (childNode: DOMNode) => boolean;
 *   getElementById: (id: string) => DOMNode | null;
 *   querySelector: (selector: string) => DOMNode | null;
 *   querySelectorAll: (selector: string) => DOMNode[];
 *   getElementsByClassName: (className: string) => DOMNode[];
 *   getElementsByTagName: (tagName: string) => DOMNode[];
 *   register: (node: DOMNode) => void;
 *   deregister: (node: DOMNode) => void;
 * };
 * ```
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
      let parentIsSafe = true;
      let newNode: ChildNode;

      tokenize(htmlString).forEach((token) => {
        const { nodeType, value, isSC } = token;
        // Skip doctype, but store it as a root property
        if (nodeType === "doctype") {
          root.doctype = `<${value}>`;
          return;
        }
        const currentParent = stack[stack.length - 1];

        if (["text", "comment"].includes(nodeType)) {
          newNode = createBasicNode(
            `#${nodeType as "text" | "comment"}`,
            value,
          ) as ChildNode;
          currentParent.append(newNode);
          return;
        }

        const isClosing = startsWith(value, "/");
        const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
        const isSelfClosing = isSC || selfClosingTags.has(tagName);

        // Tag Matching Detection Logic
        if (!isSelfClosing) {
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

        // Skip unsafe tags
        if (unsafeTags.has(tagName)) {
          if (isClosing) {
            parentIsSafe = true;
          } else {
            parentIsSafe = false;
          }
          return;
        }

        if (!parentIsSafe) return;

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
          ) as DOMNode;
          if (onNodeCallback) onNodeCallback(newNode, currentParent, root);

          const charset = attributes?.charset;
          if (tagName === "meta" && charset) {
            root.charset = toUpperCase(charset);
          }

          currentParent.append(newNode);
          !isSelfClosing && stack.push(newNode);
        } else if (!isSelfClosing && stack.length > 1) {
          stack.pop();
        }
      });

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
