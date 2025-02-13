// src/parts/util.ts
var toLowerCase = (str) => str.toLowerCase();
var endsWith = (str, suffix) => str.endsWith(suffix);

// src/parts/sanitize.ts
var encodeEntities = (str) => str.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[char] || /* istanbul ignore next @preserve */
char);
var sanitizeUrl = (url) => {
  const decoded = decodeURIComponent(url.trim());
  if (/^(?:javascript|data|vbscript):/i.test(decoded)) return "";
  return encodeEntities(decoded);
};
var sanitizeAttrValue = (attrName, initialValue) => {
  if (!initialValue) return "";
  const name = toLowerCase(attrName);
  const value = initialValue.trim();
  if (name === "src" || name === "href" || name === "action" || name === "formaction" || endsWith(name, "url")) {
    return sanitizeUrl(value);
  }
  return encodeEntities(value);
};
export {
  encodeEntities,
  sanitizeAttrValue,
  sanitizeUrl
};
//# sourceMappingURL=sanitize.mjs.map