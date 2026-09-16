export type * from "./parts/types.d.ts";
export * from "./parts/util.ts";
export * from "./parts/prototype.ts";
export { matchesSelector, selectorCache } from "./parts/selectors.ts";
export { Parser } from "./parts/parser.ts";
export { DomParser } from "./parts/dom-parser.ts";
import pkg from "../package.json" with { type: "json" };
export const version = pkg.version;
