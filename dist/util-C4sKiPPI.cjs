
//#region src/parts/util.ts
const ATTR_REGEX = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
/**
* Get attributes from a string token and return an object
* @param token the string token
* @returns the attributes object
*/
const getBaseAttributes = (token) => {
	const attrs = {};
	const [tagName, ...parts] = token.split(/\s+/);
	if (parts.length < 1) return attrs;
	const attrStr = token.slice(tagName.length);
	let match;
	while (match = ATTR_REGEX.exec(attrStr)) {
		const [, name, d, s, u] = match;
		name !== "/" && (attrs[name] = d ?? s ?? u ?? "");
	}
	return attrs;
};
/**
* Get attributes from a string token and return an object.
* In addition to the base tool, this also filters configured
* unsafe attributes.
* @param tagStr the string token
* @param config an optional set of options
* @returns the attributes object
*/
const getAttributes = (tagStr, config) => {
	const { unsafeAttrs } = config || {};
	const baseAttrs = getBaseAttributes(tagStr);
	const attrs = {};
	for (const [key, value] of Object.entries(baseAttrs)) if (!unsafeAttrs || !unsafeAttrs?.has(toLowerCase(key))) attrs[key] = value;
	return attrs;
};
/**
* Converts a string to lowercase.
* @param str The string to convert.
* @returns The lowercase string.
*/
const toLowerCase = (str) => str.toLowerCase();
/**
* Converts a string to uppercase.
* @param str The string to convert.
* @returns The uppercase string.
*/
const toUpperCase = (str) => str.toUpperCase();
/**
* Checks if a string starts with a specified prefix.
* @param str The string to check.
* @param prefix The prefix to search for.
* @param position The position to start looking from.
* @returns `true` if the string starts with the prefix, `false` otherwise.
*/
const startsWith = (str, prefix, position) => str.startsWith(prefix, position);
/**
* Checks if a string ends with a specified suffix.
* @param str The string to check.
* @param suffix The suffix to search for.
* @param position The position to start looking from.
* @returns `true` if the string ends with the suffix, `false` otherwise.
*/
const endsWith = (str, suffix, position) => str.endsWith(suffix, position);
/**
* Creates a string from a character code.
* @param char The character code.
* @returns The string representation of the character code.
*/
const fromCharCode = (char) => String.fromCharCode(char);
/**
* Returns the character code at a specific index in a string.
* @param str The string to check.
* @param index The index of the character to get the code for.
* @returns The character code at the specified index.
*/
const charCodeAt = (str, index) => str.charCodeAt(index);
/**
* Defines a property on an object.
* @param obj The object to define the property on.
* @param propName The name of the property.
* @param desc The property descriptor.
* @returns The object after defining the property.
*/
/**
* Defines multiple properties on an object.
* @param obj The object to define properties on.
* @param props An object where keys are property names and values are property descriptors.
* @returns The object after defining the properties.
*/
const defineProperties = (obj, props) => Object.defineProperties(obj, props);
/**
* Checks if a node is an object.
* @param node The object to check.
* @returns `true` if the node is an object, `false` otherwise.
*/
const isObj = (node) => node !== null && typeof node === "object";
/**
* Checks if a node is a root object (`RootNode` or `RootLike`).
* @param node The object to check.
* @returns `true` if the node is an object, `false` otherwise.
*/
const isRoot = (node) => isObj(node) && isNode(node) && node.nodeName === "#document";
/**
* Checks if a node is a tag node (`NodeLike` or `DOMNode`).
* @param node The node to check.
* @returns `true` if the node is a tag node, `false` otherwise.
*/
const isTag = (node) => isObj(node) && "tagName" in node;
/**
* Checks if a node is a root node (`RootLike` or `RootNode`),
* a tag node (`NodeLike` or `DOMNode`), a comment node
* (`CommentLike` or `CommentNode`) or text node (`TextLike` or `TextNode`).
* @param node The node to check.
* @returns `true` if the node is a tag node, `false` otherwise.
*/
const isNode = (node) => isObj(node) && "nodeName" in node;
/**
* Checks if a value is a primitive (number or string).
* @param val The value to check.
* @returns `true` if the value is a primitive, `false` otherwise.
*/
const isPrimitive = (val) => typeof val === "string" || typeof val === "number";
/**
* Trim a string value.
* @param str A string value
* @returns The trimmed value of the same string.
*/
const trim = (str) => str.trim();
/**
* Set of self-closing HTML tags used by the `Parser`.
*/
const selfClosingTags = new Set([
	"?xml",
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
	"polyline"
]);
const escape = (str) => {
	if (str === null || str === "") return "";
	else str = str.toString();
	const map = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#039;"
	};
	return str.replace(/[&<>"']/g, (m) => {
		return map[m];
	});
};
const DOM_ERROR = "DomParserError:";
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const DEFAULT_MAX_SCRIPT_SIZE = 128 * 1024;
/**
* Tokenizes an HTML string into an array of HTML tokens.
* These tokens represent opening tags, closing tags, text content, and comments.
* @param html The HTML string to tokenize.
* @returns An array of `HTMLToken` objects.
*/
const tokenize = (html, options = {}) => {
	const { maxScriptSize = DEFAULT_MAX_SCRIPT_SIZE, chunkSize = DEFAULT_CHUNK_SIZE } = options;
	const specialTags = ["script", "style"];
	const tokens = [];
	const len = html.length;
	const COM_START = ["!--", "![CDATA["];
	const COM_END = ["--", "]]"];
	let COM_TYPE = 0;
	let token = "";
	let scriptContent = "";
	let inTag = false;
	let inQuote = false;
	let quote = 0;
	let inPre = false;
	let inTemplate = false;
	let inComment = false;
	let inStyleScript = false;
	let currentChunkStart = 0;
	while (currentChunkStart < len) {
		const chunkEnd = Math.min(currentChunkStart + chunkSize, len);
		const chunk = html.slice(currentChunkStart, chunkEnd);
		for (let i = 0; i < chunk.length; i++) {
			const globalIndex = currentChunkStart + i;
			const char = charCodeAt(chunk, i);
			if (inStyleScript) {
				const endSpecialTag = specialTags.find((t) => startsWith(html, `/${t}`, globalIndex + 1));
				if (char === 60 && endSpecialTag && !inTemplate && !inQuote) {
					// istanbul ignore else @preserve
					if (scriptContent.length < maxScriptSize) tokens.push({
						tokenType: "text",
						value: trim(scriptContent),
						isSC: false
					});
					tokens.push({
						tokenType: "tag",
						value: "/" + endSpecialTag,
						isSC: false
					});
					scriptContent = "";
					inStyleScript = false;
					i += endSpecialTag.length + 2;
				} else {
					// istanbul ignore next @preserve - don't crash the test!!
					if (scriptContent.length >= maxScriptSize) continue;
					if (char === 96) inTemplate = !inTemplate;
					else if (!inTemplate && (char === 34 || char === 39)) {
						// istanbul ignore else @preserve
						if (!inQuote) {
							quote = char;
							inQuote = true;
						} else if (char === quote) inQuote = false;
					}
					scriptContent += fromCharCode(char);
				}
				continue;
			}
			if (inComment) {
				token += fromCharCode(char);
				if (endsWith(token, COM_END[COM_TYPE]) && charCodeAt(html, globalIndex + 1) === 62) {
					const tokenValue = COM_TYPE === 1 ? escape(token) : token;
					tokens.push({
						tokenType: "comment",
						value: `<${trim(tokenValue)}>`,
						isSC: false
					});
					inComment = false;
					token = "";
					i += 1;
				}
				continue;
			}
			if (inTag && token.includes("=") && (char === 34 || char === 39)) {
				if (!inQuote) {
					quote = char;
					inQuote = true;
				} else if (char === quote) inQuote = false;
				token += fromCharCode(char);
				continue;
			}
			if (char === 60 && !inQuote && !inTemplate) {
				const value = trim(token);
				value && tokens.push({
					tokenType: "text",
					value: inPre ? token : value,
					isSC: false
				});
				token = "";
				const commentStart = COM_START.find((cs) => startsWith(html, cs, globalIndex + 1));
				if (commentStart) {
					COM_TYPE = COM_START.indexOf(commentStart);
					inComment = true;
					token += commentStart;
					i += commentStart.length;
					continue;
				}
				inTag = true;
			} else if (char === 62 && inTag && !inTemplate) {
				if (token === "/pre") inPre = false;
				else if (token === "pre" || startsWith(token, "pre")) inPre = true;
				const startSpecialTag = specialTags.find((t) => t === token || startsWith(token, t));
				if (startSpecialTag && !endsWith(token, "/")) inStyleScript = true;
				const isDocType = startsWith(toLowerCase(token), "!doctype");
				// istanbul ignore else @preserve
				if (token) {
					const isSC = endsWith(token, "/");
					const [tagName] = token.split(/\s/);
					const value = inQuote ? tagName + (isSC ? "/" : "") : token;
					tokens.push({
						tokenType: isDocType ? "doctype" : "tag",
						value: isSC ? trim(value.slice(0, -1)) : trim(value),
						isSC
					});
				}
				token = "";
				inTag = false;
				inQuote = false;
			} else token += fromCharCode(char);
		}
		currentChunkStart = chunkEnd;
	}
	const lastToken = trim(token);
	if (lastToken) tokens.push({
		tokenType: "text",
		value: lastToken,
		isSC: false
	});
	return tokens;
};

//#endregion
Object.defineProperty(exports, 'ATTR_REGEX', {
  enumerable: true,
  get: function () {
    return ATTR_REGEX;
  }
});
Object.defineProperty(exports, 'DOM_ERROR', {
  enumerable: true,
  get: function () {
    return DOM_ERROR;
  }
});
Object.defineProperty(exports, 'charCodeAt', {
  enumerable: true,
  get: function () {
    return charCodeAt;
  }
});
Object.defineProperty(exports, 'defineProperties', {
  enumerable: true,
  get: function () {
    return defineProperties;
  }
});
Object.defineProperty(exports, 'endsWith', {
  enumerable: true,
  get: function () {
    return endsWith;
  }
});
Object.defineProperty(exports, 'escape', {
  enumerable: true,
  get: function () {
    return escape;
  }
});
Object.defineProperty(exports, 'fromCharCode', {
  enumerable: true,
  get: function () {
    return fromCharCode;
  }
});
Object.defineProperty(exports, 'getAttributes', {
  enumerable: true,
  get: function () {
    return getAttributes;
  }
});
Object.defineProperty(exports, 'getBaseAttributes', {
  enumerable: true,
  get: function () {
    return getBaseAttributes;
  }
});
Object.defineProperty(exports, 'isNode', {
  enumerable: true,
  get: function () {
    return isNode;
  }
});
Object.defineProperty(exports, 'isObj', {
  enumerable: true,
  get: function () {
    return isObj;
  }
});
Object.defineProperty(exports, 'isPrimitive', {
  enumerable: true,
  get: function () {
    return isPrimitive;
  }
});
Object.defineProperty(exports, 'isRoot', {
  enumerable: true,
  get: function () {
    return isRoot;
  }
});
Object.defineProperty(exports, 'isTag', {
  enumerable: true,
  get: function () {
    return isTag;
  }
});
Object.defineProperty(exports, 'selfClosingTags', {
  enumerable: true,
  get: function () {
    return selfClosingTags;
  }
});
Object.defineProperty(exports, 'startsWith', {
  enumerable: true,
  get: function () {
    return startsWith;
  }
});
Object.defineProperty(exports, 'toLowerCase', {
  enumerable: true,
  get: function () {
    return toLowerCase;
  }
});
Object.defineProperty(exports, 'toUpperCase', {
  enumerable: true,
  get: function () {
    return toUpperCase;
  }
});
Object.defineProperty(exports, 'tokenize', {
  enumerable: true,
  get: function () {
    return tokenize;
  }
});
Object.defineProperty(exports, 'trim', {
  enumerable: true,
  get: function () {
    return trim;
  }
});
//# sourceMappingURL=util-C4sKiPPI.cjs.map