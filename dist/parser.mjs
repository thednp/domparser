import { _ as toLowerCase, h as selfClosingTags, l as getBaseAttributes, v as toUpperCase, y as tokenize } from "./util-BfmRalo8.mjs";

//#region src/parts/parser.ts
/**
* **Parser**
*
* A tiny yet very fast and powerful parser that takes a string of HTML
* and returns a DOM tree representation. In benchmarks it shows up to
* 60x faster performance when compared to jsdom.
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
function Parser() {
	return { parseFromString(htmlString) {
		const root = {
			nodeName: "#document",
			children: []
		};
		if (!htmlString) return {
			root,
			tags: [],
			components: []
		};
		const stack = [root];
		const components = /* @__PURE__ */ new Set();
		const tags = /* @__PURE__ */ new Set();
		const tokens = tokenize(htmlString);
		const tLen = tokens.length;
		for (let i = 0; i < tLen; i += 1) {
			const { tokenType, value, isSC } = tokens[i];
			const currentParent = stack[stack.length - 1];
			if (tokenType === "doctype") continue;
			if (["text", "comment"].includes(tokenType)) {
				currentParent.children.push({
					nodeName: `#${tokenType}`,
					nodeValue: value
				});
				continue;
			}
			const isClosing = value.startsWith("/");
			const tagName = isClosing ? value.slice(1) : value.split(/[\s/>]/)[0];
			const tagNameLower = toLowerCase(tagName);
			const isSelfClosing = isSC || selfClosingTags.has(tagNameLower);
			(tagName[0] === toUpperCase(tagName[0]) || tagName.includes("-") ? components : tags).add(tagName);
			if (!isClosing) {
				const node = {
					tagName,
					nodeName: toUpperCase(tagName),
					attributes: getBaseAttributes(value),
					children: []
				};
				currentParent.children.push(node);
				!isSelfClosing && stack.push(node);
			} else if (!isSelfClosing && stack.length > 1) stack.pop();
		}
		return {
			root,
			components: Array.from(components),
			tags: Array.from(tags)
		};
	} };
}

//#endregion
export { Parser };
//# sourceMappingURL=parser.mjs.map