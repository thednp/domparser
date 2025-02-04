export declare type DOMLike = {
    tagName?: string;
    nodeName: string;
    attributes: Record<string, string>;
    children: DOMLike[];
    nodeValue?: string;
};

/**
 * A basic tool for HTML entities encoding
 * @param str the source string
 * @returns the encoded string
 */
export declare const encodeEntities: (str: string) => string;

/**
 * Get attributes from a string token and return an object
 * where the keys are the names of the attributes and the values
 * are the sanitized values of the attributes.
 *
 * @param tagStr the tring token
 * @param unsafeAttrs an optional set of unsafe attributes
 * @returns the attributes object
 */
export declare const getAttributes: (tagStr: string, unsafeAttrs?: Set<string>) => Record<string, string>;

export declare type HTMLToken = {
    nodeType: string;
    value: string;
    isSC?: boolean;
};

/**
 * **DOMParser**
 *
 * A tiny yet very fast and powerful HTML parser that
 * takes a string of HTML and returns a simple DOM representation.
 *
 * **Features**
 * * The parser is around 1.2Kb and is optimized for speed and memory efficiency.
 * * The parser handles basic HTML elements, custom elements,
 * UI frameworks components, special attributes, and text nodes.
 * * The parser provides basic sanitization for specific attributes
 * and options to filter tags and attributes; _by default the filters are empty_.
 * * You can also make use of its sanitization tools in your own application.
 * * Fully tested with Vitest.
 *
 * The DOM representation is a plain object with the following structure:
 * ```ts
 *  type DOMLike = {
 *   tagName?: string; // applied only to Element nodes
 *   nodeName: string;
 *   attributes: Record<string, string>;
 *   children: DOMLike[];
 *   nodeValue?: string; // applied only to #text | #comment nodes
 * };
 * ```
 *
 * @example
 * ```ts
 * const config = {
 *   // Common dangerous tags that could lead to XSS
 *   filterTags: [
 *     "script", "style", "iframe", "object", "embed", "base", "form",
 *     "input", "button", "textarea", "select", "option"
 *   ],
 *   // Unsafe attributes that could lead to XSS
 *   filterAttrs: [
 *     "onerror", "onload", "onunload", "onclick", "ondblclick", "onmousedown",
 *     "onmouseup", "onmouseover", "onmousemove", "onmouseout", "onkeydown",
 *     "onkeypress", "onkeyup", "onchange", "onsubmit", "onreset", "onselect",
 *     "onblur", "onfocus", "formaction", "href", "xlink:href", "action"
 *   ]
 * }
 * const parser = Parser(config);
 * const { root, components, tags } = parser.parseFromString("<h1>Title</h1>");
 * // > "root" is a DOMLike node, "components" is an array of component names, "tags" is an array of tag names
 * ```
 *
 * @param config an optional configuration object
 * @returns the parsed result
 */
export declare function Parser(config?: Partial<ParserOptions>): {
    parseFromString(htmlString?: string): {
        root: RootNode;
        components: string[];
        tags: string[];
    };
};

export declare type ParseResult = {
    root: RootNode;
    components: string[];
    tags: string[];
};

export declare type ParserOptions = {
    filterTags?: string[];
    filterAttrs?: string[];
};

export declare type RootNode = {
    nodeName: string;
    children: DOMLike[];
};

/**
 * Sanitizes attribute values
 * @param name the attribute name
 * @param initialValue the attribute value
 * @returns the sanitized value
 */
export declare const sanitizeAttrValue: (name: string, initialValue: string) => string;

/**
 * Sanitizes URLs in attribute values
 * @param url the URL
 * @returns the sanitized URL
 */
export declare const sanitizeUrl: (url: string) => string;

export { }
