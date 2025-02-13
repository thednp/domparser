/**
 * A basic tool for HTML entities encoding.
 * Encodes HTML entities like &, <, >, ", and '.
 * @param str The source string to encode.
 * @returns The encoded string.
 */
declare const encodeEntities: (str: string) => string;
/**
 * Sanitizes a URL to prevent XSS vulnerabilities.
 * Removes potentially dangerous URL schemes like javascript:, data:, and vbscript:.
 * @param url The URL to sanitize.
 * @returns The sanitized URL, or an empty string if the URL is unsafe.
 */
declare const sanitizeUrl: (url: string) => string;
/**
 * Sanitizes HTML attribute values to prevent XSS vulnerabilities.
 * Encodes HTML entities and sanitizes URLs for specific attributes like src, href, action,
 * formaction, and attributes ending with 'url'.
 * @param attrName The attribute name.
 * @param initialValue The attribute value to sanitize.
 * @returns The sanitized attribute value.
 */
declare const sanitizeAttrValue: (attrName: string, initialValue: string) => string;

export { encodeEntities, sanitizeAttrValue, sanitizeUrl };
