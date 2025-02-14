import { R as RootLike, a as RootNode, C as ChildLike, b as ChildNode, N as NodeLike, D as DOMNode, c as NodeLikeAttributes } from './types-DPG4EwRD.mjs';
export { B as BaseNode, k as ChildElementList, j as ChildNodeList, h as CommentLike, g as CommentNode, n as DOMNodeAttributes, G as GetAttributesOptions, H as HTMLToken, M as MaybeChildNode, m as ParseResult, P as ParserOptions, S as SelectorPart, d as TagAttr, T as TagNames, f as TextLike, e as TextNode, i as TextOrComment, l as TextToken } from './types-DPG4EwRD.mjs';
export { encodeEntities, sanitizeAttrValue, sanitizeUrl } from './sanitize.mjs';
export { D as Dom, d as addDomPrototype, c as createBasicNode, e as createDocument, b as createElement, a as createNode } from './dom-BKoFG31x.mjs';
export { Parser, getAttributes, tokenize } from './parser.mjs';

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
 * @returns `true` if the string starts with the prefix, `false` otherwise.
 */
declare const startsWith: (str: string, prefix: string) => boolean;
/**
 * Checks if a string ends with a specified suffix.
 * @param str The string to check.
 * @param suffix The suffix to search for.
 * @returns `true` if the string ends with the suffix, `false` otherwise.
 */
declare const endsWith: (str: string, suffix: string) => boolean;
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
 * Set of self-closing HTML tags used by the `Parser`.
 */
declare const selfClosingTags: Set<string>;
declare const DOM_ERROR = "DomError:";
declare const PARSER_ERROR = "ParserError:";

/**
 * Checks if a node matches one or mode CSS selectors.
 * @param node The `DOMNode` object to test against the selector.
 * @param selector The CSS selector string.
 * @returns `true` if the node matches the selector, `false` otherwise.
 */
declare const matchesSelector: (node: DOMNode, selector: string) => boolean;

export { ChildLike, ChildNode, DOMNode, DOM_ERROR, NodeLike, NodeLikeAttributes, PARSER_ERROR, RootLike, RootNode, charCodeAt, defineProperties, endsWith, fromCharCode, isNode, isObj, isPrimitive, isRoot, isTag, matchesSelector, selfClosingTags, startsWith, toLowerCase, toUpperCase };
