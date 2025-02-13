// sanitize.ts
import { endsWith, toLowerCase } from "./util";

/**
 * A basic tool for HTML entities encoding.
 * Encodes HTML entities like &, <, >, ", and '.
 * @param str The source string to encode.
 * @returns The encoded string.
 */
export const encodeEntities = (str: string): string =>
  str.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] || /* istanbul ignore next @preserve */ char));

/**
 * Sanitizes a URL to prevent XSS vulnerabilities.
 * Removes potentially dangerous URL schemes like javascript:, data:, and vbscript:.
 * @param url The URL to sanitize.
 * @returns The sanitized URL, or an empty string if the URL is unsafe.
 */
export const sanitizeUrl = (url: string): string => {
  const decoded = decodeURIComponent(url.trim());
  if (/^(?:javascript|data|vbscript):/i.test(decoded)) return "";
  return encodeEntities(decoded);
};

/**
 * Sanitizes HTML attribute values to prevent XSS vulnerabilities.
 * Encodes HTML entities and sanitizes URLs for specific attributes like src, href, action,
 * formaction, and attributes ending with 'url'.
 * @param attrName The attribute name.
 * @param initialValue The attribute value to sanitize.
 * @returns The sanitized attribute value.
 */
export const sanitizeAttrValue = (
  attrName: string,
  initialValue: string,
): string => {
  if (!initialValue) return "";
  const name = toLowerCase(attrName);
  const value = initialValue.trim();

  if (
    name === "src" ||
    name === "href" ||
    name === "action" ||
    name === "formaction" ||
    endsWith(name, "url")
  ) {
    return sanitizeUrl(value);
  }

  return encodeEntities(value);
};
