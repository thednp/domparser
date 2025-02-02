import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";

const NAME = 'Parser';

const fileName = {
  es: `index.mjs`,
  cjs: `index.cjs`,
  iife: `index.js`,
};

export default defineConfig({
  base: './',
  plugins: [
    dts({
      outDir: 'dist',
      copyDtsFiles: true,
      rollupTypes: true,
    }),
  ],
  esbuild: {
    legalComments: "none"
  },
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: NAME,
      formats: ['es', 'cjs', 'iife'],
      fileName: (format: string) => fileName[format],
    },
    sourcemap: true,
  },
});
