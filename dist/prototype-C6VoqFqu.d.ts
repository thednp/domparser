import { ChildNodeList, CommentNode, DOMNode, MaybeChildNode, NodeLikeAttributes, RootNode, TagNames, TextNode } from "./types-C-roliuf.js";

//#region src/parts/prototype.d.ts

/**
 * Creates a basic text or comment node.
 * @param nodeName The node name ("#text" or "#comment").
 * @param text The text content of the node.
 * @returns A TextNode or CommentNode object.
 */
declare function createBasicNode<T extends ("#text" | "#comment")>(nodeName: T, text: string): TextNode | CommentNode;
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
declare function createNode(this: RootNode | null, nodeName: string, ...childNodes: ChildNodeList): Omit<DOMNode, "tagName" | "attributes"> | RootNode;
/**
 * Creates a new `Element` like node
 * @param this The RootNode instance
 * @param tagName Tag name for the element
 * @param first Optional attributes or first child
 * @param args Additional child nodes
 * @returns New element node
 */
declare function createElement(this: RootNode, tagName: string & TagNames, first?: NodeLikeAttributes | MaybeChildNode, ...args: MaybeChildNode[]): DOMNode;
/**
 * Creates a new `Document` like root node.
 *
 * @returns a new root node
 */
declare const createDocument: () => RootNode;
//#endregion
export { createBasicNode, createDocument, createElement, createNode };
//# sourceMappingURL=prototype-C6VoqFqu.d.ts.map