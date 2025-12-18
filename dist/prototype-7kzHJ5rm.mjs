import { _ as toLowerCase, b as trim, d as isObj, f as isPrimitive, g as startsWith, h as selfClosingTags, i as defineProperties, m as isTag, n as DOM_ERROR, p as isRoot, u as isNode, v as toUpperCase, y as tokenize } from "./util-BfmRalo8.mjs";

//#region src/parts/selectors.ts
/**
* Create a selector cache to help improve `match` based queries
* (matches, querySelector, querySelectorAll).
*/
var SelectorCacheMap = class extends Map {
	constructor() {
		super();
		this.hits = 0;
		this.misses = 0;
		this.misses = 0;
		this.hits = 0;
	}
	hit() {
		this.hits += 1;
	}
	miss() {
		this.hits += 1;
	}
	getMatchFunction(selector, maxSize = 100) {
		let matchFn = this.get(selector);
		if (!matchFn) {
			this.miss();
			if (this.size >= maxSize) {
				const firstKey = this.keys().next().value;
				/* istanbul ignore else @preserve */
				if (firstKey) this.delete(firstKey);
			}
			const parts = selector.split(",").map((s) => s.trim());
			matchFn = (node) => parts.some((part) => matchesSingleSelector(node, part));
			this.set(selector, matchFn);
		} else this.hit();
		return matchFn;
	}
	clear() {
		super.clear();
		this.misses = 0;
		this.hits = 0;
	}
	getStats() {
		return {
			size: this.size,
			hits: this.hits,
			misses: this.misses,
			hitRate: this.hits / (this.hits + this.misses || 1)
		};
	}
};
const selectorCache = new SelectorCacheMap();
const SELECTOR_REGEX = /([.#]?[\w-]+|\[[\w-]+(?:=[^\]]+)?\])+/g;
/**
* Parses a CSS selector string into an array of selector parts.
* Each part represents a segment of the selector (e.g., tag name, class, id, attribute).
* @param selector The CSS selector string to parse.
* @returns An array of `SelectorPart` objects representing the parsed selector.
*/
const parseSelector = (selector) => {
	const parts = [];
	const matches = selector.match(SELECTOR_REGEX) || [];
	for (const match of matches) if (startsWith(match, "#")) parts.push({
		type: "#",
		name: "id",
		value: match.slice(1)
	});
	else if (startsWith(match, ".")) parts.push({
		type: ".",
		name: "class",
		value: match.slice(1)
	});
	else if (startsWith(match, "[")) {
		const [name, value] = match.slice(1, -1).split("=");
		parts.push({
			type: "[",
			name,
			value: value ? value.replace(/['"]/g, "") : void 0
		});
	} else parts.push({
		type: "",
		name: match
	});
	return parts;
};
/**
* Checks if a node matches a single CSS selector.
* @param node The `DOMNode` object to test against the selector.
* @param selector The CSS selector string.
* @returns `true` if the node matches the selector, `false` otherwise.
*/
const matchesSingleSelector = (node, selector) => {
	return parseSelector(selector).every((part) => {
		switch (part.type) {
			case "#": return node.attributes.get("id") === part.value;
			case ".": return (node.attributes.get("class")?.split(/\s+/) || []).includes(part.value);
			case "[": {
				const attrValue = node.attributes.get(part.name);
				return part.value ? attrValue === part.value : attrValue !== void 0;
			}
			default: return toLowerCase(node.tagName) === toLowerCase(part.name);
		}
	});
};
/**
* Checks if a node matches one or mode CSS selectors.
* @param node The `DOMNode` object to test against the selector.
* @param selector The CSS selector string.
* @returns `true` if the node matches the selector, `false` otherwise.
*/
const matchesSelector = (node, selector) => {
	return selectorCache.getMatchFunction(selector)(node);
};

//#endregion
//#region src/parts/prototype.ts
/**
* Generates text string from node's children textContent.
* @param node The node whose children to stringify
* @returns textContent string
*/
const textContent = (node) => {
	if (!isTag(node)) return node.nodeValue;
	const { childNodes, nodeName } = node;
	if (nodeName === "BR") return "\n";
	if (!childNodes.length) return "";
	const hasTagChild = childNodes.some(isTag);
	return childNodes.map((n) => isTag(n) ? textContent(n) : n.nodeValue).join(hasTagChild ? "\n" : "");
};
/**
* Generates HTML string for node's children
* @param node The node whose children to stringify
* @param depth Current indentation depth
* @returns innerHTML string
*/
const innerHTML = (node, depth = 0) => {
	const { childNodes: childContents } = node;
	const childNodes = childContents.filter((c) => c.nodeName !== "#comment");
	if (!childNodes.length) return "";
	const childIsText = childNodes.length === 1 && !isTag(childNodes[0]);
	const space = depth && !childIsText ? "  ".repeat(depth) : "";
	return childNodes.map((n) => isTag(n) ? outerHTML(n, depth) : space + n.nodeValue).join("\n");
};
/**
* Generates HTML string for a node including its opening/closing tags
* @param node The node to stringify
* @param depth Current indentation depth
* @returns outerHTML string
*/
const outerHTML = (node, depth = 0) => {
	const { attributes, tagName, childNodes: childContents } = node;
	const childNodes = childContents.filter((c) => c.nodeName !== "#comment");
	const space = depth ? "  ".repeat(depth) : "";
	const hasChildren = childNodes.length > 0;
	const childIsText = childNodes.length === 1 && !isTag(childNodes[0]);
	const hasAttributes = attributes.size > 0;
	const isSelfClosing = selfClosingTags.has(tagName);
	let output = `${space}<${tagName}${hasAttributes ? " " + Array.from(attributes).map(([key, val]) => `${key}="${trim(val)}"`).join(" ") : ""}${isSelfClosing ? " /" : ""}>`;
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
function createBasicNode(nodeName, text) {
	return {
		nodeName,
		nodeValue: text
	};
}
function setupChildNode(child, parent, ownerDocument) {
	defineProperties(child, {
		textContent: {
			enumerable: false,
			configurable: true,
			get: () => textContent(child),
			set: (newContent) => {
				if (isTag(child)) {
					child.replaceChildren();
					child.appendChild(createBasicNode("#text", newContent));
				} else child.nodeValue = newContent;
			}
		},
		parentNode: {
			enumerable: false,
			configurable: true,
			get: () => parent
		},
		parentElement: {
			enumerable: false,
			configurable: true,
			get: () => parent
		},
		ownerDocument: {
			enumerable: false,
			configurable: true,
			get: () => ownerDocument
		}
	});
	child.remove = () => parent.removeChild(child);
	child.before = (...nodes) => {
		const validNodes = nodes.map(convertToNode).filter(isNode);
		const index = parent.childNodes.indexOf(child);
		// istanbul ignore else @preserve
		if (index > -1) {
			parent.childNodes.splice(index, 0, ...validNodes);
			validNodes.forEach((n, i) => {
				// istanbul ignore else @preserve
				if (isTag(n)) {
					const childIndex = parent.children.indexOf(child);
					parent.children.splice(childIndex + i, 0, n);
					ownerDocument?.register(n);
					// istanbul ignore else @preserve
					if (isTag(parent)) parent.registerChild(n);
				}
				setupChildNode(n, parent, ownerDocument);
			});
		}
	};
	child.after = (...nodes) => {
		const validNodes = nodes.map(convertToNode).filter(isNode);
		const index = parent.childNodes.indexOf(child);
		// istanbul ignore else @preserve
		if (index > -1) {
			parent.childNodes.splice(index + 1, 0, ...validNodes);
			validNodes.forEach((n, i) => {
				// istanbul ignore else @preserve
				if (isTag(n)) {
					const childIndex = parent.children.indexOf(child);
					parent.children.splice(childIndex + 1 + i, 0, n);
					ownerDocument?.register(n);
					// istanbul ignore else @preserve
					if (isTag(parent)) parent.registerChild(n);
				}
				setupChildNode(n, parent, ownerDocument);
			});
		}
	};
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
function createNode(nodeName, ...childNodes) {
	const ALL = [];
	const CHILDREN = [];
	const CHILDNODES = [];
	const nodeIsRoot = nodeName === "#document";
	const ownerDocument = this ?? void 0;
	const node = {
		nodeName,
		appendChild(child) {
			if (!isNode(child)) throw new Error(`${DOM_ERROR} Invalid node.`);
			CHILDNODES.push(child);
			if (isTag(child)) {
				ALL.push(child);
				CHILDREN.push(child);
				ownerDocument?.register(child);
			}
			setupChildNode(child, node, ownerDocument);
		},
		append(...nodes) {
			for (const child of nodes) node.appendChild(child);
		},
		cleanup: () => {
			ALL.length = 0;
			CHILDREN.length = 0;
			CHILDNODES.length = 0;
		},
		...isRoot({ nodeName }) && {
			createElement(tagName, first, ...rest) {
				return createElement.call(node, tagName, first, ...rest);
			},
			createElementNS(_ns, tagName, first, ...rest) {
				return createElement.call(node, tagName, first, ...rest);
			},
			createComment(content) {
				return createBasicNode("#comment", content);
			},
			createTextNode(content) {
				return createBasicNode("#text", content);
			},
			getElementById(id) {
				return ALL.find((node$1) => node$1.attributes.get("id") === id) ?? null;
			}
		},
		...!nodeIsRoot && { matches(selector) {
			return matchesSelector(node, selector);
		} },
		contains: (childNode) => {
			if (!childNode || !isTag(childNode)) throw new Error("DomError: the childNode parameter must be a valid DOMNode");
			if (node.children.includes(childNode)) return true;
			let currentParent = childNode.parentNode;
			while (currentParent) {
				if (currentParent === node) return true;
				currentParent = currentParent.parentNode;
			}
			return false;
		},
		removeChild(childNode) {
			if (!childNode || !isNode(childNode)) throw new Error("DomError: the childNode parameter must be a valid ChildNode");
			const indexOf = (arr) => arr.indexOf(childNode);
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
		replaceChildren: (...newChildren) => {
			CHILDNODES.slice(0).forEach((child) => node.removeChild(child));
			node.append(...newChildren);
		},
		querySelector(selector) {
			return ALL.find((n) => n.matches(selector)) ?? null;
		},
		querySelectorAll(selector) {
			return ALL.filter((n) => n.matches(selector));
		},
		getElementsByTagName(tagName) {
			return tagName === "*" ? ALL : ALL.filter((n) => n.tagName.toLowerCase() === tagName.toLowerCase());
		},
		getElementsByClassName(className) {
			return ALL.filter((n) => {
				return n.attributes.get("class")?.split(/\s+/).includes(className) ?? false;
			});
		}
	};
	defineProperties(node, {
		childNodes: {
			enumerable: true,
			get: () => CHILDNODES
		},
		children: {
			enumerable: true,
			get: () => CHILDREN
		},
		...!nodeIsRoot ? { registerChild: {
			enumerable: false,
			value: (child) => {
				ALL.push(child);
			}
		} } : {}
	});
	if (nodeIsRoot) defineProperties(node, {
		all: {
			enumerable: true,
			get: () => ALL
		},
		documentElement: {
			enumerable: true,
			get: () => ALL.find((node$1) => toUpperCase(node$1.tagName) === "HTML")
		},
		head: {
			enumerable: true,
			get: () => ALL.find((node$1) => toUpperCase(node$1.tagName) === "HEAD")
		},
		body: {
			enumerable: true,
			get: () => ALL.find((node$1) => toUpperCase(node$1.tagName) === "BODY")
		},
		register: {
			enumerable: false,
			value: (child) => {
				ALL.push(child);
			}
		},
		deregister: {
			enumerable: false,
			value: (child) => {
				const idx = ALL.indexOf(child);
				/* istanbul ignore else @preserve */
				if (idx > -1) ALL.splice(idx, 1);
			}
		}
	});
	else defineProperties(node, {
		innerHTML: {
			enumerable: false,
			get: () => innerHTML(node)
		},
		outerHTML: {
			enumerable: false,
			get: () => outerHTML(node)
		}
	});
	if (childNodes?.length) node.append(...childNodes);
	return node;
}
const convertToNode = (n) => {
	if (isPrimitive(n)) {
		const { tokenType, value } = tokenize(String(n))[0];
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
function createElement(tagName, first, ...args) {
	const childNodes = [];
	let attributes = /* @__PURE__ */ new Map();
	/* istanbul ignore else @preserve */
	if (first) if (isObj(first) && !isNode(first)) attributes = new Map(Object.entries(first));
	else childNodes.push(convertToNode(first));
	const nodes = args.map(convertToNode).filter(isNode);
	childNodes.push(...nodes);
	const node = createNode.call(this, toUpperCase(tagName), ...childNodes);
	const charset = attributes.get("charset");
	if (tagName === "meta" && charset) this.charset = toUpperCase(charset);
	defineProperties(node, {
		tagName: {
			enumerable: true,
			get: () => tagName
		},
		attributes: {
			enumerable: true,
			get: () => attributes
		},
		id: {
			enumerable: true,
			get: () => attributes.get("id") ?? ""
		},
		className: {
			enumerable: true,
			get: () => attributes.get("class") ?? ""
		}
	});
	node.hasAttribute = (attrName) => attributes.has(attrName);
	node.getAttribute = (attrName) => attributes.get(attrName) ?? null;
	node.setAttribute = (attrName, attrValue) => {
		attributes.set(attrName, attrValue);
	};
	node.removeAttribute = (attrName) => {
		attributes.delete(attrName);
	};
	node.hasAttributeNS = (_namespace, attrName) => attributes.has(attrName);
	node.getAttributeNS = (_namespace, attrName) => attributes.get(attrName) ?? null;
	node.setAttributeNS = (_namespace, attrName, attrValue) => {
		attributes.set(attrName, attrValue);
	};
	node.removeAttributeNS = (_namespace, attrName) => {
		attributes.delete(attrName);
	};
	node.closest = (selector) => {
		if (!selector) throw new Error("DomError: selector must be a string");
		if (node.matches(selector)) return node;
		let currentParent = node.parentNode;
		while (!isRoot(currentParent)) {
			if (currentParent.matches(selector)) return currentParent;
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
const createDocument = () => createNode.call(null, "#document");

//#endregion
export { matchesSelector as a, createNode as i, createDocument as n, selectorCache as o, createElement as r, createBasicNode as t };
//# sourceMappingURL=prototype-7kzHJ5rm.mjs.map