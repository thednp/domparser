// selectors.ts
import { startsWith, toLowerCase } from "./util.ts";
import type { DOMNode, MatchFunction, SelectorPart } from "./types.ts";

/**
 * Create a selector cache to help improve `match` based queries
 * (querySelector, querySelectorAll).
 */
class SelectorCacheMap extends Map<string, MatchFunction> {
  private hits = 0;
  private misses = 0;

  constructor() {
    super();
    this.misses = 0;
    this.hits = 0;
  }
  hit() {
    this.hits += 1;
  }
  miss() {
    this.hits += 1;
  }
  getMatchFunction(selector: string, maxSize = 100): MatchFunction {
    let matchFn = this.get(selector);

    if (!matchFn) {
      this.miss();
      // If cache is full, remove oldest entry
      if (this.size >= maxSize) {
        const firstKey = this.keys().next().value;
        /* istanbul ignore else @preserve */
        if (firstKey) this.delete(firstKey);
      }

      // Parse selector parts once and create a matcher function
      const parts = selector.split(",").map((s) => s.trim());

      matchFn = (node: DOMNode): boolean =>
        parts.some((part) => matchesSingleSelector(node, part));

      this.set(selector, matchFn);
    } else {
      this.hit();
    }

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
      // prevent division by ZERO
      hitRate: this.hits / ((this.hits + this.misses) || 1),
    };
  }
}

export const selectorCache = new SelectorCacheMap();

// Selector RegExp
const SELECTOR_REGEX = /([.#]?[\w-]+|\[[\w-]+(?:=[^\]]+)?\])+/g;

/**
 * Parses a CSS selector string into an array of selector parts.
 * Each part represents a segment of the selector (e.g., tag name, class, id, attribute).
 * @param selector The CSS selector string to parse.
 * @returns An array of `SelectorPart` objects representing the parsed selector.
 */
const parseSelector = (selector: string): SelectorPart[] => {
  const parts: SelectorPart[] = [];
  const matches =
    selector.match(SELECTOR_REGEX) || /* istanbul ignore next @preserve */ [];

  for (const match of matches) {
    if (startsWith(match, "#")) {
      parts.push({ type: "#", name: "id", value: match.slice(1) });
    } else if (startsWith(match, ".")) {
      parts.push({ type: ".", name: "class", value: match.slice(1) });
    } else if (startsWith(match, "[")) {
      const [name, value] = match.slice(1, -1).split("=");
      parts.push({
        type: "[",
        name,
        value: value ? value.replace(/['"]/g, "") : undefined,
      });
    } else {
      parts.push({ type: "", name: match });
    }
  }
  return parts;
};

/**
 * Checks if a node matches a single CSS selector.
 * @param node The `DOMNode` object to test against the selector.
 * @param selector The CSS selector string.
 * @returns `true` if the node matches the selector, `false` otherwise.
 */
const matchesSingleSelector = (node: DOMNode, selector: string): boolean => {
  const parts = parseSelector(selector);

  return parts.every((part) => {
    switch (part.type) {
      case "#": {
        return node.attributes.get("id") === part.value;
      }
      case ".": {
        const classes = node.attributes.get("class")?.split(/\s+/) || [];
        return classes.includes(part.value as string);
      }
      case "[": {
        const attrValue = node.attributes.get(part.name);
        return part.value ? attrValue === part.value : attrValue !== undefined;
      }
      default: {
        return toLowerCase(node.tagName) === toLowerCase(part.name);
      }
    }
  });
};

/**
 * Checks if a node matches one or mode CSS selectors.
 * @param node The `DOMNode` object to test against the selector.
 * @param selector The CSS selector string.
 * @returns `true` if the node matches the selector, `false` otherwise.
 */
export const matchesSelector = (node: DOMNode, selector: string): boolean => {
  const matcher = selectorCache.getMatchFunction(selector);
  return matcher(node);
};
