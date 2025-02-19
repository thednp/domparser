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
type TextLike = {
    nodeName: "#text";
    nodeValue: string;
    tagName?: string;
    children?: ChildLike[];
    attributes?: Record<string, string>;
};
type CommentLike = {
    nodeName: "#comment";
    nodeValue: string;
    tagName?: string;
    children?: ChildLike[];
    attributes?: Record<string, string>;
};
type ChildLike = NodeLike | TextLike | CommentLike;
type RootLike = {
    nodeName: "#document";
    children: ChildLike[];
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

export { Parser };
