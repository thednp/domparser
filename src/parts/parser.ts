import {
  getBaseAttributes,
  selfClosingTags,
  tokenize,
  toUpperCase,
} from "./util.ts";
import type {
  CommentLike,
  NodeLike,
  ParseResult,
  RootLike,
  TextLike,
} from "./types";

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
export function Parser() {
  return {
    parseFromString(htmlString?: string): ParseResult {
      const root: RootLike = { nodeName: "#document", children: [] };
      if (!htmlString) return { root, tags: [], components: [] };

      const stack: (RootLike | NodeLike)[] = [root];
      const components = new Set<string>();
      const tags = new Set<string>();

      tokenize(htmlString).forEach((token) => {
        const { nodeType, value, isSC } = token;
        const currentParent = stack[stack.length - 1];
        if (nodeType === "doctype") return;

        if (["text", "comment"].includes(nodeType)) {
          currentParent.children.push(
            {
              nodeName: `#${nodeType}`,
              nodeValue: value,
            } as CommentLike | TextLike,
          );
          return;
        }

        const isClosing = value.startsWith("/");
        const tagName =
          (isClosing ? value.slice(1) : value.split(/[\s/>]/)[0]) as NodeLike[
            "tagName"
          ];
        const isSelfClosing = isSC ||
          selfClosingTags.has(tagName);

        // Register tag type
        (tagName[0] === toUpperCase(tagName[0]) ||
            tagName.includes("-")
          ? components
          : tags).add(tagName);

        if (!isClosing) {
          const node: NodeLike = {
            tagName,
            nodeName: toUpperCase(tagName),
            attributes: getBaseAttributes(value),
            children: [],
          };

          currentParent.children.push(node);
          !isSelfClosing && stack.push(node);
        } else if (!isSelfClosing && stack.length > 1) {
          stack.pop();
        }
      });

      return {
        root,
        components: Array.from(components),
        tags: Array.from(tags),
      };
    },
  };
}
