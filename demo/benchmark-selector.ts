// benchmark-selector.ts
/**
 * ```bash
 * node --experimental-transform-types demo/benchmark-selector.ts
 * ```
 * ```bash
 * deno demo/benchmark-selector.ts
 * ```
 */
import { DomParser } from '../src/parts/dom-parser.ts';
import { selectorCache } from '../src/parts/selectors.ts';


const html = `
  <div class="container">
    ${Array(1000).fill('<p class="text">Item</p>').join('\n')}
  </div>
`;

const dp = DomParser().parseFromString(html).root;

// Warm up
dp.querySelectorAll('p.text');

// Benchmark uncached vs cached
const iterations = 1000;

console.log('Benchmarking DomParser');
console.time('uncached');
selectorCache.clear();
for (let i = 0; i < iterations; i++) {
  dp.querySelectorAll('p.text');
}
console.timeEnd('uncached');

console.time('cached');
for (let i = 0; i < iterations; i++) {
  dp.querySelectorAll('p.text');
}
console.timeEnd('cached');

console.log('Cache stats:', selectorCache.getStats());