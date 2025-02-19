type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
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
 * Parser configuration options
 */
type DomParserOptions = {
    sanitizeFn: (name: string, str: string) => string;
    onNodeCallback: (node: DOMNode, parent: RootNode | DOMNode, root: RootNode) => ChildNode;
    filterTags: string[];
    filterAttrs: string[];
};
/**
 * Represents NodeLike attributes
 */
type NodeLikeAttributes = Record<string, string>;

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

export { DomParser };
