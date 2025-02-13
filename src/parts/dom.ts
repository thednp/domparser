// dom.ts
import { addDomPrototype, createDocument } from "./prototype";
import { Parser } from "./parser";
import { DOM_ERROR, isObj, isRoot } from "./util";
import { sanitizeAttrValue } from "./sanitize";
import type { ParserOptions, RootLike, RootNode } from "./types";

export { createDocument };

/**
 * **Dom**
 *
 * Creates a new `Document` like instance with DOM-like methods and properties and populates
 * it with nodes resulted from the parsing of a given HTML markup.
 *
 * **Features**
 * * It uses the **Parser** to quickly create a DOM tree.
 * * It pushes into the **Parser** options for basic sanitization to all children attributes.
 * * It also sets `onNodeCallback` to override the **Parser**'s ability to store the DOM tree.
 * * It adds basic selector engine to the `RootNode` and all `DOMLike` nodes.
 * * It adds `Element` like methods to new `DOMLike` nodes, EG: `ownerDocument`, `parentNode`,
 * `matches`, `closest`, `getAttribute`, `innerHTML` and others.
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
 *   remove: void;
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
 *  // this is the return of Dom()
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
 *   // Sanitize function
 *   sanitizeFn?: myFunction(attrName: string, attrValue: string) => string,
 *   // Sanitize function
 *   onNodeCallback?: myFunction(node: NodeLike) => void,
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
 * const doc = Dom("<!doctype html><html>This is starting html</html>", config);
 * console.log(doc.documentElement.outerHTML);
 * // > "<html>This is starting html</html>"
 * ```
 *
 * @param startHTML Initial HTML content
 * @param config the `Parser` options to apply to the parsing of the startHTML markup.
 * @returns The `Document` like root node
 */
export const Dom = (
  startHTML: string | undefined = undefined,
  config: Partial<ParserOptions> = {},
): RootNode => {
  if (startHTML && typeof startHTML !== "string") {
    throw new Error(`${DOM_ERROR} 1st parameter is not a string.`);
  }
  if (config && !isObj(config)) {
    throw new Error(`${DOM_ERROR} 2nd parameter is not an object.`);
  }
  // break the callback out of config
  const { onNodeCallback: callback, ...rest } = config;
  // create the root node
  const rootNode = createDocument();
  // set default parser options
  const defaultOpts: ParserOptions = {
    onNodeCallback: (node, parent) => {
      if (typeof callback === "function") {
        callback(node, parent, rootNode as RootLike & RootNode);
      }
      const child = addDomPrototype(node, rootNode);
      const currentParent = isRoot(parent) ? rootNode : parent;
      currentParent.append(child);

      return child;
    },
    sanitizeFn: sanitizeAttrValue,
    filterTags: [],
    filterAttrs: [],
  };

  // parse options
  // allow config to override all the above options
  const options = Object.assign({}, defaultOpts, rest);

  // Create parser instance
  const { root: { charset, doctype } } = Parser(options)
    // Parse initial HTML
    .parseFromString(startHTML);

  // transfer doctype & charset
  Object.assign(rootNode, { charset, doctype });

  return rootNode;
};
