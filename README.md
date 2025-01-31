## DOMParser
[![Coverage Status](https://coveralls.io/repos/github/thednp/domparser/badge.svg)](https://coveralls.io/github/thednp/domparser) 
[![NPM Version](https://img.shields.io/npm/v/@thednp/domparser.svg)](https://www.npmjs.com/package/@thednp/domparser)
[![NPM Downloads](https://img.shields.io/npm/dm/@thednp/domparser.svg)](http://npm-stat.com/charts.html?@thednp/domparser)
[![ci](https://github.com/thednp/domparser/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/domparser/actions/workflows/ci.yml)
[![typescript version](https://img.shields.io/badge/typescript-5.7.3-brightgreen)](https://www.typescriptlang.org/)
[![vitest version](https://img.shields.io/badge/vitest-3.0.4-brightgreen)](https://vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-6.0.11-brightgreen)](https://vitejs.dev/)

A very light and TypeScript sourced [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) for isomorphic applications. Because of its size (around 1Kb gzipped), you can include it in both your server and especially your client to greatly reduce your application bundle size since it only works with `text/html` string input.

The purpose of this library is to provide a lightweight yet reliable HTML parser without having to rely on [jsdom](https://github.com/jsdom/jsdom), [json5](https://json5.org) and even tools like [cheerio](https://cheerio.js.org). On that note, it doesn't come as a drop-in replacement/shim for the original DOMParser, but an extremely useful tool for many more scenarios.


## Which apps can use it
* plugins that transform SVG files/markup to components for UI frameworks like React/Solid;
* plugins that manage a website's metadata;
* plugins that implement unit testing in a virtual/isolated enviroment;
* apps that perform web research and/or web-scrapping; 
* generally all apps that rely on a very fast runtime.


## Installation
```bash
npm install @thednp/domparser
```

```bash
pnpm add @thednp/domparser
```

```bash
deno install npm:@thednp/domparser
```

```bash
bun install @thednp/domparser
```


## Usage
In your regular day to day usage, you will find yourself writing something like this:

Let's take a source as example:
```html
<html>
    <head>
        <meta charset="UTF-8">
        <title>Example</title>
    </head>
    <body>
        <h1>Hello World!</h1>
        <p class="example" aria-hidden="true">This is an example.</p>
        <custom-element />
        Some text node.
        <Counter count="0" />
    </body>
</html>
```

First let's import and initialize the parser and designate the source to be parsed:
```ts
import NodeParser from '@thednp/domparser';

// init
const parser = new NodeParser();

// source
const html = source.trim();
/* 
// or await fs.promises('')
const html = await fs.readFile("/path-to/index.html", "utf-8");
*/
```
**Note** - it's a good idea to import the default with a different name to avoid conflicts with the native DOMParser when your app streams to or hydrates the client.


Next let's parse the source and work with the `tags` and `components`: 
```ts
// parse the source
const { components, tags, root } =  parser.parseFromString(html);

// work with the components
console.log(components);
/* [
    // this looks like a CustomElement,
    // you can get it via customElements.get('custom-element')
    "custom-element",
    // this looks like a UI framework component
    // handle it accordingly
    "Counter"
]
*/

// work with the tags
console.log(tags);
/* // a list of all tags found in the markup
[
  'html',  'head',
  'meta',  'title',
  'body',  'h1',
  'p'
] */
```

Lastly and most importantly, work with the real result of the parser:
```ts
// work with the root
console.log(root);
/* {
  "nodeName": "#document",
  "attributes": {},
  "children": [
    {
      "tagName": "html",
      "nodeName": "HTML",
      "attributes": {},
      "children": [
        {
          "tagName": "head",
          "nodeName": "HEAD",
          "attributes": {},
          "children": [
            {
              "tagName": "meta",
              "nodeName": "META",
              "attributes": {
                "charset": "UTF-8"
              },
              "children": []
            },
            {
              "tagName": "title",
              "nodeName": "TITLE",
              "attributes": {},
              "children": [
                {
                  "nodeName": "#text",
                  "attributes": {},
                  "children": [],
                  "value": "Example"
                }
              ]
            }
          ]
        },
        {
          "tagName": "body",
          "nodeName": "BODY",
          "attributes": {},
          "children": [
            {
              "tagName": "h1",
              "nodeName": "H1",
              "attributes": {},
              "children": [
                {
                  "nodeName": "#text",
                  "attributes": {},
                  "children": [],
                  "value": "Hello World!"
                }
              ]
            },
            {
              "tagName": "p",
              "nodeName": "P",
              "attributes": {
                "class": "example",
                "aria-hidden": "true"
              },
              "children": [
                {
                  "nodeName": "#text",
                  "attributes": {},
                  "children": [],
                  "value": "This is an example."
                }
              ]
            },
            {
              "tagName": "custom-element",
              "nodeName": "CUSTOM-ELEMENT",
              "attributes": {},
              "children": []
            },
            {
              "nodeName": "#text",
              "attributes": {},
              "children": [],
              "value": "Some text node."
            },
            {
              "tagName": "Counter",
              "nodeName": "COUNTER",
              "attributes": {
                "count": "0"
              },
              "children": []
            }
          ]
        }
      ]
    }
  ]
}*/
```
**Notes**:
* the parser properly handles `CustomElement`s, UI Library components, and even camelCase tags like `clipPath` or attributes like `preserveAspectRatio`
* the current implementation doesn't have a way to sanitize the tags' attributes, but it will soon have.


## License
DOMParser is [MIT Licensed](https://github.com/thednp/domparser/blob/master/LICENSE).
