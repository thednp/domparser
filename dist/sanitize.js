"use strict";
var DOM = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/parts/sanitize.ts
  var sanitize_exports = {};
  __export(sanitize_exports, {
    encodeEntities: () => encodeEntities,
    sanitizeAttrValue: () => sanitizeAttrValue,
    sanitizeUrl: () => sanitizeUrl
  });

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
  return __toCommonJS(sanitize_exports);
})();
//# sourceMappingURL=sanitize.js.map