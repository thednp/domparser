type TagNames = keyof HTMLElementTagNameMap;
type TagAttr<T extends TagNames> = HTMLElementTagNameMap[T];
/**
 * Represents a text node in the DOM
 */
type TextNode = TextLike & {
    remove: () => void;
    readonly textContent: string;
    readonly innerText: string;
    readonly ownerDocument: RootNode;
    readonly parentNode: RootNode | DOMNode;
};
type TextLike = {
    nodeName: "#text";
    nodeValue: string;
};
/**
 * Represents a comment node in the DOM
 */
type CommentNode = CommentLike & {
    remove: () => void;
    readonly textContent: string;
    readonly innerText: string;
    readonly ownerDocument: RootNode;
    readonly parentNode: RootNode | DOMNode;
};
type CommentLike = {
    nodeName: "#comment";
    nodeValue: string;
};
type TextOrComment = TextNode | CommentNode;
type ChildNode = DOMNode | TextNode | CommentNode;
type ChildLike = NodeLike | TextLike | CommentLike;
type ChildNodeList = ChildNode[];
type ChildElementList = DOMNode[];
/**
 * Base interface for DOM nodes
 */
type BaseNode = {
    nodeName: string;
    readonly textContent: string;
    readonly children: ChildElementList;
    readonly childNodes: ChildNodeList;
    readonly parentNode: RootNode | DOMNode;
    readonly ownerDocument: RootNode;
    append: (...nodes: ChildNodeList) => void;
    querySelector: (selector: string) => DOMNode | null;
    querySelectorAll: (selector: string) => DOMNode[];
    getElementsByTagName: (tagName: string) => DOMNode[];
    getElementsByClassName: (className: string) => DOMNode[];
};
type NodeLike = {
    tagName: string & TagNames;
    nodeName: string;
    attributes: Record<string | keyof TagAttr<NodeLike["tagName"]>, string>;
    childNodes: (NodeLike | TextLike | CommentLike)[];
    children: NodeLike[];
};
/**
 * Represents an element node in the DOM
 */
type DOMNode = Omit<NodeLike, "attributes"> & BaseNode & {
    closest: (selector: string) => DOMNode | null;
    contains: (node: DOMNode) => boolean;
    matches: (selector: string) => boolean;
    hasAttribute: (attrName: string) => boolean;
    getAttribute: (attrName: string) => string | null;
    setAttribute: (attrName: string, attrValue: string) => void;
    hasAttributeNS: (ns: string, attrName: string) => boolean;
    getAttributeNS: (ns: string, attrName: string) => string | null;
    setAttributeNS: (ns: string, attrName: string, attrValue: string) => void;
    replaceChildren: (...newChildren: DOMNode[]) => void;
    removeChild: (delChild: ChildNode) => void;
    remove: () => void;
    readonly tagName: string & TagNames;
    readonly attributes: Map<string | keyof TagAttr<DOMNode["tagName"]>, string>;
    readonly textContent: string;
    readonly innerText: string;
    readonly innerHTML: string;
    readonly outerHTML: string;
};
type MaybeChildNode = ChildNode | string | number;
/**
 * Represents the root document node
 */
type RootNode = Omit<RootLike, "all" | "children" | "childNodes"> & Omit<BaseNode, "nodeName" | "ownerDocument"> & {
    nodeName: "#document";
    register: (node: DOMNode) => void;
    deregister: (node: DOMNode) => void;
    readonly all: ChildElementList;
    readonly documentElement: DOMNode | undefined;
    readonly head: DOMNode | undefined;
    readonly body: DOMNode | undefined;
    readonly children: ChildElementList;
    readonly childNodes: ChildNodeList;
    contains: (node: DOMNode) => boolean;
    removeChild: (delChild: ChildNode) => void;
    replaceChildren: (...newChildren: DOMNode[]) => void;
    getElementById: (id: string) => DOMNode | null;
    createElement: (tagName: string, first?: MaybeChildNode | NodeLikeAttributes, ...childNodes: MaybeChildNode[]) => DOMNode;
    createElementNS: (namespace: string, tagName: string, first?: MaybeChildNode | NodeLikeAttributes, ...childNodes: MaybeChildNode[]) => DOMNode;
    createComment: (value: string) => CommentNode;
    createTextNode: (value: string) => TextNode;
};
type RootLike = {
    nodeName: string;
    doctype?: string;
    charset?: string;
    all: NodeLike[];
    childNodes: (TextLike | CommentLike | NodeLike)[];
    children: NodeLike[];
};
/**
 * HTML parsing token
 */
type HTMLToken = {
    nodeType: string;
    value: string;
    isSC?: boolean;
};
type TextToken = {
    nodeType: "text" | "comment";
    value: string;
};
/**
 * Parser configuration options
 */
type ParserOptions = {
    sanitizeFn: (name: string, str: string) => string;
    onNodeCallback: (node: ChildLike | ChildNode, parent: RootLike | DOMNode, root: RootLike) => ChildNode | ChildLike;
    filterTags: string[];
    filterAttrs: string[];
};
/**
 * Parser result containing the DOM tree and component/tag information
 */
type ParseResult = {
    root: RootLike;
    components: string[];
    tags: string[];
};
/**
 * Represents a part of a CSS selector
 */
type SelectorPart = {
    type: "#" | "." | "[" | "";
    name: string;
    value?: string;
};
/**
 * Represents NodeLike attributes
 */
type NodeLikeAttributes = Record<string, string>;
/**
 * Represents DOMNode attributes
 */
type DOMNodeAttributes = Map<string, string>;
/**
 * Options for the attributes parser.
 */
type GetAttributesOptions = {
    unsafeAttrs: Set<string>;
    sanitizeFn: (name: string, str: string) => string;
};

export type { BaseNode as B, ChildLike as C, DOMNode as D, GetAttributesOptions as G, HTMLToken as H, MaybeChildNode as M, NodeLike as N, ParserOptions as P, RootLike as R, SelectorPart as S, TagNames as T, RootNode as a, ChildNode as b, NodeLikeAttributes as c, TagAttr as d, TextNode as e, TextLike as f, CommentNode as g, CommentLike as h, TextOrComment as i, ChildNodeList as j, ChildElementList as k, TextToken as l, ParseResult as m, DOMNodeAttributes as n };
