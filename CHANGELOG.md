# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-09-16

### Fixed
- **DomParser: case-insensitive tag matching** — `<DIV></div>`, `<BR>`, `<META charset="utf-8">` now handled correctly. Tag names are lowercased once and compared consistently across self-closing detection, unsafe tag filtering, and tag stack matching.
- **DomParser: case-insensitive filterTags/filterAttrs** — `filterTags: ["script"]` now blocks `<SCRIPT>`; `filterAttrs: ["DISABLED"]` now filters `disabled`.
- **SelectorCacheMap: miss() counter** — `miss()` was incrementing `hits` instead of `misses`, producing incorrect cache statistics.
- **convertToNode: empty string crash** — `tokenize("")` returned `[]` causing `undefined` destructure. Replaced with simple `startsWith("<!--")` heuristic.

### Changed
- **Selectors: pre-parsed SelectorPart[][]** — Selector parsing (regex `match`, `slice`, `replace`) moved from per-node to once-per-selector in cache. Per-node matcher now uses pre-parsed parts with pre-lowercased tag names.
- **Query methods: tree traversal** — Removed O(n²) `stack.slice(1,-1).map(registerChild)` ancestor registration. `querySelector`, `querySelectorAll`, `getElementsByTagName`, `getElementsByClassName`, `getElementById`, and `all` now traverse subtrees via `collectSubtree()`. Removed `registerChild` from `ElementAPI` type.
- **Tokenizer: hasEquals flag** — `token.includes("=")` per-char (O(m) per char) replaced with a `hasEquals` boolean flag set on `=` char code.
- **getElementsByTagName: nodeName comparison** — Compares against `nodeName` (already uppercase) instead of `toLowerCase` both sides.
- **getElementsByClassName: includes check** — Uses `" "+classAttr+" "` includes instead of `split(/\s+/)`.
- **isRoot check removed** — `isRoot({nodeName} as RootNode)` temp object allocation replaced with `nodeName === "#document"`.
- **Array.alloc removed** — `["text","comment"].includes(tokenType)` replaced with `tokenType === "text" || tokenType === "comment"` (no array alloc per token).
- **escape() hoisted** — Map object hoisted outside function; dead `str.toString()` removed.

### Removed
- `registerChild` method from DOMNode/ElementAPI (no longer needed with tree traversal).
- Unused `TextToken` and `tokenize` imports from prototype.ts.

## [0.1.10] - 2026-03-26

### Changed
- Updated dependencies.
- Updated tsdown config.
- Removed npmignore.
- Removed badges workflow.
- Updated README.

## [0.1.9] - 2025-12-26

### Fixed
- Reverted to v0.1.7 base.

### Changed
- Updated publish workflow.

## [0.1.8] - 2025-09-26

### Fixed
- Attempt to fix issue #1.

### Changed
- Updated dependencies.
- Updated tooling config.

## [0.1.7] - 2025-06-25

### Added
- `before` and `after` methods for inserting sibling nodes.
- Modularized node creation and parent relationship registration.

### Changed
- Updated README.

## [0.1.6] - 2025-06-06

### Fixed
- README typos.

## [0.1.5] - 2025-05-28

### Fixed
- Test page.

## [0.1.4] - 2025-05-28

### Changed
- Improved `innerHTML` and `outerHTML` to filter out comments.
- Improved tsup build tool settings.
- Unified tokenizer handler for comments (regular and CDATA).
- Improved handling of `<pre>` tags to preserve formatting.
- Updated tests.

## [0.1.3] - 2025-05-25

### Fixed
- Framework-specific hydration comments (e.g.: `<!--[!-->`).

## [0.1.0] - 2025-05-25

### Added
- Robust parsing implementation with chunking strategy (64KB chunks).
- Tokenizer handles malformed HTML attributes (missing quotes strip all attributes).
- Tree-shaking friendly build with separate bundles.
- DOM creation API (`createElement`, `createElementNS`, `createComment`, `createTextNode`).
- Node API (`append`, `appendChild`, `before`, `after`, `removeChild`, `replaceChildren`, `remove`).
- Selector engine (`querySelector`, `querySelectorAll`, `getElementById`, `getElementsByClassName`, `getElementsByTagName`, `closest`, `matches`).
- Attribute API (`hasAttribute`, `getAttribute`, `setAttribute`, `removeAttribute`, namespaced variants).
- Content exports (`innerHTML`, `outerHTML`, `textContent`).
- `contains` method for ancestor relationship checking.
- `filterTags` and `filterAttrs` options for XSS sanitization.
- `onNodeCallback` for custom node processing.

[Unreleased]: https://github.com/thednp/domparser/compare/v0.1.10...HEAD
[0.1.10]: https://github.com/thednp/domparser/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/thednp/domparser/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/thednp/domparser/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/thednp/domparser/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/thednp/domparser/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/thednp/domparser/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/thednp/domparser/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/thednp/domparser/compare/v0.1.0...v0.1.3
[0.1.0]: https://github.com/thednp/domparser/releases/tag/v0.1.0
