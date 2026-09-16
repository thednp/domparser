/*!
* @thednp/domparser CJS v0.2.0
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/domparser/blob/master/LICENSE)
*/

import { y as ParseResult } from "./types-BKepT8m1.cjs";
//#region src/parts/parser.d.ts
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
export declare function Parser(): {
  parseFromString(htmlString?: string): ParseResult;
};
//#endregion
//# sourceMappingURL=parser.d.cts.map