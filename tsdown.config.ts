import { defineConfig, type UserConfig } from 'tsdown';
import strip from "vite-plugin-strip-comments"

const pkg = await import("./package.json", { with: { type: "json" } }).then(
  (m) => m.default,
);

const year = new Date().getFullYear();
const banner = `/*!
* @thednp/domparser $package v${pkg.version}
* Copyright ${year} © ${pkg.author}
* Licensed under MIT (https://github.com/thednp/domparser/blob/master/LICENSE)
*/
`;


export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'parser': 'src/parts/parser.ts',
    'dom-parser': 'src/parts/dom-parser.ts',
    'dom': 'src/parts/prototype.ts',
  },
  target: "esnext",
  platform: "neutral",
  exports: true,
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  banner: ({ format }) => {
    const fmt = format === "es" ? "ESM" : format.toUpperCase();
    return banner.replace("$package", fmt)
  },
  sourcemap: true,
  plugins: [strip({ type: "keep-jsdoc" })],
  globalName: "DomParser",
  deps: { 
    skipNodeModulesBundle: true,
  }
});
