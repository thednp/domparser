import { defineConfig } from 'tsdown'

export default defineConfig(
  {
    entry: {
      'index': 'src/index.ts',
      'parser': 'src/parts/parser.ts',
      'dom-parser': 'src/parts/dom-parser.ts',
      'dom': 'src/parts/prototype.ts',
    },
    target: "es2020",
    exports: true,
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    skipNodeModulesBundle: true,
    globalName: "DomParser"
  },
);
