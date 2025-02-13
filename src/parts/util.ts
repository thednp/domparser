// util.ts
import type {
  ChildLike,
  ChildNode,
  DOMNode,
  NodeLike,
  NodeLikeAttributes,
  RootLike,
  RootNode,
} from "./types";

// general utils

/**
 * Converts a string to lowercase.
 * @param str The string to convert.
 * @returns The lowercase string.
 */
export const toLowerCase = (str: string): string => str.toLowerCase();

/**
 * Converts a string to uppercase.
 * @param str The string to convert.
 * @returns The uppercase string.
 */
export const toUpperCase = (str: string): string => str.toUpperCase();

/**
 * Checks if a string starts with a specified prefix.
 * @param str The string to check.
 * @param prefix The prefix to search for.
 * @returns `true` if the string starts with the prefix, `false` otherwise.
 */
export const startsWith = (str: string, prefix: string): boolean =>
  str.startsWith(prefix);

/**
 * Checks if a string ends with a specified suffix.
 * @param str The string to check.
 * @param suffix The suffix to search for.
 * @returns `true` if the string ends with the suffix, `false` otherwise.
 */
export const endsWith = (str: string, suffix: string): boolean =>
  str.endsWith(suffix);

/**
 * Creates a string from a character code.
 * @param char The character code.
 * @returns The string representation of the character code.
 */
export const fromCharCode = (char: number): string => String.fromCharCode(char);

/**
 * Returns the character code at a specific index in a string.
 * @param str The string to check.
 * @param index The index of the character to get the code for.
 * @returns The character code at the specified index.
 */
export const charCodeAt = (str: string, index: number): number =>
  str.charCodeAt(index);

/**
 * Defines a property on an object.
 * @param obj The object to define the property on.
 * @param propName The name of the property.
 * @param desc The property descriptor.
 * @returns The object after defining the property.
 */
// export const defineProperty = <T extends Record<string, unknown>>(
//   obj: T,
//   propName: PropertyKey,
//   desc: PropertyDescriptor,
// ): T => Object.defineProperty(obj, propName, desc);

/**
 * Defines multiple properties on an object.
 * @param obj The object to define properties on.
 * @param props An object where keys are property names and values are property descriptors.
 * @returns The object after defining the properties.
 */
export const defineProperties = <T extends Record<string, unknown>>(
  obj: T,
  props: Record<PropertyKey, PropertyDescriptor>,
): T => Object.defineProperties(obj, props);

// Type guards

/**
 * Checks if a node is an object.
 * @param node The object to check.
 * @returns `true` if the node is an object, `false` otherwise.
 */
export const isObj = (node: unknown) =>
  node !== null && typeof node === "object";

/**
 * Checks if a node is a root object (`RootNode` or `RootLike`).
 * @param node The object to check.
 * @returns `true` if the node is an object, `false` otherwise.
 */
export const isRoot = (
  node: RootLike | RootNode | ChildLike | ChildNode,
): node is RootLike | RootNode =>
  isObj(node) && isNode(node as unknown as ChildLike) &&
  node.nodeName === "#document";

/**
 * Checks if a node is a tag node (`NodeLike` or `DOMNode`).
 * @param node The node to check.
 * @returns `true` if the node is a tag node, `false` otherwise.
 */
export const isTag = (
  node: ChildLike | ChildNode,
): node is NodeLike | DOMNode => isObj(node) && "tagName" in node;

/**
 * Checks if a node is a root node (`RootLike` or `RootNode`),
 * a tag node (`NodeLike` or `DOMNode`), a comment node
 * (`CommentLike` or `CommentNode`) or text node (`TextLike` or `TextNode`).
 * @param node The node to check.
 * @returns `true` if the node is a tag node, `false` otherwise.
 */
export const isNode = (
  node: ChildLike | ChildNode | NodeLikeAttributes | string | number,
): node is ChildLike | NodeLike | DOMNode => isObj(node) && "nodeName" in node;

/**
 * Checks if a value is a primitive (number or string).
 * @param val The value to check.
 * @returns `true` if the value is a primitive, `false` otherwise.
 */
export const isPrimitive = <T extends (number | string)>(
  val: unknown,
): val is T => typeof val === "string" || typeof val === "number";

/**
 * Set of self-closing HTML tags used by the `Parser`.
 */
export const selfClosingTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "path",
  "circle",
  "ellipse",
  "line",
  "rect",
  "use",
  "stop",
  "polygon",
  "polyline",
]);

export const DOM_ERROR = "DomError:";
export const PARSER_ERROR = "ParserError:";
