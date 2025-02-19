import { defineConfig } from 'tsup'

export default defineConfig(
  // {
  //   entryPoints: {
  //     'index': 'src/index.ts',
  //     // 'parser': 'src/parts/parser.ts',
  //     // 'dom-parser': 'src/parts/dom-parser.ts',
  //     // 'prototype': 'src/parts/prototype.ts',
  //   },
  //   format: ['esm', 'cjs', 'iife'],
  //   dts: true,
  //   clean: true,
  //   sourcemap: true,
  //   splitting: false,
  //   bundle: true,
  //   outExtension: ({ format }) => ({
  //     js: {
  //       esm: '.mjs',
  //       cjs: '.cjs',
  //       iife: '.js'
  //     }[format]
  //   }),
  //   esbuildOptions(options) {
  //     options.legalComments = 'none';
  //     options.globalName = "DOM"
  //     options.target = "es2020"
  //   }
  // },
  [
    {
      entryPoints: {
        'index': 'src/index.ts',
      },
      format: ['esm', 'cjs', 'iife'],
      dts: true,
      clean: true,
      sourcemap: true,
      splitting: false,
      outExtension: ({ format }) => ({
        js: {
          esm: '.mjs',
          cjs: '.cjs',
          iife: '.js'
        }[format]
      }),
      esbuildOptions(options) {
        options.legalComments = 'none';
        options.globalName = "DOM"
        options.target = "es2020"
      }
    },
    {
      entryPoints: {
        'dom-parser': 'src/parts/dom-parser.ts',
      },
      format: ['esm', 'cjs', 'iife'],
      dts: true,
      sourcemap: true,
      splitting: true,
      outExtension: ({ format }) => ({
        js: {
          esm: '.mjs',
          cjs: '.cjs',
          iife: '.js'
        }[format]
      }),
      esbuildOptions(options) {
        options.legalComments = 'none';
        options.globalName = "DomParser"
        options.target = "es2020"
      }
    },
    {
      entryPoints: {
        'parser': 'src/parts/parser.ts',
      },
      format: ['esm', 'cjs', 'iife'],
      dts: true,
      sourcemap: true,
      splitting: true,
      outExtension: ({ format }) => ({
        js: {
          esm: '.mjs',
          cjs: '.cjs',
          iife: '.js'
        }[format]
      }),
      esbuildOptions(options) {
        options.legalComments = 'none';
        options.globalName = "Parser"
        options.target = "es2020"
      }
    },
    {
      entryPoints: {
        'dom': 'src/parts/prototype.ts',
      },
      format: ['esm', 'cjs', 'iife'],
      dts: true,
      sourcemap: true,
      splitting: true,
      outExtension: ({ format }) => ({
        js: {
          esm: '.mjs',
          cjs: '.cjs',
          iife: '.js'
        }[format]
      }),
      esbuildOptions(options) {
        options.legalComments = 'none';
        options.globalName = "DOM"
        options.target = "es2020"
      }
    },
  ]
);
