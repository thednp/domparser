// types.ts
export type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
export type TagAttr<T extends TagNames> =
  (HTMLElementTagNameMap & SVGElementTagNameMap)[T];

/**
 * Represents a text node in the DOM
 */
export type TextNode = TextLike & {
  remove: () => void;
  readonly textContent: string;
  readonly ownerDocument: RootNode;
  readonly parentNode: RootNode | DOMNode;
};
export type TextLike = {
  nodeName: "#text";
  nodeValue: string;
};

/**
 * Represents a comment node in the DOM
 */
export type CommentNode = CommentLike & {
  remove: () => void;
  readonly textContent: string;
  readonly ownerDocument: RootNode;
  readonly parentNode: RootNode | DOMNode;
};
export type CommentLike = {
  nodeName: "#comment";
  nodeValue: string;
};

export type TextOrComment = TextNode | CommentNode;
export type ChildNode = DOMNode | TextNode | CommentNode;
export type ChildLike = NodeLike | TextLike | CommentLike;
export type ChildNodeList = ChildNode[];
export type ChildElementList = DOMNode[];

/**
 * Base interface for DOM nodes
 */
export type BaseNode = {
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

export type NodeLike = {
  tagName: string & TagNames;
  nodeName: string;
  attributes: Record<string, string>;
  childNodes: (NodeLike | TextLike | CommentLike)[];
  children: NodeLike[];
};

/**
 * Represents an element node in the DOM
 */
export type DOMNode = Omit<NodeLike, "attributes"> & BaseNode & {
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
  readonly attributes: Map<string, string>;
  readonly textContent: string;
  readonly innerHTML: string;
  readonly outerHTML: string;
};

export type MaybeChildNode = ChildNode | string | number;

/**
 * Represents the root document node
 */
export type RootNode =
  & Omit<RootLike, "all" | "children" | "childNodes">
  & Omit<BaseNode, "nodeName" | "ownerDocument">
  & {
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
    createElement: (
      tagName: string & TagNames,
      first?: MaybeChildNode | NodeLikeAttributes,
      ...childNodes: MaybeChildNode[]
    ) => DOMNode;
    createElementNS: (
      namespace: string,
      tagName: string & keyof SVGElementTagNameMap,
      first?: MaybeChildNode | NodeLikeAttributes,
      ...childNodes: MaybeChildNode[]
    ) => DOMNode;
    createComment: (value: string) => CommentNode;
    createTextNode: (value: string) => TextNode;
  };

export type RootLike = {
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
export type HTMLToken = {
  nodeType: string;
  value: string;
  isSC?: boolean;
};

export type TextToken = {
  nodeType: "text" | "comment";
  value: string;
};

/**
 * Parser configuration options
 */
export type ParserOptions = {
  sanitizeFn: (name: string, str: string) => string;
  // onNodeCallback: (node: ChildLike, parent: RootLike | NodeLike, root: RootLike) => ChildNode;
  onNodeCallback: (
    node: ChildLike | ChildNode,
    parent: RootLike | DOMNode,
    root: RootLike,
  ) => ChildNode | ChildLike;
  filterTags: string[];
  filterAttrs: string[];
};

/**
 * Parser result containing the DOM tree and component/tag information
 */
export type ParseResult = {
  root: RootLike;
  components: string[];
  tags: string[];
};

/**
 * Represents a part of a CSS selector
 */
export type SelectorPart = {
  type: "#" | "." | "[" | "";
  name: string;
  value?: string;
};

/**
 * Represents NodeLike attributes
 */
export type NodeLikeAttributes = Record<string, string>;
/**
 * Represents DOMNode attributes
 */
export type DOMNodeAttributes = Map<string, string>;

/**
 * Options for the attributes parser.
 */
export type GetAttributesOptions = {
  unsafeAttrs: Set<string>;
  sanitizeFn: (name: string, str: string) => string;
};
