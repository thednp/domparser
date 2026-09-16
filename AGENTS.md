# AGENTS.md

This file contains information for AI agents working on this codebase.

## Project Overview

`@thednp/domparser` is a lightweight TypeScript HTML parser for isomorphic applications. It provides three main components:

- **Parser** — Fast, minimal DOM tree creation (~1.5kB gzipped)
- **DomParser** — Full DOM-like API with selectors, attributes, and manipulation (~4.1kB gzipped)
- **DOM** — `Document`-like creation API (~2.6kB gzipped)

## Architecture

```
src/
  index.ts          — Main entry, re-exports all public API
  parts/
    util.ts         — Tokenizer, attribute parser, type guards, escape, constants
    types.ts        — All TypeScript type definitions
    parser.ts       — Lightweight Parser implementation
    dom-parser.ts   — DomParser with filtering and DOM API
    prototype.ts    — DOM node creation, tree manipulation, serialization
    selectors.ts    — CSS selector engine with LRU cache
test/
  index.test.ts     — All tests (single file, 100% coverage)
```

## Build & Test Commands

```bash
pnpm test           # Run tests (vitest, headless browser)
pnpm check:ts       # TypeScript type checking (tsc --noEmit)
pnpm lint           # Deno lint + type check
pnpm build          # Build with tsdown (ESM + CJS)
pnpm dev            # Serve demo on port 3000
```

**Always run `pnpm test && pnpm check:ts` before committing.** The `pnpm lint` command may fail on pre-existing sloppy import issues in `src/index.ts` — this is a known deno lint config issue, not a code problem.

## Code Conventions

- **No comments** — Code has JSDoc on public APIs but inline comments are stripped by `vite-plugin-strip-comments` during build.
- **No classes** — Everything uses factory functions (`Parser()`, `DomParser()`, `createNode()`) with closures and `Object.defineProperties`.
- **Character codes** — Tokenizer uses `charCodeAt()` and numeric comparisons (e.g., `60` for `<`, `62` for `>`) instead of string comparisons.
- **Chunking** — Tokenizer processes HTML in 64KB chunks to prevent memory overload.
- **Immutable accessors** — DOM properties use `Object.defineProperties` with getters; no direct mutation.
- **Set-based filtering** — `selfClosingTags`, `unsafeTags`, `unsafeAttrs` use `Set` for O(1) lookup.

## Key Patterns

### Node creation flow
```
createElement() → createNode() → setupChildNode() → appendChild()
```

### Selector matching flow
```
matchesSelector() → selectorCache.getMatchFunction() → matchParts(node, preParsedParts)
```

### Tokenizer flow
```
tokenize() → chunk loop → char-by-char state machine → HTMLToken[]
```

## Testing

- Single test file: `test/index.test.ts`
- Framework: Vitest with browser mode (headless)
- Coverage: Istanbul, 100% statements/branches/functions/lines target
- All tests run against both `Parser` and `DomParser`
- Edge cases include malformed HTML, self-closing tags, CDATA, comments, script/style content limits

## Dependencies

**Zero runtime dependencies.** All devDependencies are for build/test tooling only.

Key devDependencies:
- `tsdown` — Build tool (ESM + CJS output)
- `vitest` — Test framework
- `jsdom` — Used only in benchmarks for comparison
- `typescript` — Type checking
- `deno` — Linting (via `deno lint`)

## Common Pitfalls

1. **`this` binding** — `createElement`, `getElementById`, etc. must be called on the root node instance. Destructuring detaches `this`.
2. **Tag case** — `nodeName` is always uppercase; `tagName` preserves original case. Use `toLowerCase()` for comparisons.
3. **Self-closing tags** — Check both `isSC` flag AND `selfClosingTags` set. SVG `<path />` is valid but `<div />` is not.
4. **Script/style content** — Tokenized as raw text up to 128KB limit. Content beyond limit is silently skipped.
5. **Attribute quotes** — Missing quotes in HTML attributes causes ALL attributes on that tag to be stripped.
