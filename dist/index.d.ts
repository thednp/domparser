import { N as NodeLikeAttributes, G as GetAttributesOptions, R as RootLike, a as RootNode, C as ChildLike, b as ChildNode, c as NodeLike, D as DOMNode, T as TokenizerOptions, H as HTMLToken, M as MatchFunction } from './types-DQLviOPt.js';
export { l as ChildElementList, k as ChildNodeList, i as CommentLike, h as CommentNode, r as DOMNodeAttributes, p as DomParserOptions, q as DomParserResult, E as ElementAPI, n as MaybeChildNode, m as NodeAPI, P as ParseResult, S as SelectorPart, e as TagAttr, d as TagNames, g as TextLike, f as TextNode, j as TextOrComment, o as TextToken } from './types-DQLviOPt.js';
export { createBasicNode, createDocument, createElement, createNode } from './dom.js';
export { Parser } from './parser.js';
export { DomParser } from './dom-parser.js';

declare const ATTR_REGEX: RegExp;
/**
 * Get attributes from a string token and return an object
 * @param token the string token
 * @returns the attributes object
 */
declare const getBaseAttributes: (token: string) => NodeLikeAttributes;
/**
 * Get attributes from a string token and return an object.
 * In addition to the base tool, this also filters configured
 * unsafe attributes.
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
declare const escape: (str: string) => string;
declare const DOM_ERROR = "DomParserError:";
/**
 * Tokenizes an HTML string into an array of HTML tokens.
 * These tokens represent opening tags, closing tags, text content, and comments.
 * @param html The HTML string to tokenize.
 * @returns An array of `HTMLToken` objects.
 */
declare const tokenize: (html: string, options?: TokenizerOptions) => HTMLToken[];

/**
 * Create a selector cache to help improve `match` based queries
 * (matches, querySelector, querySelectorAll).
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

export { ATTR_REGEX, ChildLike, ChildNode, DOMNode, DOM_ERROR, GetAttributesOptions, HTMLToken, MatchFunction, NodeLike, NodeLikeAttributes, RootLike, RootNode, TokenizerOptions, charCodeAt, defineProperties, endsWith, escape, fromCharCode, getAttributes, getBaseAttributes, isNode, isObj, isPrimitive, isRoot, isTag, matchesSelector, selectorCache, selfClosingTags, startsWith, toLowerCase, toUpperCase, tokenize, trim };
