import { DomParserOptions, RootNode } from "./types-CQGajz-V.cjs";

//#region src/parts/dom-parser.d.ts

/**
 * **DomParser**
 *
 * Unlike the basic **Parser**, **DomParser** creates a new `Document` like instance with DOM-like
 * methods and properties and populates it with `Node` like objects resulted from the parsing
 * of a given HTML markup.
 *
 * @example
 * ```ts
 * const config = {
 *   // On creating new node callback function
 *   onNodeCallback?: myFunction(node: DOMNode) => DOMNode | YOURNode,
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
 * const { root: doc, components, tags } = DomParser.parseFromString("<!doctype html><html>This is starting html</html>", config);
 * console.log(doc.documentElement.outerHTML);
 * // > "<html>This is starting html</html>"
 * ```
 *
 * @param startHTML Initial HTML content
 * @param config the `Parser` options to apply to the parsing of the startHTML markup.
 * @returns The `Document` like root node
 */
declare const DomParser: (config?: Partial<DomParserOptions>) => {
  parseFromString(htmlString?: string): {
    root: RootNode;
    components: string[];
    tags: string[];
  };
};
//#endregion
export { DomParser };
//# sourceMappingURL=dom-parser-BMRDfAh1.d.cts.map