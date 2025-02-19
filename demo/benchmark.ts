// benchmark.ts
/**
 * ```bash
 * node --experimental-transform-types demo/benchmark.ts
 * ```
 * ```bash
 * deno demo/benchmark.ts
 * ```
 */
import { Dom } from '../src/parts/dom.ts';
import { selectorCache } from '../src/parts/selectors.ts';

const html = `
  <div class="container">
    ${Array(1000).fill('<p class="text">Item</p>').join('\n')}
  </div>
`;

const dom = Dom(html);

// Warm up
dom.querySelectorAll('p.text');

// Benchmark uncached vs cached
const iterations = 1000;

console.time('uncached');
selectorCache.clear();
for (let i = 0; i < iterations; i++) {
  dom.querySelectorAll('p.text');
}
console.timeEnd('uncached');

console.time('cached');
for (let i = 0; i < iterations; i++) {
  dom.querySelectorAll('p.text');
}
console.timeEnd('cached');

console.log('Cache stats:', selectorCache.getStats());