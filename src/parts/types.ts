// types.ts
export type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
export type TagAttr<T extends TagNames> =
  (HTMLElementTagNameMap & SVGElementTagNameMap)[T];

/**
 * Represents a text node in the DOM
 */
export type NodeLike = {
  tagName: string;
  nodeName: string;
  attributes: NodeLikeAttributes;
  children: ChildLike[];
  nodeValue?: string;
};

/**
 * Represents a text node in the DOM
 */
export type TextNode = TextLike & {
  remove: () => void;
  nodeName: "#text";
  readonly textContent: string;
  readonly ownerDocument: RootNode;
  readonly parentNode: RootNode | DOMNode;
};

export type TextLike = {
  nodeName: string;
  nodeValue: string;
  // just shut up Typescript
  tagName?: string;
  children?: ChildLike[];
  attributes?: Record<string, string>;
};

/**
 * Represents a comment node in the DOM
 */
export type CommentNode = CommentLike & {
  remove: () => void;
  nodeName: "#comment";
  readonly textContent: string;
  readonly ownerDocument: RootNode;
  readonly parentNode: RootNode | DOMNode;
};
export type CommentLike = {
  nodeName: string;
  nodeValue: string;
  // just shut up Typescript
  tagName?: string;
  children?: ChildLike[];
  attributes?: Record<string, string>;
};

export type TextOrComment = TextNode | CommentNode;
export type ChildNode = DOMNode | TextNode | CommentNode;
export type ChildLike = NodeLike | TextLike | CommentLike;
export type ChildNodeList = ChildNode[];
export type ChildElementList = DOMNode[];

/**
 * Node API
 */
export type NodeAPI = {
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
export type ElementAPI = {
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
export type DOMNode = NodeAPI & ElementAPI;
export type MaybeChildNode = ChildNode | string | number;

/**
 * Represents the root document node
 */
export type RootNode =
  & Omit<NodeAPI, "nodeName" | "ownerDocument">
  & Omit<ElementAPI, "attributes" | "tagName">
  & {
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

/**
 * Represents a lighter root document node
 */
export type RootLike = {
  nodeName: "#document";
  children: ChildLike[];
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
export type DomParserOptions = {
  onNodeCallback: (
    node: DOMNode,
    parent: RootNode | DOMNode,
    root: RootNode,
  ) => ChildNode;
  filterTags: string[];
  filterAttrs: string[];
};

/**
 * Parser result containing the simplidied DOM tree
 * and component/tag information
 */
export type ParseResult = {
  root: RootLike;
  components: string[];
  tags: string[];
};

/**
 * Parser result containing the DOM tree
 * and component/tag information
 */
export type DomParserResult = {
  root: RootNode;
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
};

/**
 * Selector match function
 */
export type MatchFunction = (node: DOMNode) => boolean;
