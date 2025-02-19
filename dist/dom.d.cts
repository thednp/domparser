type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
/**
 * Represents a text node in the DOM
 */
type NodeLike = {
    tagName: string & TagNames;
    nodeName: string;
    attributes: Record<string, string>;
    children: ChildLike[];
};
/**
 * Represents a text node in the DOM
 */
type TextNode = TextLike & {
    remove: () => void;
    readonly textContent: string;
    readonly ownerDocument: RootNode;
    readonly parentNode: RootNode | DOMNode;
};
type TextLike = {
    nodeName: "#text";
    nodeValue: string;
    tagName?: string;
    children?: ChildLike[];
    attributes?: Record<string, string>;
};
/**
 * Represents a comment node in the DOM
 */
type CommentNode = CommentLike & {
    remove: () => void;
    readonly textContent: string;
    readonly ownerDocument: RootNode;
    readonly parentNode: RootNode | DOMNode;
};
type CommentLike = {
    nodeName: "#comment";
    nodeValue: string;
    tagName?: string;
    children?: ChildLike[];
    attributes?: Record<string, string>;
};
type ChildNode = DOMNode | TextNode | CommentNode;
type ChildLike = NodeLike | TextLike | CommentLike;
type ChildNodeList = ChildNode[];
/**
 * Node API
 */
type NodeAPI = {
    nodeName: string;
    readonly ownerDocument: RootNode;
    readonly parentElement: DOMNode | null;
    readonly parentNode: RootNode | DOMNode;
    readonly textContent: string;
    childNodes: ChildNode[];
    nodeValue?: string;
};
/**
 * Node API
 */
type ElementAPI = {
    readonly tagName: string & TagNames;
    readonly attributes: Map<string, string>;
    readonly textContent: string;
    readonly innerHTML: string;
    readonly outerHTML: string;
    append: (...nodes: ChildNodeList) => void;
    querySelector: (selector: string) => DOMNode | null;
    querySelectorAll: (selector: string) => DOMNode[];
    getElementsByTagName: (tagName: string) => DOMNode[];
    getElementsByClassName: (className: string) => DOMNode[];
    closest: (selector: string) => DOMNode | null;
    contains: (node: DOMNode) => boolean;
    matches: (selector: string) => boolean;
    hasAttribute: (attrName: string) => boolean;
    getAttribute: (attrName: string) => string | null;
    setAttribute: (attrName: string, attrValue: string) => void;
    hasAttributeNS: (ns: string, attrName: string) => boolean;
    getAttributeNS: (ns: string, attrName: string) => string | null;
    setAttributeNS: (ns: string, attrName: string, attrValue: string) => void;
    replaceChildren: (...children: DOMNode[]) => void;
    removeChild: (child: ChildNode) => void;
    remove: () => void;
    cleanup: () => void;
    children: DOMNode[];
};
/**
 * Represents an element node in the DOM
 */
type DOMNode = NodeAPI & ElementAPI;
type MaybeChildNode = ChildNode | string | number;
/**
 * Represents the root document node
 */
type RootNode = Omit<NodeAPI, "nodeName" | "ownerDocument"> & Omit<ElementAPI, "attributes" | "tagName"> & {
    nodeName: "#document";
    charset?: string;
    doctype?: string;
    readonly all: DOMNode[];
    readonly documentElement: DOMNode | undefined;
    readonly head: DOMNode | undefined;
    readonly body: DOMNode | undefined;
    register: (node: DOMNode) => void;
    deregister: (node: DOMNode) => void;
    getElementById: (id: string) => DOMNode | null;
    createElement: (tagName: string & TagNames, first?: MaybeChildNode | NodeLikeAttributes, ...childNodes: MaybeChildNode[]) => DOMNode;
    createElementNS: (namespace: string, tagName: string & keyof SVGElementTagNameMap, first?: MaybeChildNode | NodeLikeAttributes, ...childNodes: MaybeChildNode[]) => DOMNode;
    createComment: (value: string) => CommentNode;
    createTextNode: (value: string) => TextNode;
};
/**
 * Represents NodeLike attributes
 */
type NodeLikeAttributes = Record<string, string>;

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
declare function createElement(this: RootNode, tagName: string & TagNames, first?: NodeLikeAttributes | MaybeChildNode, ...args: MaybeChildNode[]): DOMNode;
/**
 * Creates a new `Document` like root node.
 *
 * @returns a new root node
 */
declare const createDocument: () => RootNode;

export { createBasicNode, createDocument, createElement, createNode };
