## DOMParser
[![Coverage Status](https://coveralls.io/repos/github/thednp/domparser/badge.svg)](https://coveralls.io/github/thednp/domparser) 
[![NPM Version](https://img.shields.io/npm/v/@thednp/domparser.svg)](https://www.npmjs.com/package/@thednp/domparser)
[![ci](https://github.com/thednp/domparser/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/domparser/actions/workflows/ci.yml)
[![typescript version](https://img.shields.io/badge/typescript-5.7.3-brightgreen)](https://www.typescriptlang.org/)
[![vitest version](https://img.shields.io/badge/vitest-3.0.6-brightgreen)](https://vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-6.1.1-brightgreen)](https://vitejs.dev/)

A TypeScript-based [HTML parser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) available in two versions: a lightweight **Parser** focused on speed and memory efficiency, and a feature-rich **DomParser** that provides a DOM-like API with additional capabilities like tag validation.

At just ~1Kb gzipped for the core parser, it's perfect for both server and client-side applications where bundle size matters. The more comprehensive version is ideal for development environments where markup validation and DOM manipulation are needed.

While not a direct replacement for the browser's native DOMParser, its modular architecture makes it versatile for various use cases. The library also includes a powerful DOM creation API that improves upon the native `Document` interface, offering a more intuitive and efficient way to build DOM trees programmatically.

Unlike alternatives such as [jsdom](https://github.com/jsdom/jsdom) or [cheerio](https://cheerio.js.org) that attempt to replicate the entire DOM specification, this library focuses on essential DOM features, resulting in significantly better performance and memory efficiency. In the [benchmark.ts](https://github.com/thednp/domparser/blob/master/demo/benchmark.ts) file we're comparing **Parser** and **DomParser** against **jsdom**, here are some results:

### Parsing Benchmarks
![Parsing Benchmarks](https://github.com/thednp/domparser/blob/master/demo/parsing-bench.svg)

### Query Benchmarks
![Parsing Benchmarks](https://github.com/thednp/domparser/blob/master/demo/query-bench.svg)


### Features
* **Minimal Size with Maximum Flexibility** (~1.1Kb core parser, ~3.5Kb parser with DOM API, ~2.5Kb DOM API)
* **Modern Tree-Shaking Friendly Architecture** (both versions packaged in separate bundles)
* **Isomorphic by Design** (Works in Node.js, Deno, Bun, browsers; No DOM dependencies)
* **High Performance** (Sub-millisecond parsing for typical HTML templates; very fast `match` based queries)
* **Typescript Support** (First-class TypeScript support with full types).
* **Tested with Vitest** (full 100% code coverage).


### Main Components
* **Parser** - the core parser which creates a basic DOM tree very fast and very memory efficient;
* **DomParser** - everything the basic **Parser** comes with, but also allows you to generate a DOM tree that can be manipulated and queried; it can even validate open and closing tags;
* **DOM** - a separate module that allows you to create a `Document` like object with similar API.


## Which apps can use it
* plugins that transform SVG files/markup to components for UI frameworks like React/Solid, [a basic example](https://github.com/thednp/vite-plugin-vanjs-svg);
* plugins that manage a website's metadata;
* plugins that implement unit testing in a virtual/isolated environment;
* apps that perform web research and/or web-scrapping;
* apps that support server side rendering (SSR);
* apps that require HTML markup validation;
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


## Parser Basic Usage

### Source markup

Let's take a sample HTML source for this example. We want to showcase all the capabilities and especially how the **Parser** handles special tags, comment and text nodes.

<details>
<summary>Click to expand</summary>

```html
<!doctype html>
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
**Notes**:
* the `<!doctype html>` tag will not be included in the resulted DOM tree, but **DomParser** will add it to the `root.doctype` property;
* the `charset` value of the `<meta>` tag will also be added to the `root.charset` property. 
</details>


### Parser Initialize

First let's import and initialize the **Parser** and designate the source to be parsed:
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

Next let's parse the source: 

```ts
// parse the source
const { components, tags, root } =  parser.parseFromString(html);
```


### Parse Results - tags and components

First let's talk about the `components`. All tags with a special pattern will be added to the components results: 
```ts
// list all components
console.log(components);
/*
[
  // this looks like a CustomElement,
  // you can get it via customElements.get('custom-element')
  "custom-element",
  // this looks like a UI framework component
  // handle it accordingly
  "Counter"
]
*/
```

Next talk about the `tags`. Basically all valid elements found in the given HTML markup, in order of appearence:
```ts
// list all tags
console.log(tags);
// ['html',  'head', 'meta',  'title', 'body',  'h1', 'p']
```


### Parse Results - DOM tree
Lastly and most importantly, we can finally about the real result of the parser, the DOM tree:
```ts
// work with the root
console.log(root);

/*
{
  "nodeName": "#document",
  "children": []
}
*/
```

Below we have a near complete representation of the given HTML markup, keep in mind that the contents of the `children` property is not included to shorten the DOM tree.

**IMPORTANT** - The light **Parser** will not distinguish nodes like `Element`, `SVGElement` from `TextNode` or `CommentNode` nodes, they are all included in the `children` property.

<details>
<summary>Click to expand</summary>

```ts
// the DOM tree output
/*
{
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
              "children": [],
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
              "children": [],
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
              ],
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
}
*/
```
</details>


## DomParser Usage
The **DomParser** returns a similar result as the basic **Parser**, however it also allows you to manipulate the DOM tree or create one similar to how `Document` API works, if no starting HTML markup is provided, you only have a basic `Document` like you can manipulate.

**NOTE** - Unlike the light **Parser** this version _will_ distinguish nodes like `Element`, `SVGElement` from `TextNode` or `CommentNode` nodes, which means that the `children` property contains `Element` | `SVGElement` while the `childNodes` property contains all types of nodes.

### Initialize DomParser
First let's import and initialize **DomParser** and get to build a DOM tree from scratch:
```ts
import { DomParser } from '@thednp/domparser';

// initialize
const { root: doc } = DomParser(/* options */).parseFromString();
```

Now we can use `Document` like methods to create a DOM tree structure:

```ts
const html = doc.createElement(
  "html",                           // tagName
  { class: "html-class" },          // attributes
  doc.createElement("head"),        // childNodes
  // ...other child nodes
);
```

Check the example below for a more detailed example:
<details>
<summary>Click to expand</summary>

```ts
// create a complete DOM tree
doc.createElement("html",   // tagName
  { class: "html-class" },  // attributes
  doc.createElement("head", // childNodes
    doc.createElement("title", "This is a title"),
    doc.createElement("meta", {
      name: "description",
      content: "Some description",
    }),
  ),
  doc.createElement("body",
    { id: "my-body", "data-url": "https://nice.com" },
    doc.createElement("h1", "This is a heading"),
    doc.createElement("p", "This is a paragraph"),
    doc.createTextNode("This is a `#text` node via doc.createTextNode"),
    doc.createComment("This is a `#comment` node created via doc.createComment"),
    "This is a text",                   // this will be added via doc.createTextNode
    "<!-- This is a comment again -->", // this will be added via doc.createComment
    doc.createElementNS("http://www.w3.org/2000/svg", "svg",
      { xmlns: "http://www.w3.org/2000/svg" },
      doc.createElementNS("http://www.w3.org/2000/svg", 'path', {
        d: "M0 0L10 10"
      })
    ),
  ),
);
```
</details>


### DomParser - Main Elements
The `document` like instance provides easy access to main `Element` like nodes: 

```ts
// work with the main elements
console.log(doc.documentElement); // <html>
console.log(doc.head);            // <head>
console.log(doc.body);            // <body>
console.log(doc.all);             // An array with all `Element` like nodes in the tree
```

### DomParser - Selector Engine

The API allows you to perform various queries: `getElementById` (exclusive to the root node), `getElementsByClassName` or `querySelector`. The selector engine uses cache to store common `match` based selectors and prevent re-processing of selectors and drastically increase performance.

```ts
// exclusive to the root node
console.log(doc.getElementById('my-id'));
```
Check below for more examples.

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

const doc = createDocument();

// exclusive to the root node
console.log(doc.getElementById('my-id'));
// returns node with id="my-id" or null otherwise

console.log(doc.getElementsByTagName('*'));
// returns nodes with all tag names

console.log(doc.getElementsByTagName('head'));
// returns an array with only <head> node in this case

console.log(doc.getElementsByClassName('html-head'));
// returns an array with only <head> node in this case

console.log(doc.body.querySelectorAll('h1, p'));
// handles multiple selectors and returns all Heading1 and Paragraphs
// found in the children of the body 

// parent-child relationship
console.log(doc.body.contains(svg));
// returns true

console.log(doc.head.contains(svg));
// returns false

console.log(svg.closest("#my-body"));
// returns the `body` object
```
**Note** - direct-child selectors and other pseudo-selectors are not supported.
</details>


### DomParser - Create DOM from HTML

**DomParser** has its own logic for parsing can be configured to remove potentially harmful tags and/or attributes. Here's a quick example:

```ts
import { DomParser } from "@thednp/domparser/dom-parser";

const doc = DomParser({ filterTags: ["script"] }).parseFromString(`<html><script src="some-url"></script></html>`);
```

Check below a more detailed example:

<details>
<summary>Click to expand</summary>

```ts
import { DomParser } from "@thednp/domparser/dom-parser";

const parserOptions = {
  // sets a callback to call on every new node
  onNodeCallback: (node, parent, root) => {
    // apply any validation, sanitization to your node
    // and return the SAME node reference
    doSomeFunctionWith(node, parent, root);
    return node;
  },

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

const { root: doc } = DomParser(parserOptions).parseFromString(
  "<!doctype html><html><body>This is a basic body</body></html>",
);
// > the doctype will be added to `doc` as a property;
// > all configured tags and attributes will be removed
// from the resulted parsedHTML.root object tree.
```
</details>


### Some caveats
* methods like `createElement`, `querySelector`, etc., are designed to be called on the root node instance (`doc.createElement(...)`) and rely on `this` being bound to the root node object. Destructuring (EG, `const { createElement } = DomParser.parseFromString()`) will detach these methods from their intended `this` context and cause errors; a workaround would be `createElement.call(yourRootNode, ...arguments)` but that would be detrimental to the readability of the code.
* if you call `DomParser` with an invalid HTML parameter or invalid parser options, it will throw a specific error.

Examples:
```ts
DomParser("invalid");
// > DomParserError: 1st parameter is not an object

DomParser.parserFromString({});
// > DomParserError: 1st parameter is not a string 
```


## API Reference 

### Document API
When you create a new **DomParser** instance, you immediately get access to a [Document-like API](https://developer.mozilla.org/en-US/docs/Web/API/Document), but only the essentials. On that note, you are provided with methods to create and remove nodes, check if nodes are added to the DOM tree, or apply queries.

#### Document - Create Root Node
Currently there are 2 methods to create a `Document` like root node:
* by invoking `DomParser(options).parseFromString("with starting html markup")` or with no arguments at all;
* by invoking `createDocument()`.

Example with first method:
```ts
import { DomParser } from "@thednp/domparser/dom-parser";

// create a root node
const { root: doc } = DomParser.parseFromString();
```

Example with second method:
```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root node
const doc = createDocument();
```

#### Document - Create Element / Node

The root node exposes all known `Document` like methods for creating new nodes, specifically `createElement`, `createElementNS`, `createComment` and `createTextNode` however the `<!doctype html>` node is not supported.

In most cases you'll be using something like this:
```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root node
const doc = createDocument();

// create an Element like node
const html = doc.createElement("html");
```
Check the example below for a more detailed workflow.

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root document
const doc = createDocument();

// create `Element` like nodes
const html = doc.createElement("html",
  // define an attributes object as second parameter
  // and/or define multiple child nodes as additional parameters
);
// => <html>

// create `SVGElement` like nodes or namespace
const svg = doc.createElementNS(
  "http://www.w3.org/2000/svg", // namespace
  "svg",                        // tagName
  {                             // attributes
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
  },
  // define multiple child nodes as additional parameters
);
// => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">

// create a `#text` node
const textNode = doc.createTextNode("Sample text node");
// => "Sample text node"

// create a `#comment` node
const comment = doc.createComment("This is a comment node");
// => "<!-- This is a comment node -->"
```
</details>

---

#### Document - Create Text and Comment Nodes

The API provides methods for creating text nodes and comment nodes, similar to the standard DOM:

* `createTextNode(text: string)` - creates a new text node with the given text content.
* `createComment(text: string)` - creates a new comment node with the given text content.

Examples:

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// Create a root document
const doc = createDocument();

// Create a text node
const textNode = doc.createTextNode("This is some text.");

// Create a comment node
const commentNode = doc.createComment("This is a comment.");

// Create an element to hold the nodes
const paragraph = doc.createElement("p");

// Append the text and comment nodes to the element
paragraph.append(textNode, commentNode);

// Append the element to the document body
doc.body.append(paragraph);

// Access the child nodes, including the text and comment
console.log(paragraph.childNodes);
// Output: [
//   { nodeName: '#text', nodeValue: 'This is some text.' },
//   { nodeName: '#comment', nodeValue: '<!-- This is a comment. -->' }
// 
```

</details>

You can also create text and comment nodes by simply providing a string as a child for the `createElement` method, which will handle it by converting it to a text or comment node accordingly.

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// Create a root document.
const doc = createDocument();

// Create a new paragraph element with text and comment nodes.
const paragraph = doc.createElement("p",
	"This is text content.",       // Automatically creates a text node.
	"<!-- This is a comment. -->", // Automatically creates a comment node
);

console.log(paragraph.childNodes);
// Output: [
//   { nodeName: '#text', nodeValue: 'This is text content.' },
//   { nodeName: '#comment', nodeValue: '<!-- This is a comment. -->' }
// ]
```
</details>

---

#### One syntax DOM tree

As showcased in the above example, this API is a different from the native API to greatly improve your workflow. In that sense that you can create an entire DOM tree with a single call, with node attributes and children relationships, without having to define a variable for each node, append each node to another.

Also you might not need to use `DomParser` in this case because we don't need a starting HTML markup, you can just import and use `createDocument` and get to create the DOM tree:

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root document
const doc = createDocument();

// create the entire page if you like
doc.createElement("html",            // tagName
  { class: "html-class" },           // attributes
  doc.createElement("head",          // childNodes
    // the following syntax call will automatically create a `#text` node
    doc.createElement("title", "This is a title"),
    doc.createElement("meta", {
      name: "description",
      content: "Some description",
    }),
  ),
  doc.createElement("body",
    // attributes can be optional
    doc.createElement("h1", "This is a heading"),
    doc.createElement("p", "This is a paragraph"),
  ),
);
```
</details>

---


#### Document - Ancestor Relationship

The API allows you to `append` nodes to the root node and later you can check if your nodes are present within the DOM tree via the `contains` method.

The `append` method is important for some reasons:
* we shouldn't be able to just splice or push into the stored objects, it needs to be consistent in keeping track of which node contains which;
* it's the only method available to add nodes to the DOM tree, which is a recommended practice to make sure selectors and other methods or properties work properly.

<details>
<summary>Click to expand</summary>

```ts
const doc = createDocument();

// create a target node
const childNode = document.createElement("div");

// check if root node contains a specific node
doc.contains(childNode);
// in this case returns `false` because it hasn't been appended
// to any existing node in the DOM tree

// if we append the node
doc.append(childNode);
doc.contains(childNode);
// this now returns `true`
```
</details>

---

#### Document - Children Relationship
The API exposes `Node` like `readonly` properties to access child nodes:
* `children` - all `Element` like nodes;
* `childNodes` - all nodes including `#text` and `#comment` nodes.

Along with these properties, the root node also provides accessors for `documentElement`, `head` and `body`, however the root node comes with an exclusive accessor for `all` which lists all existing `Element` like nodes in the DOM tree.

<details>
<summary>Click to expand</summary>

```ts
const doc = createDocument();

// create a target node
const childNode = document.createElement("html");

// now we append the node
doc.append(childNode);

// children accessor
console.log(doc.children);
// => [html]

// childNodes accessor
console.log(doc.childNodes);
// => [html]

// all accessor
console.log(doc.all);
// => [html]

// documentElement accessor
console.log(doc.documentElement);
// => html

// similarly we would have document.head and document.body
// if these nodes have been created and appended
```
</details>

---

#### Document - Remove / Replace Child Nodes
The Node like API also allows you to remove or replace one or more child nodes via `removeChild` and `replaceChildren` methods. Check examples below for more details.

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root document
const doc = createDocument();

// create a child node
const html = doc.createElement('html');

// append a child to the root node
doc.append(html);

// remove a child from the root node
doc.removeChild(html);

// remove all children of the root node
doc.replaceChildren();

// replace children of the root node
doc.replaceChildren(
  doc.createElement('html',
    doc.createElement('head'),
    doc.createElement('body'),
  ),
);

/* root only methods, internally used */
const html = doc.createElement('html');

// register a new node to be available for query by the root node
doc.register(html);

// remove a node from root node query results
doc.deregister(html);
```
**Note** - `register` and `deregister` are internally used when you call `node.append` and `node.removeChild` respectively. Generally you don't need to use these methods unless you want to override the entire prototype.
</details>

---

#### Document - Selector Engine

The Document API exposes all known methods to query the DOM tree, namely `getElementById`, `querySelector`, `querySelectorAll` ,`getElementsByClassName` and `getElementsByTagName`. Unlike the real DOM, instead of `NodeList` or live collections `HTMLCollection`, the results here are `Array` where applicable.

It should support multiple selectors comma separated and attribute selectors, however direct selectors and pseudo-selectors are not implemented. Also it caches up to 100 most used matching functions to prevent over processing of the selectors to push performance further.
<details>
<summary>Click to expand</summary>

```ts
const doc = createDocument();

doc.append(doc.createElement("div", {
  id: "my-div", class: "target", "data-visible": "true"
}));

// find node by ID attribute
doc.getElementById("my-div");
// => div#my-div.target

// find element by CSS selector
doc.querySelector('.target');
// => div#my-div.target

// find elements by attribute CSS selector
doc.querySelectorAll("[data-visible]");
// => [div#my-div.target]

// find elements by multiple selectors
doc.querySelectorAll("p, ul");
// => []

// find elements by class name
doc.getElementsByClassName('target');
// [div#my-div.target]

// find elements by tag name
doc.getElementsByTagName("div");
// => [div#my-div.target]

// find elements by ANY tag name
doc.getElementsByTagName("*");
// => [div#my-div.target]
```
</details>


### Node & Element API

A partial implementation of the [Element API](https://developer.mozilla.org/en-US/docs/Web/API/Element) and [Node API](https://developer.mozilla.org/en-US/docs/Web/API/Node) but only with the essentials. On that note events, animations, box model properties and other `Window` related API (EG: `getComputedStyle`, `customElements`, etc) are not available.

As a rule of thumbs, most properties are `readonly` accessors (getters) for consistency and other reasons some might consider security related.

#### Node - Ancestor Relationship

The `Node` API exposes `parentNode`, `ownerDocument` (getters) and `contains` (method):
<details>
<summary>Click to expand</summary>

```ts
const doc = createDocument();

const html = doc.createElement("html");
const head = doc.createElement("head");
const title = doc.createElement("title", "My App Title");

// append the html node to the root
doc.append(html);

// append the head node to the html node
html.append(head);
// after the above you can also call
// doc.documentElement.append(head)

// append the title node to the head node
head.append(title);

// check parentNode
console.log(title.parentNode);
// => head

// check ownerDocument
console.log(title.ownerDocument);
// => doc

// check if title is appended
console.log(head.contains(title));
// => true

// check if title and head nodes are appended
console.log(html.contains(title));

// check if title, head and html nodes are appended
console.log(doc.contains(title));
// => true
```
</details>

---

#### Node - Children Relationship

The `Node` prototype will only expose `readonly` properties (getters) to access `children` and `childNodes` for any node instance present in the DOM tree. The rule of thumbs is that if a node isn't appended to a parent, it should _not_ be present in the output of these accessors.

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root document
const doc = createDocument();

// create nodes
const html = doc.createElement('html');
const head = doc.createElement('head');
const body = doc.createElement('body');
const comment = doc.createComment('This is a comment');

// append nodes to DOM tree
doc.append(html);
html.append(head, body, comment);

// children
console.log(html.children);
// => [head, body]

// childNodes should also list other type of nodes
// such as #text or #comment nodes 
console.log(html.childNodes);
// => [head, body, comment]
```
</details>

---

#### Element - Remove / Replace Child Nodes

For consistency the `Element` prototype doesn't have a way to directly add or remove child nodes into the DOM tree, you need to use the provided API.
<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root document
const doc = createDocument();

// create nodes
const html = doc.createElement('html');
const body = doc.createElement('body');

// append a child to a parent node
html.append(body);

// remove a child from the parent node
html.removeChild(body);

// remove all children of a given node
html.replaceChildren();

// replace children of a given node
html.replaceChildren(
  doc.createElement('body',
    doc.createElement('header'),
    doc.createElement('main'),
    doc.createElement('footer'),
  ),
);

// any node in the DOM tree
// can just remove itself
html.remove();
```
</details>

---

#### Element - Attributes

Nodes enhanced with DOM methods and properties don't allow direct access to manipulate the attributes of an `Element` like node, you must use the following API:

##### Non-namespace Attributes
<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root document
const doc = createDocument();

// create a non-namespace node
const html = doc.createElement("html",
  // alternatively you could add an attributes object here
);

// set attribute
html.setAttribute("id", "app-head");

// check attribute
html.hasAttribute("id");
// => true

// get attribute
html.getAttribute("id");
```
</details>


##### Namespace Attributes
<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root document
const doc = createDocument();

// namespaced attributes
const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg",
  // alternativelly add an attributes object here
)

// set attributes
svg.setAttributeNS("http://www.w3.org/2000/svg", "xmlns", "http://www.w3.org/2000/svg");
svg.setAttributeNS("http://www.w3.org/2000/svg", "viewBox", "0 0 24 24");

// check attribute
svg.hasAttributeNS("http://www.w3.org/2000/svg", "viewBox");
// => true

// get attribute
svg.getAttributeNS("http://www.w3.org/2000/svg", "xmlns");
// => "http://www.w3.org/2000/svg"

```
</details>

---

#### Element - Selector Engine
The Element API exposes all known methods to query the DOM tree except `getElementById` which is exclusive to the root node. Same caveats apply as for the Document API.

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root document
const doc = createDocument();

// create a DOM tree
doc.append(
  doc.createElement("html",
    doc.createElement("head",
      doc.createElement("title", "Page title")
    ),
    doc.createElement("body",
      doc.createElement("main", { class: "container" },
        doc.createElement("h1", "Page title"),
        doc.createElement("p", { class: "lead" }, "Lead paragraph"),
        doc.createElement("p", "Second paragraph"),
        doc.createElement("button", { "data-toggle": "popover" }, "Read more"),
      )
    )
  )
);

const paragraphs = doc.body.getElementsByTagName("p");
// => [p, p]

const contentItems = doc.body.querySelectorAll("h1, p");
// => [h1, p, p]

const heading = doc.body.querySelector("h1");
// => h1

const main = heading.closest("main");
// => main

const allContents = main.getElementsByTagName("*");
// => [h1, p.lead, p, button[data-toggle]]

doc.head.contains(heading);
// => false

doc.contains(heading);
// => true

const lead = doc.documentElement.getElementsByClassName("lead");
// => [p.lead]

const button = main.children.find(child => child.matches("[data-toggle]"))
// => button[data-toggle="popover"]
```
**Note** - remember that the selector engine doesn't support CSS pseudo-selectors.
</details>


#### Node & Element - Content Exports

The API provides properties for accessing the content of elements:

* **`innerHTML`**
  * **Getter:** - returns the HTML markup contained *within* the element. This includes all child nodes (`Element` like nodes and text nodes), serialized to a formatted HTML string.
* **`outerHTML`**
  * **Getter:** returns the complete HTML markup of the element, including the element itself and its contents.
* **`textContent`**
  * **Getter:** returns the concatenated text content of the element and all its descendants. This is the text that would be visible if the HTML were rendered, with all tags stripped out.


Examples:
<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser/dom";

const doc = createDocument();
doc.append(doc.createElement("body"));

// Create some elements
const div = doc.createElement("div", { id: "myDiv" });
const p1 = doc.createElement("p", "Paragraph 1");
const p2 = doc.createElement("p", "Paragraph 2");
div.append(p1, p2);
doc.body.append(div);

// innerHTML
console.log(div.innerHTML);
// => 
`
<p>Paragraph 1</p>
<p>Paragraph 2</p>
`

// outerHTML
console.log(div.outerHTML);
// => 
`
<div id="myDiv">
  <<p>Paragraph 1</p>
  <p>Paragraph 2</p>
</div>
`

// textContent
console.log(div.textContent);
// => 
`
Paragraph 1
Paragraph 2
`
```
</details>


## Other tools
The library exports every of its tools you can use in your own library or app, attributes parser or tokenizer.

### createDocument
<details>
<summary>Click to expand</summary>

```ts
/**
 * Creates a new `Document` like root node.
 *
 * @returns a new root node
 */
const createDocument = () => RootNode;
```

Quick usage:
```ts
import { createDocument } from "@thednp/domparser/dom";

// create a root node
const doc = createDocument();

// use the available methods
const html = doc.createElement("html");
```
</details>

---

### tokenize
<details>
<summary>Click to expand</summary>

```ts
/**
 * Tokenizes an HTML string into an array of HTML tokens.
 * These tokens represent opening tags, closing tags, text contents, and comments.
 * 
 * ```ts
 * type HTMLToken {
 *   type: "tag" | "comment" | "text";
 *   value: string;
 *   isSC: boolean; // short for (tag) isSelfClosing
 * }
 * ```
 * @param html The HTML string to tokenize.
 * @returns An array of `HTMLToken` objects.
 */
const tokenize = (html: string) => HTMLToken[];
```

Quick usage:
```ts
import { tokenize } from "@thednp/domparser";

// use the tokenizer methods
const html = tokenize("<html></html>");
/*
[
  { type: "tag", isSC: false, value: "html"},
  { type: "tag", isSC: false, value: "/html"}
]
*/
// isSC is short for isSelfClosing, EG: <path />
```
</details>

---

### getBasicAttributes

<details>
<summary>Click to expand</summary>

```ts
/**
 * Parse a string token and return an object
 * where the keys are the names of the attributes and the values
 * are the values of the attributes.
 *
 * @param tagStr the tring token
 * @param config an optional set of options for unsafe attributes
 * @returns the attributes object
 */
const getBasicAttributes: (tagStr: string, options) => Record<string, string>;
```

Quick usage:
```ts
import { getBasicAttributes } from "@thednp/domparser";

// define options
const options = {
  unsafeAttrs: new Set(["data-url"]),
}

// use the tokenizer methods
const attributes = getBasicAttributes(
  // the target string
  `html id="html" class="html" data-url="https://example.com/api"`,
  // the options
  options,
);
/*
// the results
{
  id: "html",
  class: "html",
}
*/
```
</details>

**Other tools you might need to use**:
* `isRoot: (node: unknown) => boolean` - check if an object is a `RootLike` or `RootNode`;
* `isNode: (node: unknown) => boolean` - check if an object is any kind of node: root, element, text node, etc.
* `isTag: (node: unknown) => boolean` - check if an object is an `Element` like node;
* `isPrimitive: (node: unknown) => boolean` - check if value is either `string` or `number`.


## Tree-shaking
This library exports its components as separate modules so you can save even more space and allow for a more flexible sourcing of the code. This is to make sure that even if your setup isn't perfectly configured to handle tree-shaking, you are still bundling only what's actually used.
<details>
<summary>Click to expand</summary>

```ts
// import Parser only
import { Parser } from "@thednp/domparser/parser"

// import DomParser only
import { DomParser } from "@thednp/domparser/dom-parser"

// import createDocument only
import { createDocument } from "@thednp/domparser/dom"
```
</details>


## TypeScript Support

`@thednp/domparser` is fully typed with TypeScript and type definitions are included in the package for a smooth development experience.

To provide a lightweight and performant DOM representation, the **Parser** creates "Node" like objects only with essential properties: `nodeName`, `tagName`, [`attributes`, `children`, `childNodes`] for `Element` like nodes and `nodeValue` for basic nodes like `#text`.

This is why it's important to distinguish from native browser DOM API, the types have been simplified to set the right expectations and avoid accessing unsuported properties or methods. These are the main nodes in the results of the parser:
* `RootLike` - is for the `Document` node;
* `NodeLike` - is an `Element` like node;
* `CommentLike` - is a `#comment` node;
* `TextLike` - is a `#text` node;
* `ChildLike` - is either `NodeLike`, `TextLike` or `CommentLike`.

Then we have **DomParser** which overrides some properties and enhance the node prototype with ancestor accessors, selector engine and attributes API. Here are the types for the enhanced nodes:
* `RootNode` - extends `RootLike`;
* `DOMNode` extends `NodeLike`;
* `CommentNode` extends `CommentLike`;
* `TextNode` extends `TextLike`;
* `ChildNode` is either `TextNode`, `CommentNode` or `DOMNode`.


## Error Handling

Both the **Parser** and the **DomParser** will attempt to parse even malformed HTML, however invalid tags or attributes might be ignored or handled in a specific way (depending on the `filterTags` and `filterAttrs` options).

For critical errors (tag open/closing mismatch), **DomParser** throws a specific Error. It does *not* throw exceptions for typical parsing errors.

Example:
```ts
DomParser().parseFromString("<html><p><span></p></html>");
//=> "DomParserError: Mismatched closing tag: </p>. Expected closing tag for <span>."
```


## Technical Notes
* an audit of the parser reveals a number of _very strong advantages_: usage of character codes, minimal string operations, no nested loops or lookbacks and single pass processing;
* **DomParser** will throw a specific error when an unmatched open/closing tag is detected;
* both parser versions should be capable to handle HTML comments `<!-- comment -->` even if they have other valid tags inside, but considering that nested comments aren't supported in the current HTML5 draft; the comment's usual structure is `{ nodeName: "#comment", nodeValue: "<!-- comment -->" }`;
* also both parser versions will handle self-closing tags and some cases of incorrect markup such as `<path />` versus `<path></path>` (cases where both are valid) and `<meta name=".." />` vs `<meta name="..">` (only the second case is valid);
* another note is that `<!doctype>` tag is always stripped, but **DomParser** will add it to the root node in its `doctype` property, which is similar to the native browser API;
* if the current DOM tree contains a `<meta charset="utf-8">` **DomParser** will use the `charset` value for the root property `charset`;
* similar to the native browser DOMParser, this script returns a document like tree structure where the root element is a "root" property of the output; what's different is that our script will also export a list of tags and a list of components;
* the script properly handles `CustomElement`s, UI Library components, and even camelCase tags like `clipPath` or attributes like `preserveAspectRatio`;
* if you encounter any issue, please report it [here](https://github.com/thednp/domparser/issues), thanks!


## Backstory
I've created some tools to generate SVG components for [VanJS](https://github.com/thednp/vite-plugin-vanjs-svg) and other tools, and I noticed my "hello world" app bundle was 102Kb and looking into the dependencies, I found that an entire parser and tooling was all bundled in my app client side code and I thought: that's not good. Then I immediately started to work on this thing.

The result: bundle size 10Kb, render time significantly faster, basically microseconds.


## License
**DOMParser** is [MIT Licensed](https://github.com/thednp/domparser/blob/master/LICENSE).
