// util.ts
import type {
  ChildLike,
  ChildNode,
  DOMNode,
  GetAttributesOptions,
  HTMLToken,
  NodeLike,
  NodeLikeAttributes,
  RootLike,
  RootNode,
} from "./types.ts";

// general utils

export const ATTR_REGEX = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;

/**
 * Get attributes from a string token and return an object
 * @param tagStr the string token
 * @returns the attributes object
 */
export const getBaseAttributes = (tagStr: string) => {
  const attrs: NodeLikeAttributes = {};
  const parts = tagStr.split(/\s+/);
  if (parts.length < 2) return attrs;

  const attrStr = tagStr.slice(parts[0].length);
  let match: RegExpExecArray | null;

  while ((match = ATTR_REGEX.exec(attrStr))) {
    const [, name, d, s, u] = match;
    name !== "/" && (attrs[name] = d ?? s ?? u ?? "");
  }

  return attrs;
};

/**
 * Get attributes from a string token and return an object.
 * In addition to the base tool, this also filters configured
 * unsafe attributes.
 * @param tagStr the string token
 * @param config an optional set of options
 * @returns the attributes object
 */
export const getAttributes = (
  tagStr: string,
  config?: Partial<GetAttributesOptions>,
): NodeLikeAttributes => {
  const { unsafeAttrs } = config || {};
  const baseAttrs = getBaseAttributes(tagStr);
  const attrs: NodeLikeAttributes = {};

  for (const [key, value] of Object.entries(baseAttrs)) {
    if (!unsafeAttrs || !unsafeAttrs?.has(toLowerCase(key))) {
      attrs[key] = value;
    }
  }

  return attrs;
};

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
 * @param position The position to start looking from.
 * @returns `true` if the string starts with the prefix, `false` otherwise.
 */
export const startsWith = (
  str: string,
  prefix: string,
  position?: number,
): boolean => str.startsWith(prefix, position);

/**
 * Checks if a string ends with a specified suffix.
 * @param str The string to check.
 * @param suffix The suffix to search for.
 * @param position The position to start looking from.
 * @returns `true` if the string ends with the suffix, `false` otherwise.
 */
export const endsWith = (
  str: string,
  suffix: string,
  position?: number,
): boolean => str.endsWith(suffix, position);

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
 * Trim a string value.
 * @param str A string value
 * @returns The trimmed value of the same string.
 */
export const trim = (str: string) => str.trim();

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

export const escape = (str: string) => {
  if ((str === null) || (str === "")) {
    return false;
  } else {
    str = str.toString();
  }

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return str.replace(/[&<>"']/g, (m) => {
    return map[m];
  });
};

/**
 * Tokenizes an HTML string into an array of HTML tokens.
 * These tokens represent opening tags, closing tags, text content, and comments.
 * @param html The HTML string to tokenize.
 * @returns An array of `HTMLToken` objects.
 */
export const tokenize = (html: string): HTMLToken[] => {
  const specialTags = ["script", "style"];
  const tokens: HTMLToken[] = [];
  const len = html.length;
  let token = "",
    inTag = false,
    inQuote = false,
    quote = 0,
    inTemplate = false,
    inComment = false,
    inCDATA = false,
    inStyleScript = false;

  for (let i = 0; i < len; i++) {
    const char = charCodeAt(html, i);

    if (inComment) {
      token += fromCharCode(char);
      /* istanbul ignore else @preserve */
      if (endsWith(token, "--") && charCodeAt(html, i + 1) === 62 /* > */) {
        tokens.push({
          nodeType: "comment",
          value: `<${trim(token)}>`,
          isSC: false,
        });
        inComment = false;
        token = "";
        i += 1;
      }
      continue;
    }

    if (inCDATA) {
      token += fromCharCode(char);
      /* istanbul ignore else @preserve */
      if (endsWith(token, "]]") && charCodeAt(html, i + 1) === 62 /* > */) {
        tokens.push({
          nodeType: "text",
          value: `<${escape(trim(token))}>`,
          isSC: false,
        });
        inCDATA = false;
        token = "";
        i += 1;
      }
      continue;
    }

    if (inStyleScript) {
      const endSpecialTag = specialTags.find((t) =>
        startsWith(html, `/${t}`, i + 1)
      );
      if (char === 60 && endSpecialTag && !inTag && !inTemplate && !inQuote) { // <
        inStyleScript = false;
      }
      if (char === 96) { // ` | 0x60
        inTemplate = !inTemplate;
      }
    }

    // " or ' | 0x22 or 0x27
    if (
      (inTag && token.includes("=") || inStyleScript) &&
      (char === 34 || char === 39)
    ) {
      if (!inQuote) {
        quote = char;
        inQuote = true;
      } else if (char === quote) {
        inQuote = false;
      }

      token += fromCharCode(char);
      continue;
    }

    // else
    if (char === 60 && !inQuote && !inTemplate && !inStyleScript) { // <
      trim(token) &&
        tokens.push({
          nodeType: "text",
          value: trim(token),
          isSC: false,
        });
      token = "";
      inTag = true;

      if (startsWith(html, "!--", i + 1)) {
        inComment = true;
        token += "!--";
        i += 3;
        continue;
      }
      if (startsWith(html, "![CDATA[", i + 1)) {
        inCDATA = true;
        token += "![CDATA[";
        i += 8;
        continue;
      }
    } else if (
      char === 62 && inTag && !inQuote && !inTemplate && !inComment &&
      !inStyleScript && !inCDATA
    ) { // >
      const startSpecialTag = specialTags.find((t) =>
        t === token || startsWith(token, t)
      );
      if (startSpecialTag) {
        inStyleScript = true;
      }
      // handle doctype tag
      const isDocType = startsWith(toLowerCase(token), "!doctype");
      /* istanbul ignore else @preserve */
      if (token) {
        const isSC = endsWith(token, "/");
        tokens.push({
          nodeType: isDocType ? "doctype" : "tag",
          value: isSC ? trim(token.slice(0, -1)) : trim(token),
          isSC,
        });
      }
      token = "";
      inTag = false;
    } else {
      token += fromCharCode(char);
    }
  }

  trim(token) &&
    tokens.push({ nodeType: "text", value: trim(token), isSC: false });

  return tokens;
};

export const DOM_ERROR = "DomParserError:";
