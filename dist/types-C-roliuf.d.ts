//#region src/parts/types.d.ts
type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
type TagAttr<T extends TagNames> = (HTMLElementTagNameMap & SVGElementTagNameMap)[T];
/**
 * Represents a text node in the DOM
 */
type NodeLike = {
  tagName: string;
  nodeName: string;
  attributes: NodeLikeAttributes;
  children: ChildLike[];
  nodeValue?: string;
};
/**
 * Represents a text node in the DOM
 */
type TextNode = TextLike & {
  remove: () => void;
  nodeName: "#text";
  get textContent(): string;
  set textContent(newValue: string);
  readonly ownerDocument: RootNode;
  readonly parentNode: RootNode | DOMNode;
  before: (...nodes: ChildNodeList) => void;
  after: (...nodes: ChildNodeList) => void;
};
type TextLike = {
  nodeName: string;
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
  nodeName: "#comment";
  readonly textContent: string;
  readonly ownerDocument: RootNode;
  readonly parentNode: RootNode | DOMNode;
  before: (...nodes: ChildNodeList) => void;
  after: (...nodes: ChildNodeList) => void;
};
type CommentLike = {
  nodeName: string;
  nodeValue: string;
  tagName?: string;
  children?: ChildLike[];
  attributes?: Record<string, string>;
};
type TextOrComment = TextNode | CommentNode;
type ChildNode = DOMNode | TextNode | CommentNode;
type ChildLike = NodeLike | TextLike | CommentLike;
type ChildNodeList = ChildNode[];
type ChildElementList = DOMNode[];
/**
 * Node API
 */
type NodeAPI = {
  nodeName: string;
  readonly ownerDocument: RootNode;
  readonly parentElement: DOMNode | null;
  readonly parentNode: RootNode | DOMNode;
  get textContent(): string;
  set textContent(newValue: string);
  childNodes: ChildNode[];
  nodeValue?: string;
  before: (...nodes: ChildNodeList) => void;
  after: (...nodes: ChildNodeList) => void;
};
/**
 * Node API
 */
type ElementAPI = {
  readonly tagName: string & TagNames;
  readonly attributes: Map<string, string>;
  readonly textContent: string;
  readonly innerHTML: string;
  readonly id: string;
  readonly className: string;
  readonly outerHTML: string;
  append: (...nodes: ChildNodeList) => void;
  appendChild: (node: ChildNode) => void;
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
  removeAttribute: (attrName: string) => void;
  hasAttributeNS: (ns: string, attrName: string) => boolean;
  getAttributeNS: (ns: string, attrName: string) => string | null;
  setAttributeNS: (ns: string, attrName: string, attrValue: string) => void;
  removeAttributeNS: (ns: string, attrName: string) => void;
  replaceChildren: (...children: DOMNode[]) => void;
  removeChild: (child: ChildNode) => void;
  registerChild: (child: DOMNode) => void;
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
type RootNode = Omit<NodeAPI, "nodeName" | "ownerDocument"> & Omit<ElementAPI, "attributes" | "tagName" | "registerChild"> & {
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
 * Represents a lighter root document node
 */
type RootLike = {
  nodeName: "#document";
  children: ChildLike[];
};
/**
 * HTML parsing token
 */
type HTMLToken = {
  tokenType: "tag" | "text" | "comment" | "doctype";
  value: string;
  isSC?: boolean;
};
interface TokenizerOptions {
  /** Maximum size in bytes for script content. Default 102400 (100KB) */
  maxScriptSize?: number;
  /** Chunk size in bytes. Default 65536 (64KB) */
  chunkSize?: number;
}
type TextToken = {
  tokenType: "text" | "comment";
  value: string;
};
/**
 * Parser configuration options
 */
type DomParserOptions = {
  onNodeCallback: (node: DOMNode, parent: RootNode | DOMNode, root: RootNode) => ChildNode;
  filterTags: string[];
  filterAttrs: string[];
};
/**
 * Parser result containing the simplidied DOM tree
 * and component/tag information
 */
type ParseResult = {
  root: RootLike;
  components: string[];
  tags: string[];
};
/**
 * Parser result containing the DOM tree
 * and component/tag information
 */
type DomParserResult = {
  root: RootNode;
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
};
/**
 * Selector match function
 */
type MatchFunction = (node: DOMNode) => boolean;
//#endregion
export { ChildElementList, ChildLike, ChildNode, ChildNodeList, CommentLike, CommentNode, DOMNode, DOMNodeAttributes, DomParserOptions, DomParserResult, ElementAPI, GetAttributesOptions, HTMLToken, MatchFunction, MaybeChildNode, NodeAPI, NodeLike, NodeLikeAttributes, ParseResult, RootLike, RootNode, SelectorPart, TagAttr, TagNames, TextLike, TextNode, TextOrComment, TextToken, TokenizerOptions };
//# sourceMappingURL=types-C-roliuf.d.ts.map