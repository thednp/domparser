const require_util = require('./util-DVTj_GWo.cjs');
const require_prototype = require('./prototype-MIu8v-er.cjs');

//#region src/parts/dom-parser.ts
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
const DomParser = (config) => {
	if (config && !require_util.isObj(config)) throw new Error(`${require_util.DOM_ERROR} 1st parameter is not an object.`);
	let unsafeTags = /* @__PURE__ */ new Set();
	let unsafeTagDepth = 0;
	let unsafeAttrs = /* @__PURE__ */ new Set();
	const { filterTags, filterAttrs, onNodeCallback } = config || {};
	if (filterTags?.length) unsafeTags = new Set(filterTags);
	if (filterAttrs?.length) unsafeAttrs = new Set(filterAttrs);
	const getAttrOptions = { unsafeAttrs };
	return { parseFromString(htmlString) {
		if (htmlString && typeof htmlString !== "string") throw new Error(`${require_util.DOM_ERROR} 1st parameter is not a string.`);
		const root = require_prototype.createDocument();
		if (!htmlString) return {
			root,
			components: [],
			tags: []
		};
		const stack = [root];
		const tagStack = [];
		const components = /* @__PURE__ */ new Set();
		const tags = /* @__PURE__ */ new Set();
		const tokens = require_util.tokenize(htmlString);
		const tLen = tokens.length;
		let newNode;
		for (let i = 0; i < tLen; i += 1) {
			const { tokenType, value, isSC } = tokens[i];
			if (tokenType === "doctype") {
				root.doctype = `<${value}>`;
				continue;
			}
			const currentParent = stack[stack.length - 1];
			const isClosing = require_util.startsWith(value, "/");
			const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
			const isSelfClosing = isSC || require_util.selfClosingTags.has(tagName);
			if (tokenType === "tag" && !isSelfClosing) if (!isClosing) tagStack.push(tagName);
			else {
				const expectedTag = tagStack.pop();
				if (expectedTag !== tagName) if (expectedTag === void 0) throw new Error(`${require_util.DOM_ERROR} Mismatched closing tag: </${tagName}>. No open tag found.`);
				else throw new Error(`${require_util.DOM_ERROR} Mismatched closing tag: </${tagName}>. Expected closing tag for <${expectedTag}>.`);
			}
			if (unsafeTags.has(tagName)) {
				if (!isSelfClosing) if (!isClosing) unsafeTagDepth++;
				else unsafeTagDepth--;
				continue;
			}
			if (unsafeTagDepth > 0) continue;
			if (["text", "comment"].includes(tokenType)) {
				newNode = require_prototype.createBasicNode(`#${tokenType}`, value);
				currentParent.append(newNode);
				continue;
			}
			(tagName[0] === require_util.toUpperCase(tagName[0]) || tagName.includes("-") ? components : tags).add(tagName);
			if (!isClosing) {
				const attributes = require_util.getAttributes(value, getAttrOptions);
				newNode = require_prototype.createElement.call(root, tagName, attributes);
				currentParent.append(newNode);
				stack.slice(1, -1).map((parent) => parent.registerChild(newNode));
				if (onNodeCallback) onNodeCallback(newNode, currentParent, root);
				const charset = attributes?.charset;
				if (tagName === "meta" && charset) root.charset = require_util.toUpperCase(charset);
				!isSelfClosing && stack.push(newNode);
			} else if (!isSelfClosing && stack.length > 1) stack.pop();
		}
		if (tagStack.length > 0) {
			const unclosedTag = tagStack.pop();
			throw new Error(`${require_util.DOM_ERROR} Unclosed tag: <${unclosedTag}>.`);
		}
		return {
			root,
			components: Array.from(components),
			tags: Array.from(tags)
		};
	} };
};

//#endregion
Object.defineProperty(exports, 'DomParser', {
  enumerable: true,
  get: function () {
    return DomParser;
  }
});
//# sourceMappingURL=dom-parser-BzGeVYGi.cjs.map