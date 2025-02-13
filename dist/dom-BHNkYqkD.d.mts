import { e as TextNode, g as CommentNode, a as RootNode, j as ChildNodeList, D as DOMNode, c as NodeLikeAttributes, M as MaybeChildNode, b as ChildNode, C as ChildLike, P as ParserOptions } from './types-CFTqilf-.mjs';

/**
 * Creates a basic text or comment node.
 * @param nodeName The node name ("#text" or "#comment").
 * @param text The text content of the node.
 * @returns A TextNode or CommentNode object.
 */
declare function createBasicNode<T extends ("#text" | "#comment")>(nodeName: T, text: string): TextNode | CommentNode;
/**
 * Creates a DOM-like Node (`DOMNode` or `RootNode`) with DOM API extensions and sanitization.
 * This function extends the basic `NodeLike` from **Parser** by adding DOM-specific properties and methods,
 * as well as applying sanitization based on the provided configuration.
 *
 * @param this - The `RootNode` when creating a `DOMNode`, or `null` otherwise (in non-strict mode)
 * @param nodeName The tag name of the node to create (or '#document' for the root).
 * @param childNodes Optional child nodes to append to the created node.
 * @returns An extended `DOMNode` or `RootNode` object with DOM API.
 */
declare function createNode(this: RootNode | null, nodeName: string, ...childNodes: ChildNodeList): Omit<DOMNode, "tagName" | "attributes"> | RootNode;
/**
 * Creates a new `Element` like node
 * @param this The RootNode instance
 * @param tagName Tag name for the element
 * @param first Optional attributes or first child
 * @param args Additional child nodes
 * @returns New element node
 */
declare function createElement(this: RootNode, tagName: string, first?: NodeLikeAttributes | MaybeChildNode, ...args: MaybeChildNode[]): DOMNode;
/**
 * Enhances a node with DOM-like properties and methods
 * @param node The node to enhance
 * @param ownerDocument The root document
 */
declare const addDomPrototype: (node: ChildNode | ChildLike, ownerDocument: RootNode) => ChildNode;
/**
 * Creates a new `Document` like root node.
 *
 * @returns a new root node
 */
declare const createDocument: () => RootNode;

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
declare const Dom: (startHTML?: string | undefined, config?: Partial<ParserOptions>) => RootNode;

export { Dom as D, createNode as a, createElement as b, createBasicNode as c, addDomPrototype as d, createDocument as e };
