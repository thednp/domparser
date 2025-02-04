export type ParserOptions = {
  filterTags?: string[];
  filterAttrs?: string[];
};

export type RootNode = {
  nodeName: string;
  children: DOMLike[];
};

export type DOMLike = {
  tagName?: string;
  nodeName: string;
  attributes: Record<string, string>;
  children: DOMLike[];
  nodeValue?: string;
};

export type ParseResult = {
  root: RootNode;
  components: string[];
  tags: string[];
};

export type HTMLToken = {
  nodeType: string;
  value: string;
  isSC?: boolean;
};

const toLowerCase = (str: string): string => str.toLowerCase();
const toUpperCase = (str: string): string => str.toUpperCase();
const startsWith = (str: string, prefix: string): boolean =>
  str.startsWith(prefix);
const endsWith = (str: string, suffix: string): boolean => str.endsWith(suffix);
const charCodeAt = (str: string, index: number): number =>
  str.charCodeAt(index);

/**
 * A basic tool for HTML entities encoding
 * @param str the source string
 * @returns the encoded string
 */
export const encodeEntities = (str: string): string =>
  str.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] || /* istanbul ignore next @preserve */ char));

/**
 * Sanitizes URLs in attribute values
 * @param url the URL
 * @returns the sanitized URL
 */
export const sanitizeUrl = (url: string): string => {
  const decoded = decodeURIComponent(url.trim());
  if (/^(?:javascript|data|vbscript):/i.test(decoded)) return "";
  return encodeEntities(decoded);
};

/**
 * Sanitizes attribute values
 * @param name the attribute name
 * @param initialValue the attribute value
 * @returns the sanitized value
 */
export const sanitizeAttrValue = (
  name: string,
  initialValue: string,
): string => {
  if (!initialValue) return "";
  const value = initialValue.trim();

  // Special handling for URL attributes
  if (
    name === "src" || name === "href" || name === "action" ||
    name === "formaction" || endsWith(name, "url")
  ) {
    return sanitizeUrl(value);
  }

  return encodeEntities(value);
};

/**
 * Get attributes from a string token and return an object
 * where the keys are the names of the attributes and the values
 * are the sanitized values of the attributes.
 *
 * @param tagStr the tring token
 * @param unsafeAttrs an optional set of unsafe attributes
 * @returns the attributes object
 */
export const getAttributes = (
  tagStr: string,
  unsafeAttrs: Set<string> = new Set(),
): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const parts = tagStr.split(/\s+/);
  if (parts.length < 2) return attrs;

  const attrStr = tagStr.slice(parts[0].length);
  let match: unknown;
  const attrRegex = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;

  while ((match = attrRegex.exec(attrStr))) {
    const [, name, d, s, u] = match as RegExpMatchArray;
    if (name && name !== "/" && !unsafeAttrs.has(toLowerCase(name))) {
      attrs[name] = sanitizeAttrValue(toLowerCase(name), d ?? s ?? u ?? "");
    }
  }

  return attrs;
};

const rootNode: RootNode = {
  nodeName: "#document",
  children: [],
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
export function Parser(config: Partial<ParserOptions> = {}) {
  const selfClosingTags = new Set([
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

  // Common dangerous tags that could lead to XSS
  const unsafeTags = new Set<string>();

  // Unsafe attributes that could lead to XSS
  const unsafeAttrs = new Set<string>();

  // Apply config
  /* istanbul ignore else @preserve */
  if (config) {
    const { filterTags, filterAttrs } = config;
    if (filterTags) filterTags.forEach((tag) => unsafeTags.add(tag));
    if (filterAttrs) filterAttrs.forEach((attr) => unsafeAttrs.add(attr));
  }

  const tokenize = (html: string): HTMLToken[] => {
    const tokens: HTMLToken[] = [];
    let token = "",
      inTag = false,
      inQuote = false,
      quote = 0,
      isComment = false;

    for (let i = 0; i < html.length; i++) {
      const char = charCodeAt(html, i);

      if (isComment) {
        token += String.fromCharCode(char);
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
        token += String.fromCharCode(char);
        continue;
      }

      if (char === 60 /* 0x3c */ && !inQuote) { // <
        token.trim() && tokens.push({
          nodeType: "text",
          value: encodeEntities(token.trim()),
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
          // console.log({ token, isDocType });
          tokens.push({
            nodeType: isDocType ? "doctype" : "tag",
            value: isSC ? token.slice(0, -1).trim() : token.trim(),
            isSC,
          });
        }
        token = "";
        inTag = false;
      } else {
        token += String.fromCharCode(char);
      }
    }

    token.trim() && tokens.push({
      nodeType: "text",
      value: encodeEntities(token.trim()),
      isSC: false,
    });
    return tokens;
  };

  return {
    parseFromString(htmlString?: string) {
      const root: RootNode = { ...rootNode, children: [] };
      if (!htmlString) return { root, components: [], tags: [] };

      const stack = [root];
      const components = new Set<string>();
      const tags = new Set<string>();
      let parentIsSafe = true;

      tokenize(htmlString).forEach((token) => {
        const { nodeType, value, isSC } = token;
        // Skip doctype, we already have a root
        if (nodeType === "doctype") return;

        if (["text", "comment"].includes(nodeType)) {
          stack[stack.length - 1].children.push({
            nodeName: `#${nodeType}`,
            nodeValue: nodeType === "text" ? value : `<${value}>`,
          } as DOMLike);
          return;
        }

        const isClosing = startsWith(value, "/");
        const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
        const tagNameLower = toLowerCase(tagName);
        const isSelfClosing = isSC || selfClosingTags.has(tagNameLower);

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

        // Register tag type
        (tagName[0] === toUpperCase(tagName[0]) || tagName.includes("-")
          ? components
          : tags).add(tagName);

        if (!isClosing) {
          const node = {
            tagName,
            nodeName: toUpperCase(tagName),
            attributes: getAttributes(value, unsafeAttrs),
            children: [],
          };

          stack[stack.length - 1].children.push(node);
          !isSelfClosing && stack.push(node);
        } else if (!isSelfClosing && stack.length > 1) {
          stack.pop();
        }
      });

      return {
        root,
        components: Array.from(components),
        tags: Array.from(tags),
      } satisfies ParseResult;
    },
  };
}
