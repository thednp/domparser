## DOMParser
[![Coverage Status](https://coveralls.io/repos/github/thednp/domparser/badge.svg)](https://coveralls.io/github/thednp/domparser) 
[![NPM Version](https://img.shields.io/npm/v/@thednp/domparser.svg)](https://www.npmjs.com/package/@thednp/domparser)
[![NPM Downloads](https://img.shields.io/npm/dm/@thednp/domparser.svg)](http://npm-stat.com/charts.html?@thednp/domparser)
[![ci](https://github.com/thednp/domparser/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/domparser/actions/workflows/ci.yml)
[![typescript version](https://img.shields.io/badge/typescript-5.7.3-brightgreen)](https://www.typescriptlang.org/)
[![vitest version](https://img.shields.io/badge/vitest-3.0.5-brightgreen)](https://vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-6.0.11-brightgreen)](https://vitejs.dev/)

A very light and TypeScript sourced [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) with basic sanitization features. Because of its size (around 1.3Kb gzipped), you can include it in both your server and especially your client to greatly reduce your application bundle size.

The purpose of this library is to provide a lightweight yet reliable HTML parser without having to depend on [jsdom](https://github.com/jsdom/jsdom), [json5](https://json5.org) and even newer tools like [cheerio](https://cheerio.js.org). Where these tools will try and reproduce a complete DOM tree with all attributes specific to each type, this little thing here only focuses on a basic structure making it many times more memory efficient and blazingly fast.

On that note, it doesn't come as a drop-in replacement/shim for the native DOMParser, but an extremely useful tool for many more scenarios.


## Which apps can use it
* plugins that transform SVG files/markup to components for UI frameworks like React/Solid, [a basic example](https://github.com/thednp/vite-plugin-vanjs-svg);
* plugins that manage a website's metadata;
* plugins that implement unit testing in a virtual/isolated enviroment;
* apps that perform web research and/or web-scrapping;
* apps that require basic sanitization;
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


## Basic Usage

### Source markup
<details>
<summary>Click to expand</summary>

Let's take a sample HTML source for this example:
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
        <!-- some comment -->
        Some text node.
        <Counter count="0" />
    </body>
</html>
```
</details>

### Initialize
<details>
<summary>Click to expand</summary>

First let's import and initialize the parser and designate the source to be parsed:
```ts
import { Parser } from '@thednp/domparser';

// initialize
const parser = Parser();

// source
const html = source.trim();
/* 
// or dynamically import it on your server side
const html = (await fs.readFile("/path-to/index.html", "utf-8")).trim();
*/
```
</details>

### Results - tags and components
<details>
<summary>Click to expand</summary>

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
</details>


### Results - DOM tree
<details>
<summary>Click to expand</summary>

Lastly and most importantly, work with the real result of the parser:
```ts
// work with the root
console.log(root);
/* {
  "nodeName": "#document",
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
                  "nodeValue": "Example"
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
                  "nodeValue": "Hello World!"
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
                  "nodeValue": "This is an example."
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
              "nodeName": "#comment",
              "nodeValue": "<!-- some comment -->"
            },
            {
              "nodeName": "#text",
              "nodeValue": "Some text node."
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
</details>


## Options

**DOMParser** sanitizes attribute values by default, but it can also be configured to remove potentially harmful tags and/or attributes:

<details>
<summary>Click to expand</summary>

Here's a quick example using the options:
```ts
import { Parser } from "@thednp/domparser"

const config = {
  // Common dangerous tags that could lead to XSS attacks
  filterTags: [
    "script", "style", "iframe", "object", "embed", "base", "form",
    "input", "button", "textarea", "select", "option"
  ],
  // Unsafe attributes that could lead to XSS attacks
  filterAttrs: [
    "onerror", "onload", "onunload", "onclick", "ondblclick", "onmousedown",
    "onmouseup", "onmouseover", "onmousemove", "onmouseout", "onkeydown",
    "onkeypress", "onkeyup", "onchange", "onsubmit", "onreset", "onselect",
    "onblur", "onfocus", "formaction", "href", "xlink:href", "action"
  ]
}

const parser = Parser(config)
const parsedHTML = parser.parseFromString("Some long HTML")
// all configured tags and attributes will be removed
// from the resulted parsedHTML.root object tree
```
</details>


## Other tools
The script also exports some tools you can use:

### encodeEntities
```ts
/**
 * A basic tool for HTML entities encoding
 * @param str the source string
 * @returns encoded string
 */
const encodeEntities: (str: string) => string;
```

### getAttributes
```ts
/**
 * Get attributes from a string token and return an object
 * where the keys are the names of the attributes and the values
 * are the sanitized values of the attributes.
 *
 * @param tagStr the tring token
 * @param unsafeAttrs an optional set of unsafe attributes
 * @returns the attributes object
 */
const getAttributes: (tagStr: string, unsafeAttrs?: Set<string>) => Record<string, string>;
```

### sanitizeAttrValue
```ts
/**
 * Sanitizes attribute values
 * @param name the attribute name
 * @param initialValue the attribute value
 * @returns the sanitized value
 */
const sanitizeAttrValue: (name: string, initialValue: string) => string;
```

### sanitizeUrl
```ts
/**
 * Sanitizes URLs in attribute values
 * @param url the URL
 * @returns the sanitized URL
 */
export declare const sanitizeUrl: (url: string) => string;
```

What you want to do:
```ts
import {
  encodeEntities,
  getAttributes,
  sanitizeAttrValue,
  sanitizeUrl
} from "@thednp/domparser"

// implement sanitization in your own library or application
```


## Technical Notes
* this parser should be capable to handle HTML comments `<!-- comment -->` even if they have other valid tags inside, but considering that nested comments aren't supported in the current HTML5 draft; the comment's usual structure is `{ nodeName: "#comment", nodeValue: "<!-- comment -->" }`;
* also the parser will handle self-closing tags and some cases of incorrect markup such as `<path />` versus `<path></path>` (cases where both are valid) and `<meta name=".." />` vs `<meta name="..">` (only the second case is valid);
* another note is that `<!doctype>` tag is always stripped because we already contain everything in a `root` node;
* similar to the native DOMParser, this script returns a document like tree structure where the root element is a "root" property of the output; what's different is that our script will also export a list of tags and a list of components;
* the script properly handles `CustomElement`s, UI Library components, and even camelCase tags like `clipPath` or attributes like `preserveAspectRatio`;
* the current implementation does provide basic sanitization, by default all values are sanitized and all tags and attributes are allowed, but it all comes to you to implement the best and most secure application you are required to develop;
* if you encounter any issue, please report it [here](https://github.com/thednp/domparser/issues), thanks!


## Backstory
I've recently created some tools to generate SVG components for [VanJS](https://github.com/thednp/vite-plugin-vanjs-svg) and other tools, and I noticed my "hello world" app bundle was 102Kb and looking into the dependencies, I found that an entire parser and tooling was all bundled in my app client side code and I thought: that's not good. Then I immediately started to work on this thing.

The result: bundle size 10Kb, render time significantly faster, basically microseconds.


## License
**DOMParser** is [MIT Licensed](https://github.com/thednp/domparser/blob/master/LICENSE).
