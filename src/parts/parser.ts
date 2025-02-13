import type {
  ChildLike,
  CommentLike,
  DOMNode,
  GetAttributesOptions,
  HTMLToken,
  NodeLike,
  NodeLikeAttributes,
  ParseResult,
  ParserOptions,
  RootLike,
  TextLike,
} from "./types";

import {
  charCodeAt,
  endsWith,
  fromCharCode,
  isTag,
  selfClosingTags,
  startsWith,
  toLowerCase,
  toUpperCase,
} from "./util";

/**
 * Get attributes from a string token and return an object
 * @param tagStr the string token
 * @param config an optional set of options
 * @returns the attributes object
 */
export const getAttributes = (
  tagStr: string,
  config?: Partial<GetAttributesOptions>,
): NodeLikeAttributes => {
  const { sanitizeFn, unsafeAttrs } = config || {};
  const attrs: NodeLikeAttributes = {};
  const parts = tagStr.split(/\s+/);
  if (parts.length < 2) return attrs;

  const attrStr = tagStr.slice(parts[0].length);
  const attrRegex = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(attrStr))) {
    const [, name, d, s, u] = match;
    const value = d ?? s ?? u ?? "";
    if (name && name !== "/" && (!unsafeAttrs?.has(toLowerCase(name)))) {
      attrs[name] = sanitizeFn ? sanitizeFn(toLowerCase(name), value) : value;
    }
  }

  return attrs;
};

/**
 * Tokenizes an HTML string into an array of HTML tokens.
 * These tokens represent opening tags, closing tags, text content, and comments.
 * @param html The HTML string to tokenize.
 * @returns An array of `HTMLToken` objects.
 */
export const tokenize = (html: string): HTMLToken[] => {
  const tokens: HTMLToken[] = [];
  let token = "",
    inTag = false,
    inQuote = false,
    quote = 0,
    isComment = false;

  for (let i = 0; i < html.length; i++) {
    const char = charCodeAt(html, i);

    if (isComment) {
      token += fromCharCode(char);
      if (endsWith(token, "--")) {
        /* istanbul ignore else @preserve */
        if (charCodeAt(html, i + 1) === 62 /* > */) {
          tokens.push({
            nodeType: "comment",
            value: token.trim(),
            isSC: false,
          });
          token = "";
          isComment = false;
          i++;
        }
      }
      continue;
    }

    if (inTag && (char === 34 || char === 39)) { // " or ' | 0x22 or 0x27
      if (!inQuote) {
        quote = char;
        inQuote = true;
      } else if (char === quote) inQuote = false;
      token += fromCharCode(char);
      continue;
    }

    if (char === 60 /* 0x3c */ && !inQuote) { // <
      token.trim() && tokens.push({
        nodeType: "text",
        // value: encodeEntities(token.trim()),
        value: (token.trim()),
        isSC: false,
      });
      token = "";
      inTag = true;
      if (
        charCodeAt(html, i + 1) === 33 /* ! | 0x21 */ &&
        charCodeAt(html, i + 2) === 45 /* - | 0x2d */ &&
        charCodeAt(html, i + 3) === 45 /* - | 0x2d */
      ) {
        isComment = true;
        token += "!--";
        i += 3;
        continue;
      }
    } else if (char === 62 /* 0x3e */ && !inQuote && inTag && !isComment) { // > | 0x3e
      /* istanbul ignore else @preserve */
      if (token) {
        const isSC = endsWith(token, "/");
        const isDocType = startsWith(token, "!doctype");

        tokens.push({
          nodeType: isDocType ? "doctype" : "tag",
          value: isSC ? token.slice(0, -1).trim() : token.trim(),
          isSC,
        });
      }
      token = "";
      inTag = false;
    } else {
      token += fromCharCode(char);
    }
  }

  token.trim() && tokens.push({
    nodeType: "text",
    // value: encodeEntities(token.trim()),
    value: (token.trim()),
    isSC: false,
  });
  return tokens;
};

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
export function Parser(config: Partial<ParserOptions> = {}) {
  // Common dangerous tags that could lead to XSS
  let unsafeTags = new Set<string>();

  // Unsafe attributes that could lead to XSS
  let unsafeAttrs = new Set<string>();

  // Apply config
  const { filterTags, filterAttrs, onNodeCallback, sanitizeFn } = config;
  if (filterTags?.length) unsafeTags = new Set(filterTags);
  if (filterAttrs?.length) unsafeAttrs = new Set(filterAttrs);
  const getAttrOptions = { unsafeAttrs } as GetAttributesOptions;
  // don't override the default function unless it's actualy set
  if (typeof sanitizeFn === "function") getAttrOptions.sanitizeFn = sanitizeFn;

  return {
    parseFromString(htmlString?: string) {
      const root: RootLike = {
        nodeName: "#document",
        childNodes: [],
        children: [],
        all: [],
      };
      if (!htmlString) return { root, components: [], tags: [] };

      const stack: (RootLike | NodeLike)[] = [root];
      const tagStack: string[] = [];
      const components = new Set<string>();
      const tags = new Set<string>();
      let parentIsSafe = true;
      let newNode: ChildLike;

      const append = (
        node: ChildLike,
        parent: RootLike | DOMNode | NodeLike,
      ) => {
        // here we call the callback coming from Dom
        // or any other parent functionality
        // we allow that to store the DOM tree
        if (onNodeCallback) {
          onNodeCallback(node, parent as DOMNode, root);
        } else {
          if (isTag(node)) {
            parent.children.push(node);
            root.all.push(node);
          }
          parent.childNodes.push(node);
        }
      };

      tokenize(htmlString).forEach((token) => {
        const { nodeType, value, isSC } = token;
        // Skip doctype, but store it as a root property
        if (nodeType === "doctype") {
          root.doctype = `<${value}>`;
          return;
        }
        const currentParent = stack[stack.length - 1];

        if (["text", "comment"].includes(nodeType)) {
          newNode = {
            nodeName: `#${nodeType}`,
            nodeValue: nodeType === "text" ? value : `<${value}>`,
          } as TextLike | CommentLike;
          append(newNode, currentParent);
          return;
        }

        const isClosing = startsWith(value, "/");
        const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
        const tagNameLower = toLowerCase(tagName);
        const isSelfClosing = isSC || selfClosingTags.has(tagNameLower);

        // Tag Matching Detection Logic
        if (!isSelfClosing) {
          // Start Tag (and not self-closing)
          if (!isClosing) {
            // Push tag name onto the tag stack
            tagStack.push(tagName);
            // Closing Tag
          } else {
            // Pop the last opened tag
            const expectedTag = tagStack.pop();
            if (expectedTag !== tagName) {
              if (expectedTag === undefined) {
                throw new Error(
                  `ParserError: Mismatched closing tag: </${tagName}>. No open tag found.`,
                );
              } else {
                throw new Error(
                  `ParserError: Mismatched closing tag: </${tagName}>. Expected closing tag for <${expectedTag}>.`,
                );
              }
            }
          }
        }

        // Skip unsafe tags
        if (unsafeTags.has(tagNameLower)) {
          if (isClosing) {
            parentIsSafe = true;
          } else {
            parentIsSafe = false;
          }
          return;
        }

        if (!parentIsSafe) return;

        // Register tag/component type
        (tagName[0] === toUpperCase(tagName[0]) || tagName.includes("-")
          ? components
          : tags).add(tagName);

        if (!isClosing) {
          newNode = {
            tagName,
            nodeName: toUpperCase(tagName),
            attributes: getAttributes(value, getAttrOptions),
            children: [],
            childNodes: [],
          } as NodeLike;

          const charset = newNode.attributes?.charset;
          if (tagName === "meta" && charset) {
            root.charset = toUpperCase(charset);
          }

          append(newNode, currentParent);
          !isSelfClosing && stack.push(newNode);
        } else if (!isSelfClosing && stack.length > 1) {
          stack.pop();
        }
      });

      // Check for unclosed tags at the end
      // actually not possible to reach this point
      // since it throws at first mismatch
      // if (tagStack.length > 0) {
      //   const unclosedTag = tagStack.pop();
      //   throw new Error(`ParserError: Unclosed tag: <${unclosedTag}>.`);
      // }

      return {
        root,
        components: Array.from(components),
        tags: Array.from(tags),
      } satisfies ParseResult;
    },
  };
}
