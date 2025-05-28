// prototype.ts
import { tokenize, trim } from "./util.ts";
import { matchesSelector } from "./selectors.ts";
import {
  defineProperties,
  DOM_ERROR,
  isNode,
  isObj,
  isPrimitive,
  isRoot,
  isTag,
  selfClosingTags,
  toUpperCase,
} from "./util.ts";

import type {
  ChildElementList,
  ChildNode,
  ChildNodeList,
  CommentNode,
  DOMNode,
  MaybeChildNode,
  NodeLikeAttributes,
  RootNode,
  TagNames,
  TextNode,
  TextToken,
} from "./types.ts";

/**
 * Generates text string from node's children textContent.
 * @param node The node whose children to stringify
 * @returns textContent string
 */
const textContent = (node: ChildNode): string => {
  if (!isTag(node)) return node.nodeValue;
  const { childNodes, nodeName } = node;
  if (nodeName === "BR") return "\n";
  if (!childNodes.length) return "";
  const hasTagChild = childNodes.some(isTag);

  return childNodes.map((n) => isTag(n) ? textContent(n) : n.nodeValue).join(
    hasTagChild ? "\n" : "",
  );
};

/**
 * Generates HTML string for node's children
 * @param node The node whose children to stringify
 * @param depth Current indentation depth
 * @returns innerHTML string
 */
const innerHTML = (
  node: DOMNode,
  depth = 0,
): string => {
  const { childNodes: childContents } = node;
  // Remove comments
  const childNodes = childContents.filter((c) => c.nodeName !== "#comment");
  if (!childNodes.length) return "";
  const childIsText = childNodes.length === 1 &&
    !isTag(childNodes[0]);
  const space = depth && !childIsText ? "  ".repeat(depth) : "";
  return childNodes
    .map((n) => isTag(n) ? outerHTML(n, depth) : space + n.nodeValue)
    .join("\n");
};

/**
 * Generates HTML string for a node including its opening/closing tags
 * @param node The node to stringify
 * @param depth Current indentation depth
 * @returns outerHTML string
 */
const outerHTML = (node: DOMNode, depth = 0): string => {
  const { attributes, tagName, childNodes: childContents } = node;
  const childNodes = childContents.filter((c) => c.nodeName !== "#comment");
  const space = depth ? "  ".repeat(depth) : "";
  const hasChildren = childNodes.length > 0;
  const childIsText = childNodes.length === 1 && !isTag(childNodes[0]);
  const hasAttributes = attributes.size > 0;
  const isSelfClosing = selfClosingTags.has(tagName);

  const attrStr = hasAttributes
    ? " " + Array.from(attributes)
      .map(([key, val]) => `${key}="${trim(val)}"`)
      .join(" ")
    : "";

  let output = `${space}<${tagName}${attrStr}${isSelfClosing ? " /" : ""}>`;
  output += !childIsText && hasChildren ? "\n" : "";
  output += hasChildren ? innerHTML(node, depth + 1) : "";
  output += !childIsText && hasChildren ? `\n${space}` : "";
  output += !isSelfClosing ? `</${tagName}>` : "";

  return output;
};

/**
 * Creates a basic text or comment node.
 * @param nodeName The node name ("#text" or "#comment").
 * @param text The text content of the node.
 * @returns A TextNode or CommentNode object.
 */
export function createBasicNode<T extends ("#text" | "#comment")>(
  nodeName: T,
  text: string,
): TextNode | CommentNode {
  return {
    nodeName,
    // nodeValue: nodeName !== "#text" ? `<${text}>` : text,
    nodeValue: text,
  } as (TextNode | CommentNode);
}

/**
 * Creates a DOM-like Node (`DOMNode` or `RootNode`) with DOM API properties and methods.
 * This function extends the basic `NodeLike` from **Parser** by adding DOM-specific
 * properties and methods, as well as applying filters based on the provided configuration.
 *
 * @param this - The `RootNode` when creating a `DOMNode`, or `null` otherwise (in non-strict mode)
 * @param nodeName The tag name of the node to create (or '#document' for the root).
 * @param childNodes Optional child nodes to append to the created node.
 * @returns An extended `DOMNode` or `RootNode` object with DOM API.
 */
export function createNode(
  this: RootNode | null,
  nodeName: string,
  ...childNodes: ChildNodeList
): Omit<DOMNode, "tagName" | "attributes"> | RootNode {
  const ALL: ChildElementList = [];
  const CHILDREN: ChildElementList = [];
  const CHILDNODES: ChildNodeList = [];
  const nodeIsRoot = nodeName === "#document";
  const ownerDocument = this ?? undefined;

  const node = {
    nodeName,
    append(...nodes: ChildNodeList) {
      for (const child of nodes) {
        if (!isNode(child)) {
          throw new Error(`${DOM_ERROR} Invalid node.`);
        }
        CHILDNODES.push(child);
        if (isTag(child)) {
          ALL.push(child);
          CHILDREN.push(child);
          ownerDocument?.register(child);

          // Add HTML generation methods
          defineProperties(child, {
            innerHTML: {
              enumerable: false,
              get: () => innerHTML(child),
            },
            outerHTML: {
              enumerable: false,
              get: () => outerHTML(child),
            },
          });
        }

        defineProperties(child, {
          // Add text generation methods
          textContent: {
            enumerable: false,
            get: () => textContent(child),
          },
          // Add node relationship properties
          parentNode: {
            enumerable: false,
            get: () => node,
          },
          parentElement: {
            enumerable: false,
            get: () => node,
          },
          ownerDocument: {
            enumerable: false,
            get: () => ownerDocument,
          },
        });

        child.remove = () => {
          node.removeChild(child);
        };
      }
    },
    cleanup: () => {
      ALL.length = 0;
      CHILDREN.length = 0;
      CHILDNODES.length = 0;
    },

    // Root document methods
    ...(isRoot({ nodeName } as RootNode) && {
      createElement(
        tagName:
          & string
          & (keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap),
        first?: NodeLikeAttributes | MaybeChildNode,
        ...rest: MaybeChildNode[]
      ) {
        return createElement.call(
          node as RootNode,
          tagName,
          first,
          ...rest,
        );
      },
      createElementNS(
        _ns: string,
        tagName:
          & string
          & (keyof SVGElementTagNameMap & keyof HTMLElementTagNameMap),
        first?: NodeLikeAttributes | MaybeChildNode,
        ...rest: MaybeChildNode[]
      ) {
        return createElement.call(node as RootNode, tagName, first, ...rest);
      },
      createComment(content: string) {
        return createBasicNode("#comment", content);
      },
      createTextNode(content: string) {
        return createBasicNode("#text", content);
      },
      getElementById(id: string) {
        return ALL.find((node) => node.attributes.get("id") === id) ?? null;
      },
    }),

    // Element methods
    ...((!nodeIsRoot) && {
      matches(selector: string) {
        return matchesSelector(node as unknown as DOMNode, selector);
      },
    }),
    // Shared methods
    contains: (childNode: DOMNode) => {
      if (!childNode || !isTag(childNode)) {
        throw new Error(
          "DomError: the childNode parameter must be a valid DOMNode",
        );
      }
      if ((node as DOMNode | RootNode).children.includes(childNode)) {
        return true;
      }

      let currentParent = childNode.parentNode;
      while (currentParent) {
        if (currentParent === node) {
          return true;
        }
        currentParent = currentParent.parentNode;
      }
      return false;
    },
    removeChild(childNode: ChildNode) {
      if (!childNode || !isNode(childNode)) {
        throw new Error(
          "DomError: the childNode parameter must be a valid ChildNode",
        );
      }

      const indexOf = (arr: ChildNode[]) => arr.indexOf(childNode);
      /* istanbul ignore else @preserve */
      if (isTag(childNode)) {
        const idx1 = indexOf(ALL);
        const idx2 = indexOf(CHILDREN);
        /* istanbul ignore else @preserve */
        if (idx1 > -1) ALL.splice(idx1, 1);
        /* istanbul ignore else @preserve */
        if (idx2 > -1) CHILDREN.splice(idx2, 1);
        childNode.cleanup();

        ownerDocument?.deregister(childNode);
      }

      const idx3 = indexOf(CHILDNODES);
      /* istanbul ignore else @preserve */
      if (idx3 > -1) CHILDNODES.splice(idx3, 1);
    },
    replaceChildren: (...newChildren: DOMNode[]) => {
      // clone this array to work
      CHILDNODES.slice(0).forEach((child) => node.removeChild(child));
      node.append(...newChildren);
    },
    querySelector(selector: string) {
      return ALL.find((n) => n.matches(selector)) ?? null;
    },
    querySelectorAll(selector: string) {
      return ALL.filter((n) => n.matches(selector));
    },
    getElementsByTagName(tagName: string) {
      return tagName === "*"
        ? ALL
        : ALL.filter((n) => n.tagName.toLowerCase() === tagName.toLowerCase());
    },
    getElementsByClassName(className: string) {
      return ALL.filter((n) => {
        const classAttr = n.attributes.get("class");
        return classAttr?.split(/\s+/).includes(className) ?? false;
      });
    },
  };

  // Define enumerable getters
  defineProperties(node, {
    childNodes: {
      enumerable: true,
      get: () => CHILDNODES,
    },
    children: {
      enumerable: true,
      get: () => CHILDREN,
    },
    // Add tag-specific property
    ...(!nodeIsRoot
      ? {
        registerChild: {
          enumerable: false,
          value: (child: DOMNode) => {
            ALL.push(child);
          },
        },
      }
      : {}),
  });

  // Add root-specific properties
  if (nodeIsRoot) {
    defineProperties(node, {
      all: {
        enumerable: true,
        get: () => ALL,
      },
      documentElement: {
        enumerable: true,
        get: () => ALL.find((node) => toUpperCase(node.tagName) === "HTML"),
      },
      head: {
        enumerable: true,
        get: () => ALL.find((node) => toUpperCase(node.tagName) === "HEAD"),
      },
      body: {
        enumerable: true,
        get: () => ALL.find((node) => toUpperCase(node.tagName) === "BODY"),
      },
      register: {
        enumerable: false,
        value: (child: DOMNode) => {
          ALL.push(child);
        },
      },
      deregister: {
        enumerable: false,
        value: (child: DOMNode) => {
          const idx = ALL.indexOf(child);
          /* istanbul ignore else @preserve */
          if (idx > -1) ALL.splice(idx, 1);
        },
      },
    });
  }

  // Add any initial children
  if (childNodes?.length) {
    node.append(...childNodes);
  }

  return node as unknown as RootNode | Omit<DOMNode, "tagName" | "attributes">;
}

const convertToNode = (n: string | number | ChildNode) => {
  if (isPrimitive(n)) {
    const { tokenType, value } = tokenize(String(n))[0] as TextToken;
    return createBasicNode(`#${tokenType}`, value);
  }
  return n;
};

/**
 * Creates a new `Element` like node
 * @param this The RootNode instance
 * @param tagName Tag name for the element
 * @param first Optional attributes or first child
 * @param args Additional child nodes
 * @returns New element node
 */
export function createElement(
  this: RootNode,
  tagName: string & TagNames,
  first?: NodeLikeAttributes | MaybeChildNode,
  ...args: MaybeChildNode[]
): DOMNode {
  const childNodes: ChildNodeList = [];
  let attributes = new Map<string, string>();

  // Handle first argument
  /* istanbul ignore else @preserve */
  if (first) {
    if (isObj(first) && !isNode(first)) {
      // Convert attributes object to Map
      attributes = new Map(Object.entries(first));
    } else {
      childNodes.push(convertToNode(first as string | number | ChildNode));
    }
  }

  // Add remaining children
  const nodes = args.map(convertToNode).filter(isNode);
  childNodes.push(...nodes);

  const node = createNode.call(
    this,
    toUpperCase(tagName),
    ...childNodes,
  ) as DOMNode;

  const charset = attributes.get("charset");
  if (tagName === "meta" && charset) {
    this.charset = toUpperCase(charset);
  }

  defineProperties(node, {
    tagName: {
      enumerable: true,
      get: () => tagName,
    },
    attributes: {
      enumerable: true,
      get: () => attributes,
    },
    id: {
      enumerable: true,
      get: () => attributes.get("id") ?? "",
    },
    className: {
      enumerable: true,
      get: () => attributes.get("class") ?? "",
    },
  });
  // define Element attributes methods
  node.hasAttribute = (attrName) => attributes.has(attrName);
  node.getAttribute = (attrName) => attributes.get(attrName) ?? null;
  node.setAttribute = (attrName, attrValue) => {
    attributes.set(attrName, attrValue);
  };
  node.hasAttributeNS = (_namespace, attrName) => attributes.has(attrName);
  node.getAttributeNS = (_namespace, attrName) =>
    attributes.get(attrName) ?? null;
  node.setAttributeNS = (_namespace, attrName, attrValue) => {
    attributes.set(attrName, attrValue);
  };
  // define Element parent selector
  node.closest = (selector: string) => {
    if (!selector) throw new Error("DomError: selector must be a string");
    if (node.matches(selector)) return node;
    let currentParent = node.parentNode;
    while (!isRoot(currentParent)) {
      if (currentParent.matches(selector)) {
        return currentParent;
      }
      currentParent = currentParent.parentNode;
    }
    return null;
  };

  return node;
}

/**
 * Creates a new `Document` like root node.
 *
 * @returns a new root node
 */
export const createDocument = () =>
  createNode.call(null, "#document") as RootNode;
