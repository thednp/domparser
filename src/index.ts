import type { DOMNode, HTMLToken, ParseResult } from "./types";

/** A full list of self-closing tags */
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

/**
 * Returns a quoted string if the key is a valid identifier,
 * otherwise returns the original key.
 * @param key
 * @returns
 */
const quoteText = (key: string) =>
  /^[a-zA-Z_][a-zA-Z_0-9]+$/.test(key) ? key : `"${key}"`;

/**
 * A basic HTML parser that takes a string of HTML and returns a simple DOM representation.
 * The parser handles basic HTML elements, attributes, and text content.
 * The DOM representation is a plain object with the following structure:
 * ```
 * {
 *     tagName?: string,
 *     nodeName: string,
 *     attributes: {
 *         [key: string]: string
 *     },
 *     children: [
 *         {
 *             tagName?: string,
 *             attributes: {
 *                 [key: string]: string
 *             },
 *             children: [...],
 *             value: string
 *         }
 *     ]
 * }
 * ```
 */
export default class DOMParser {
  static selfClosingTags = selfClosingTags;
  static quoteText = quoteText;
  tags = new Set<string>();
  components = new Set<string>();
  root: DOMNode = { nodeName: "#document", attributes: {}, children: [] };
  stack: Array<DOMNode> = [this.root];
  currentNode: DOMNode = this.root;

  /**
   * Returns a simple DOM representation of the parsed HTML.
   * @param htmlString The string of HTML to be parsed.
   * @return the parsed result.
   */
  parseFromString(htmlString: string): ParseResult {
    const tokens = this.tokenize(htmlString);
    this.parseTokens(tokens);
    const root = this.root;
    return {
      root,
      components: Array.from(this.components),
      tags: Array.from(this.tags),
    };
  }

  /**
   * Parse a string of HTML and return an array of tokens
   * where each token is an object with a type property and a value property.
   *
   * @param htmlString The string of HTML to be tokenized.
   * @return The array of tokens.
   */
  tokenize(htmlString: string): Array<HTMLToken> {
    const tokens = [];
    let currentToken = "";
    let inTag = false;
    let inQuote = false;
    let quoteChar = 0x22;

    for (let i = 0; i < htmlString.length; i++) {
      const charCode = htmlString.charCodeAt(i);

      // Handle quotes inside tags
      if (inTag && (charCode === 0x22 /* " */ || charCode === 0x27 /* ' */)) {
        /* istanbul ignore else @preserve */
        if (!inQuote) {
          inQuote = true;
          quoteChar = charCode;
        } else if (charCode === quoteChar) {
          inQuote = false;
        }
        currentToken += String.fromCharCode(charCode);
        continue;
      }

      if (charCode === 0x3c /* < */ && !inQuote) {
        if (currentToken.trim()) {
          tokens.push({ type: "text", value: currentToken.trim() });
        }
        currentToken = "";
        inTag = true;
      } else if (charCode === 0x3e /* > */ && !inQuote) {
        /* istanbul ignore else @preserve */
        if (currentToken) {
          // Check if it's a self-closing tag
          const isSelfClosing = currentToken.endsWith("/");
          if (isSelfClosing) {
            currentToken = currentToken.slice(0, -1);
          }
          tokens.push({
            type: "tag",
            value: currentToken.trim(),
            isSelfClosing,
          });
        }
        currentToken = "";
        inTag = false;
      } else {
        currentToken += String.fromCharCode(charCode);
      }
    }

    /* istanbul ignore if @preserve */
    if (currentToken.trim()) {
      tokens.push({
        type: "text",
        value: currentToken.trim(),
        isSelfClosing: false,
      });
    }

    return tokens;
  }

  /**
   * Parse an array of tokens into a DOM representation.
   * @param tokens An array of tokens to be parsed.
   */
  parseTokens(tokens: Array<HTMLToken>) {
    // reset parser state
    this.root = { nodeName: "#document", attributes: {}, children: [] };
    this.stack = [this.root];
    this.currentNode = this.root;

    // iterate over tokens
    for (const token of tokens) {
      let tagName = this.getTagName(token.value);
      const isClosingTag = token.value.startsWith("/");
      const isSelfClosing = token.isSelfClosing;

      tagName = isClosingTag
        ? token.value.slice(1)
        : this.getTagName(token.value);

      /* istanbul ignore else @preserve */
      if (token.type === "tag") {
        tagName = tagName.replace(/\/$/, ""); // Remove trailing slash for self-closing tags
        const isComponent = tagName[0].toUpperCase() === tagName[0] ||
          tagName.includes("-");

        if (isComponent) {
          this.components.add(tagName);
        } else {
          this.tags.add(tagName);
        }

        if (!isClosingTag) {
          const newNode = {
            tagName,
            nodeName: tagName.toUpperCase(),
            attributes: isSelfClosing ? {} : this.getAttributes(token.value),
            isSelfClosing,
            children: [],
          };

          if (isSelfClosing) {
            // Handle self-closing tag
            this.currentNode.children.push(newNode);
            // Don't push to stack since self-closing tags don't wrap content
          } else {
            this.currentNode.children.push(newNode);
            this.stack.push(newNode);
            this.currentNode = newNode;
          }
        } else {
          this.stack.pop();
          /* istanbul ignore else @preserve */
          if (this.stack.length > 0) {
            this.currentNode = this.stack[this.stack.length - 1];
          }
        }
      } else if (token.type === "text") {
        const textNode = {
          nodeName: "#text",
          attributes: {},
          children: [],
          value: token.value,
        };
        this.currentNode.children.push(textNode);
      }
    }
  }

  /**
   * Returns the name of the tag.
   * @param tagString A string of HTML that represents a tag.
   * @return The name of the tag.
   */
  getTagName(tagString: string): string {
    return tagString.split(/[\s/>]/)[0];
  }

  /**
   * Returns an object where the keys are the names of the attributes
   * and the values are the values of the attributes.
   *
   * @param tagString A string of HTML that represents a tag.
   * @return an object where the keys are the names of the attributes and the values are the values of the attributes.
   */
  getAttributes(tagString: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrRegex = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
    const tagParts = tagString.split(/\s+/);

    if (tagParts.length < 2) return attributes;

    const attrString = tagString.slice(tagParts[0].length);
    let match;

    while ((match = attrRegex.exec(attrString)) !== null) {
      const [, name, doubleQuoted, singleQuoted, unquoted] = match;
      /* istanbul ignore else @preserve */
      if (name && name !== "/") {
        attributes[name] = doubleQuoted ||
          /* istanbul ignore next @preserve */ singleQuoted ||
          /* istanbul ignore next @preserve */ unquoted ||
          /* istanbul ignore next @preserve */ "";
      }
    }

    return attributes;
  }
}
