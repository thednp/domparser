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
  TokenizerOptions,
} from "./types.ts";

// general utils

export const ATTR_REGEX = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;

/**
 * Get attributes from a string token and return an object
 * @param token the string token
 * @returns the attributes object
 */
export const getBaseAttributes = (token: string) => {
  const attrs: NodeLikeAttributes = {};
  const [tagName, ...parts] = token.split(/\s+/);
  if (parts.length < 1) return attrs;

  const attrStr = token.slice(tagName.length);
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
  "?xml",
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
    return "";
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

export const DOM_ERROR = "DomParserError:";
const DEFAULT_CHUNK_SIZE = 64 * 1024; // 65536 = 64KB
const DEFAULT_MAX_SCRIPT_SIZE = 128 * 1024; // 131072 = 128KB

/**
 * Tokenizes an HTML string into an array of HTML tokens.
 * These tokens represent opening tags, closing tags, text content, and comments.
 * @param html The HTML string to tokenize.
 * @returns An array of `HTMLToken` objects.
 */
export const tokenize = (
  html: string,
  options: TokenizerOptions = {},
): HTMLToken[] => {
  const {
    maxScriptSize = DEFAULT_MAX_SCRIPT_SIZE,
    chunkSize = DEFAULT_CHUNK_SIZE,
  } = options;

  const specialTags = ["script", "style"] as const;
  const tokens: HTMLToken[] = [];
  const len = html.length;
  const COM_START = ["!--", "![CDATA["];
  const COM_END = ["--", "]]"];
  let COM_TYPE = 0; // [0 = #comment, 1 = CDATA]

  let token = "";
  let scriptContent = "";
  let inTag = false;
  let inQuote = false;
  let quote = 0;
  let inPre = false;
  let inTemplate = false;
  let inComment = false;
  let inStyleScript = false;
  let currentChunkStart = 0;

  while (currentChunkStart < len) {
    const chunkEnd = Math.min(currentChunkStart + chunkSize, len);
    const chunk = html.slice(currentChunkStart, chunkEnd);

    for (let i = 0; i < chunk.length; i++) {
      const globalIndex = currentChunkStart + i;
      const char = charCodeAt(chunk, i);

      if (inStyleScript) {
        const endSpecialTag = specialTags.find((t) =>
          startsWith(html, `/${t}`, globalIndex + 1)
        );

        if (char === 60 && endSpecialTag && !inTemplate && !inQuote) { // <
          // istanbul ignore else @preserve
          if (scriptContent.length < maxScriptSize) {
            tokens.push({
              tokenType: "text",
              value: trim(scriptContent),
              isSC: false,
            });
          }
          tokens.push({
            tokenType: "tag",
            value: "/" + endSpecialTag,
            isSC: false,
          });
          scriptContent = "";
          inStyleScript = false;
          i += endSpecialTag.length + 2;
        } else {
          // istanbul ignore next @preserve - don't crash the test!!
          if (scriptContent.length >= maxScriptSize) {
            // Once we hit the limit, just skip content until closing tag
            continue;
          }
          if (char === 96) { // ` | 0x60
            inTemplate = !inTemplate;
            // " or ' | 0x22 or 0x27
          } else if (!inTemplate && (char === 34 || char === 39)) {
            // istanbul ignore else @preserve
            if (!inQuote) {
              quote = char;
              inQuote = true;
            } else if (char === quote) {
              inQuote = false;
            }
          }
          scriptContent += fromCharCode(char);
        }
        continue;
      }

      if (inComment) {
        token += fromCharCode(char);
        if (
          endsWith(token, COM_END[COM_TYPE]) &&
          charCodeAt(html, globalIndex + 1) === 62
        ) { // >
          const tokenValue = COM_TYPE === 1 ? escape(token) : token;
          tokens.push({
            tokenType: "comment",
            value: `<${trim(tokenValue)}>`,
            isSC: false,
          });
          inComment = false;
          token = "";
          i += 1;
        }
        continue;
      }

      if (
        (inTag && token.includes("=")) &&
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

      if (
        char === 60 && !inQuote && !inTemplate
      ) { // 0x3c | "<"
        const value = trim(token);
        value &&
          tokens.push({
            tokenType: "text",
            value: inPre ? token : value,
            isSC: false,
          });
        token = "";

        const commentStart = COM_START.find((cs) =>
          startsWith(html, cs, globalIndex + 1)
        );
        if (commentStart) {
          COM_TYPE = COM_START.indexOf(commentStart);
          inComment = true;
          token += commentStart;
          i += commentStart.length;
          continue;
        }

        inTag = true;
      } else if (
        char === 62 && inTag && !inTemplate
      ) { // 0x3e | ">"
        if (token === "/pre") {
          inPre = false;
        } else if (token === "pre" || startsWith(token, "pre")) {
          inPre = true;
        }
        const startSpecialTag = specialTags.find((t) =>
          t === token || startsWith(token, t)
        );
        if (startSpecialTag && !endsWith(token, "/")) {
          inStyleScript = true;
        }

        const isDocType = startsWith(toLowerCase(token), "!doctype");

        // istanbul ignore else @preserve
        if (token) {
          const isSC = endsWith(token, "/");
          const [tagName] = token.split(/\s/);
          const value = inQuote ? tagName + (isSC ? "/" : "") : token;
          tokens.push({
            tokenType: isDocType ? "doctype" : "tag",
            value: isSC ? trim(value.slice(0, -1)) : trim(value),
            isSC,
          });
        }
        token = "";
        inTag = false;
        inQuote = false;
      } else {
        token += fromCharCode(char);
      }
    }
    currentChunkStart = chunkEnd;
  }

  const lastToken = trim(token);
  if (lastToken) {
    tokens.push({
      tokenType: "text",
      value: lastToken,
      isSC: false,
    });
  }

  return tokens;
};
