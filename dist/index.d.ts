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
    readonly textContent: string;
    readonly ownerDocument: RootNode;
    readonly parentNode: RootNode | DOMNode;
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
type RootLike = {
    nodeName: "#document";
    children: ChildLike[];
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
type DomParserOptions = {
    sanitizeFn: (name: string, str: string) => string;
    onNodeCallback: (node: DOMNode, parent: RootNode | DOMNode, root: RootNode) => ChildNode;
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
 * Parser result containing the DOM tree and component/tag information
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
    sanitizeFn: (name: string, str: string) => string;
};
/**
 * Selector match function
 */
type MatchFunction = (node: DOMNode) => boolean;

declare const ATTR_REGEX: RegExp;
/**
 * Get attributes from a string token and return an object
 * @param tagStr the string token
 * @returns the attributes object
 */
declare const getBaseAttributes: (tagStr: string) => NodeLikeAttributes;
/**
 * Get attributes from a string token and return an object.
 * In addition to the base tool, this also filters configured
 * unsafe attributes and sanitization.
 * @param tagStr the string token
 * @param config an optional set of options
 * @returns the attributes object
 */
declare const getAttributes: (tagStr: string, config?: Partial<GetAttributesOptions>) => NodeLikeAttributes;
/**
 * Converts a string to lowercase.
 * @param str The string to convert.
 * @returns The lowercase string.
 */
declare const toLowerCase: (str: string) => string;
/**
 * Converts a string to uppercase.
 * @param str The string to convert.
 * @returns The uppercase string.
 */
declare const toUpperCase: (str: string) => string;
/**
 * Checks if a string starts with a specified prefix.
 * @param str The string to check.
 * @param prefix The prefix to search for.
 * @param position The position to start looking from.
 * @returns `true` if the string starts with the prefix, `false` otherwise.
 */
declare const startsWith: (str: string, prefix: string, position?: number) => boolean;
/**
 * Checks if a string ends with a specified suffix.
 * @param str The string to check.
 * @param suffix The suffix to search for.
 * @param position The position to start looking from.
 * @returns `true` if the string ends with the suffix, `false` otherwise.
 */
declare const endsWith: (str: string, suffix: string, position?: number) => boolean;
/**
 * Creates a string from a character code.
 * @param char The character code.
 * @returns The string representation of the character code.
 */
declare const fromCharCode: (char: number) => string;
/**
 * Returns the character code at a specific index in a string.
 * @param str The string to check.
 * @param index The index of the character to get the code for.
 * @returns The character code at the specified index.
 */
declare const charCodeAt: (str: string, index: number) => number;
/**
 * Defines a property on an object.
 * @param obj The object to define the property on.
 * @param propName The name of the property.
 * @param desc The property descriptor.
 * @returns The object after defining the property.
 */
/**
 * Defines multiple properties on an object.
 * @param obj The object to define properties on.
 * @param props An object where keys are property names and values are property descriptors.
 * @returns The object after defining the properties.
 */
declare const defineProperties: <T extends Record<string, unknown>>(obj: T, props: Record<PropertyKey, PropertyDescriptor>) => T;
/**
 * Checks if a node is an object.
 * @param node The object to check.
 * @returns `true` if the node is an object, `false` otherwise.
 */
declare const isObj: (node: unknown) => node is object;
/**
 * Checks if a node is a root object (`RootNode` or `RootLike`).
 * @param node The object to check.
 * @returns `true` if the node is an object, `false` otherwise.
 */
declare const isRoot: (node: RootLike | RootNode | ChildLike | ChildNode) => node is RootLike | RootNode;
/**
 * Checks if a node is a tag node (`NodeLike` or `DOMNode`).
 * @param node The node to check.
 * @returns `true` if the node is a tag node, `false` otherwise.
 */
declare const isTag: (node: ChildLike | ChildNode) => node is NodeLike | DOMNode;
/**
 * Checks if a node is a root node (`RootLike` or `RootNode`),
 * a tag node (`NodeLike` or `DOMNode`), a comment node
 * (`CommentLike` or `CommentNode`) or text node (`TextLike` or `TextNode`).
 * @param node The node to check.
 * @returns `true` if the node is a tag node, `false` otherwise.
 */
declare const isNode: (node: ChildLike | ChildNode | NodeLikeAttributes | string | number) => node is ChildLike | NodeLike | DOMNode;
/**
 * Checks if a value is a primitive (number or string).
 * @param val The value to check.
 * @returns `true` if the value is a primitive, `false` otherwise.
 */
declare const isPrimitive: <T extends (number | string)>(val: unknown) => val is T;
/**
 * Trim a string value.
 * @param str A string value
 * @returns The trimmed value of the same string.
 */
declare const trim: (str: string) => string;
/**
 * Set of self-closing HTML tags used by the `Parser`.
 */
declare const selfClosingTags: Set<string>;
/**
 * Tokenizes an HTML string into an array of HTML tokens.
 * These tokens represent opening tags, closing tags, text content, and comments.
 * @param html The HTML string to tokenize.
 * @returns An array of `HTMLToken` objects.
 */
declare const tokenize: (html: string) => HTMLToken[];
declare const DOM_ERROR = "DomParserError:";

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

/**
 * Create a selector cache to help improve `match` based queries
 * (querySelector, querySelectorAll).
 */
declare class SelectorCacheMap extends Map<string, MatchFunction> {
    private hits;
    private misses;
    constructor();
    hit(): void;
    miss(): void;
    getMatchFunction(selector: string, maxSize?: number): MatchFunction;
    clear(): void;
    getStats(): {
        size: number;
        hits: number;
        misses: number;
        hitRate: number;
    };
}
declare const selectorCache: SelectorCacheMap;
/**
 * Checks if a node matches one or mode CSS selectors.
 * @param node The `DOMNode` object to test against the selector.
 * @param selector The CSS selector string.
 * @returns `true` if the node matches the selector, `false` otherwise.
 */
declare const matchesSelector: (node: DOMNode, selector: string) => boolean;

/**
 * **Parser**
 *
 * A tiny yet very fast and powerful parser that takes a string of HTML
 * and returns a DOM tree representation.
 *
 * The DOM representation is a plain object with the following structure:
 * ```ts
 *  type CommentLike = {
 *   nodeName: "#comment";
 *   nodeValue: string;
 *  };
 *  type TextLike = {
 *   nodeName: "#text";
 *   nodeValue: string;
 *  };
 *  type NodeLike = {
 *   tagName: string;
 *   nodeName: string;
 *   attributes: Record<string, string>;
 *   children: NodeLike[];
 *  };
 *  // the root node
 *  type RootLike = {
 *   nodeName: string;
 *   doctype?: string;
 *   children: NodeLike[];
 * };
 * ```
 *
 * @example
 * ```ts
 * const { root, components, tags } = Parser().parseFromString("<h1>Title</h1>");
 * // > "root" is a RootLike node,
 * // > "components" is an array of component names,
 * // > "tags" is an array of tag names.
 * ```
 *
 * @returns The result of the parser.
 */
declare function Parser(): {
    parseFromString(htmlString?: string): ParseResult;
};

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
declare const DomParser: (config?: Partial<DomParserOptions>) => {
    parseFromString(htmlString?: string): {
        root: RootNode;
        components: string[];
        tags: string[];
    };
};

export { ATTR_REGEX, type ChildElementList, type ChildLike, type ChildNode, type ChildNodeList, type CommentLike, type CommentNode, type DOMNode, type DOMNodeAttributes, DOM_ERROR, DomParser, type DomParserOptions, type DomParserResult, type ElementAPI, type GetAttributesOptions, type HTMLToken, type MatchFunction, type MaybeChildNode, type NodeAPI, type NodeLike, type NodeLikeAttributes, type ParseResult, Parser, type RootLike, type RootNode, type SelectorPart, type TagAttr, type TagNames, type TextLike, type TextNode, type TextOrComment, type TextToken, charCodeAt, createBasicNode, createDocument, createElement, createNode, defineProperties, endsWith, fromCharCode, getAttributes, getBaseAttributes, isNode, isObj, isPrimitive, isRoot, isTag, matchesSelector, selectorCache, selfClosingTags, startsWith, toLowerCase, toUpperCase, tokenize, trim };
