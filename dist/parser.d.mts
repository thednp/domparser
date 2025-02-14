import { G as GetAttributesOptions, c as NodeLikeAttributes, P as ParserOptions, R as RootLike, H as HTMLToken } from './types-DPG4EwRD.mjs';

/**
 * Get attributes from a string token and return an object
 * @param tagStr the string token
 * @param config an optional set of options
 * @returns the attributes object
 */
declare const getAttributes: (tagStr: string, config?: Partial<GetAttributesOptions>) => NodeLikeAttributes;
/**
 * Tokenizes an HTML string into an array of HTML tokens.
 * These tokens represent opening tags, closing tags, text content, and comments.
 * @param html The HTML string to tokenize.
 * @returns An array of `HTMLToken` objects.
 */
declare const tokenize: (html: string) => HTMLToken[];
/**
 * **Parser**
 *
 * A tiny yet very fast and powerful parser that
 * takes a string of HTML and returns a DOM tree representation.
 *
 * **Features**
 * * The **Parser** is around 1.2Kb and is optimized for speed and memory efficiency.
 * * It handles basic HTML elements, custom elements, UI frameworks components,
 * special attributes, and text and comment nodes.
 * * It provides sanitization options for specific attributes
 * and options to filter tags and unsafe attributes; _by default the filters are empty_.
 * * You can make use of its sanitization tools in your application or use any
 * sanitization at your disposal.
 *
 * The DOM representation is a plain object with the following structure:
 * ```ts
 *  type CommentLike = {
 *   nodeName: "#comment";
 *   nodeValue: string;
 * };
 *  type TextLike = {
 *   nodeName: "#text";
 *   nodeValue: string;
 * };
 *  type NodeLike = {
 *   tagName: string;
 *   nodeName: string;
 *   attributes: Record<string, string>;
 *   children: NodeLike[];
 *   childNodes: (NodeLike | TextLike | CommentLike)[];
 * };
 *  type RootLike = {
 *   nodeName: string;
 *   doctype?: string;
 *   all: NodeLike[];
 *   children: NodeLike[];
 *   childNodes: (NodeLike | TextLike | CommentLike)[];
 * };
 * ```
 *
 * @example
 * ```ts
 * const config = {
 *   // Sanitize function
 *   sanitizeFn?: myFunction(attrName: string, attrValue: string) => string,
 *   // Callback on new nodes
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
 * const parser = Parser(config);
 * const { root, components, tags } = parser.parseFromString("<h1>Title</h1>");
 * // > "root" is a RootLike node, "components" is an array of component names, "tags" is an array of tag names
 * ```
 *
 * @param config an optional configuration object
 * @returns the parsed result
 */
declare function Parser(config?: Partial<ParserOptions>): {
    parseFromString(htmlString?: string): {
        root: RootLike;
        components: string[];
        tags: string[];
    };
};

export { Parser, getAttributes, tokenize };
