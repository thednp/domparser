## DOMParser
[![Coverage Status](https://coveralls.io/repos/github/thednp/domparser/badge.svg)](https://coveralls.io/github/thednp/domparser) 
[![NPM Version](https://img.shields.io/npm/v/@thednp/domparser.svg)](https://www.npmjs.com/package/@thednp/domparser)
[![ci](https://github.com/thednp/domparser/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/domparser/actions/workflows/ci.yml)
[![typescript version](https://img.shields.io/badge/typescript-5.7.3-brightgreen)](https://www.typescriptlang.org/)
[![vitest version](https://img.shields.io/badge/vitest-3.0.5-brightgreen)](https://vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-6.1.0-brightgreen)](https://vitejs.dev/)

A very light and TypeScript sourced [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) but only for HTML markup and featuring basic sanitization features, open/closing tag check and other tools. Because of its size (around 1.4Kb gzipped for the parser alone), you can include it in both your server and especially your client to greatly reduce your application bundle size.

The purpose of this library is to provide a lightweight yet reliable HTML parser without having to depend on [jsdom](https://github.com/jsdom/jsdom), [json5](https://json5.org) and even newer tools like [cheerio](https://cheerio.js.org). Where these tools will try and reproduce a complete DOM tree with all properties and methods specific to each node type, this little thing here only focuses on the essential DOM API making it several times faster and more memory efficient.

On that note, it doesn't come as a drop-in replacement/shim for the native browser DOMParser, but thanks to its components being packaged in separate bundles it suddenly becomes an extremely useful tool for many more scenarios.

Along with the **Parser**, you also have a powerful tool to create a DOM tree from scratch, but unlike the native `Document` API, this one has been reimagined to improve your workflow and allow you to create a DOM tree faster and much easier.


### Main Components
* **Parser** - the core parser with sanitization options and essential tag verification; the sanitization is opt-in which means it's not applied and no tags or attributes are filtered; the **Parser** provides basic open/closing tag verification with proper error reporting;
* **Dom** - uses the **Parser** to generate a DOM tree that can be manipulated and queried; it overrides the **Parser** to use basic sanitization and to store the DOM tree within its instance instead of both, which is very important for memory efficiency; it can also be used to create a DOM tree with `Document` API like methods;
* **sanitize** - a set of tools to help you sanitize the attributes of your nodes in the DOM tree.


## Which apps can use it
* plugins that transform SVG files/markup to components for UI frameworks like React/Solid, [a basic example](https://github.com/thednp/vite-plugin-vanjs-svg);
* plugins that manage a website's metadata;
* plugins that implement unit testing in a virtual/isolated environment;
* apps that perform web research and/or web-scrapping;
* apps that require basic sanitization;
* apps that support server side rendering (SSR);
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
* the `<!doctype html>` tag will not be included in the resulted DOM tree, but will be added to the `root.doctype` property;
* the `charset` value of the `<meta>` tag will be added to the `root.charset` property. 
</details>


### Initialize

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
  "charset": "UTF-8",
  "doctype": "<!doctype html>",
  "children": []
  "childNodes": []
}
*/
```

Below we have a near complete representation of the given HTML markup, keep in mind that the contents of the `children` property is not included to shorten the DOM tree.
<details>
<summary>Click to expand</summary>

```ts
// the DOM tree output
/*
{
  "nodeName": "#document",
  "charset": "UTF-8",
  "doctype": "<!doctype html>",
  "children": [
    // all Element like nodes
  ],
  "childNodes": [
    {
      "tagName": "html",
      "nodeName": "HTML",
      "attributes": {},
      "children": [
        // all Element like nodes
      ],
      "childNodes": [
        {
          "tagName": "head",
          "nodeName": "HEAD",
          "attributes": {},
          "children": [
            // all Element like nodes
          ],
          "childNodes": [
            {
              "tagName": "meta",
              "nodeName": "META",
              "attributes": {
                "charset": "UTF-8"
              },
              "children": [],
              "childNodes": [],
            },
            {
              "tagName": "title",
              "nodeName": "TITLE",
              "attributes": {},
              "children": [],
              "childNodes": [
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
            // all Element like nodes
          ],
          "childNodes": [
            {
              "tagName": "h1",
              "nodeName": "H1",
              "attributes": {},
              "children": [],
              "childNodes": [
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
              "children": [],
              "childNodes": [
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
              "childNodes": []
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
              "childNodes": []
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


## Parser Options

**Parser** doesn't sanitize attribute values by default, but it can be configured to do so and even remove potentially harmful tags and/or attributes.

Here is a quick example:

```ts
import { Parser } from "@thednp/domparser"

const config = {
  filterTags: ["script"],
  filterAttrs: ["data-url"],
  // ...other options
}

const parsedHTML = Parser(config).parseFromString("<html>Some long HTML</html>")
```
**Reference**:
* `onNodeCallback` - can be used to extend the node prototype, apply additional validation or special sanitization;
  * it comes with [`node`, `parent`, `root`] as arguments so you have the full context of that node;
  * this option will override the default behavior of storing the nodes within the Parser instance and is used by `Dom` to also extend the prototype by adding `Node` and `Element` methods and properties;
  * remember that you need to use `Object.assign(node, yourNodeModification)` and return that SAME node;
  * in the example below we've added a `classList` like method;
* `sanitizeFn` - is useful to set a special sanitization function suitable to your need;
  * it takes [`lowerCaseattributeName`, `attributeValue`] as arguments;
  * can make use of the included sanitization tools (`encodeEntities`, `sanitizeUrl` for value sanitization), (`sanitizeAttrValue` for value sanitization and check against a given set of attribute names) as a starting point;
* `filterTags` - tells the Parser to treat these tag names as potentially dangerous;
  * the Parser will pass them to the `sanitizeFn` function to check them and remove them;
  * in the example below you have a full list of potentially unsafe tags;
* `filterAttrs` - similar to the above, it tells the Parser to treat these attributes as potentially dangerous and skip adding them to the nodes.

Below we have a detailed example using all the options:
<details>
<summary>Click to expand</summary>



```ts
import { addClassListProto } from "./your/src";
import { Parser } from "@thednp/domparser";

const config = {
  // A callback to apply various validation/sanitization
  // will cancel the DOM tree generation so you can store
  onNodeCallback: (node, parent, root) => {
    const modifiedNode = addClassListProto(node, parent, root);
    // if your addClassListProto function already does it
    // you can ignore the assignment below
    Object.assign(node, modifiedNode);
    return node;
  },

  // Use a custom sanitizer
  sanitizeFn: (attrName, attrValue) => {
    let value = attrValue;
    if (attrName.toLowerCase() === 'some-name') {
      // do something specific to this attribute
    }
    return value;
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

const parser = Parser(config)
const parsedHTML = parser.parseFromString("<html>Some long HTML</html>")
// all configured tags and attributes will be removed
// from the resulted parsedHTML.root object tree
```
</details>


## Dom Usage
The **Dom** allows you to create a DOM tree similar to how `Document` API works, it can use the **Parser** to create a DOM tree from a starting HTML markup, but overrides how new nodes are stored in a way that they don't exist in both the **Parser** and **Dom** instances.

### Initialize Dom
First let's import and initialize **Dom** and get to build a DOM tree from scratch:
```ts
import { Dom } from '@thednp/domparser';

// initialize
const doc = Dom();
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


### Dom - Main Elements
The `document` like instance provides easy access to main `Element` like nodes: 

```ts
// work with the main elements
console.log(doc.documentElement); // <html>
console.log(doc.head);            // <head>
console.log(doc.body);            // <body>
console.log(doc.all);             // An array with all `Element` like nodes in the tree
```

### Dom - Selector Engine

The API allows you to perform various queries: `getElementById` (exclusive to the root node), `getElementsByClassName` or `querySelector`.

```ts
// exclusive to the root node
console.log(doc.getElementById('my-id'));
```
Check below for more examples.

<details>
<summary>Click to expand</summary>

```ts
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


### Dom - Create DOM from HTML

**Dom** uses the **Parser** and configures it to sanitize attribute values by default, but it can also be configured to remove potentially harmful tags and/or attributes. Here's a quick example:

```ts
import { Dom } from "@thednp/domparser";

const doc = Dom("<html</html>", { filterTags: ["script"] });
```

Check below a more detailed example:

<details>
<summary>Click to expand</summary>

```ts
import { Dom, sanitizeAttrValue } from "@thednp/domparser";

const parserOptions = {
  // sets a callback to call on every new node
  onNodeCallback: (node, parent, root) => {
    // unlike the callback applied to `Parser`,
    // the root here is the result of the `Dom` call,
    // apply any validation, sanitization to your node
    // and return the SAME node reference
    doSomeFunctionWith(node, parent, root);
    return node;
  },

  // set the included sanitizer as sanitizeFn parameter
  sanitizeFn: sanitizeAttrValue,

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

const doc = Dom(
  "<!doctype html><html><body>This is a basic body</body></html>",
  parserOptions,
);
// the doctype will be added to `doc` as a property
// all configured tags and attributes will be removed
// from the resulted parsedHTML.root object tree
```
**Notes**:
* if you use `onNodeCallback` in the initialization of `Dom`, the effect of your callback will be applied BEFORE the `Dom`'s internal callback without overriding it;
* if you call `Dom` with an invalid HTML parameter or invalid parser options, (EG: `Dom({}, "invalid")`) it will throw a specific error. If you call `Dom(undefined, {...options })` would make no sense because no markup string was provided.

</details>


### Some caveats
* methods like `createElement`, `querySelector`, etc., are designed to be called on the root node instance (`doc.createElement(...)`) and rely on `this` being bound to the root node object. Destructuring (EG, `const { createElement } = Dom()`) will detach these methods from their intended `this` context and cause errors; a workaround would be `createElement.call(yourRootNode, ...arguments)` but that would be detrimental to the readability of the code;
* nodes added into the DOM tree resulted from parsing a given markup will have their properties sanitized with the default sanitizer, you may want to use the `onNodeCallback` to override the sanitization or validation the way you want.


## API Reference 

### Document API
When you create a new **Dom** instance, you immediately get access to a [Document-like API](https://developer.mozilla.org/en-US/docs/Web/API/Document), but only the essentials. On that note, you are provided with methods to create and remove nodes, check if nodes are added to the DOM tree, or apply queries.

#### Document Create Root Node
Currently there are 2 methods to create a `Document` like root node:
* by invoking `Dom("with starting html markup", options)` or with no arguments at all;
* by invoking `createDocument()`.

Example with first method:
```ts
import { Dom } from "@thednp/domparser";

// create a root node
const doc = Dom();
```

Example with second method:
```ts
import { createDocument } from "@thednp/domparser";

// create a root node
const doc = createDocument();
```

#### Document Create Element / Node

The root node exposes all known `Document` like methods for creating new nodes, specifically `createElement`, `createElementNS`, `createComment` and `createTextNode` however the `<!doctype html>` node is not supported.

In most cases you'll be using something like this:
```ts
import { Dom } from "@thednp/domparser";

// create a root node
const doc = Dom();

// create an Element like node
const html = doc.createElement("html");
```
Check the example below for a more detailed workflow.

<details>
<summary>Click to expand</summary>

```ts
import { Dom } from "@thednp/domparser";

// create a root document
const doc = Dom();

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

#### Document Create Text and Comment Nodes

The API provides methods for creating text nodes and comment nodes, similar to the standard DOM:

*   `createTextNode(text: string)` - creates a new text node with the given text content.
*   `createComment(text: string)` - creates a new comment node with the given text content.

Examples:

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser";

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
import { createDocument } from "@thednp/domparser";

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

Also you might not need to use `Dom` in this case because we don't need a starting HTML markup, you can just import and use `createDocument` and get to create the DOM tree:

<details>
<summary>Click to expand</summary>

```ts
// alternatively you can only import createDocument
// if you only need to manually build a DOM tree
import { createDocument } from "@thednp/domparser";

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


#### Document Ancestor Relationship

The API allows you to `append` nodes to the root node and later you can check if your nodes are present within the DOM tree via the `contains` method.

The `append` method is important for some reasons:
* we shouldn't be able to just splice or push into the stored objects, it needs to be consistent in keeping track of which node contains which;
* it's the only method available to add nodes to the DOM tree, which is a recommended practice to make sure selectors and other methods or properties work properly.

<details>
<summary>Click to expand</summary>

```ts
const doc = Dom();

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

#### Document Children Relationship
The API exposes `Node` like `readonly` properties to access child nodes:
* `children` - all `Element` like nodes;
* `childNodes` - all nodes including `#text` and `#comment` nodes.

Along with these properties, the root node also provides accessors for `documentElement`, `head` and `body`, however the root node comes with an exclusive accessor for `all` which lists all existing `Element` like nodes in the DOM tree.

<details>
<summary>Click to expand</summary>

```ts
const doc = Dom();

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

#### Document Remove / Replace Child Nodes
The Node like API also allows you to remove or replace one or more child nodes via `removeChild` and `replaceChildren` methods. Check examples below for more details.

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser";

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

#### Document Selector Engine

The Document API exposes all known methods to query the DOM tree, namely `getElementById`, `querySelector`, `querySelectorAll` ,`getElementsByClassName` and `getElementsByTagName`. Unlike the real DOM, instead of `NodeList` or live collections `HTMLCollection`, the results here are `Array` where applicable.

It should support multiple selectors comma separated and attribute selectors, however direct selectors and pseudo-selectors are not implemented.
<details>
<summary>Click to expand</summary>

```ts
const doc = Dom();

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

#### Node Ancestor Relationship

The `Node` API exposes `parentNode`, `ownerDocument` (getters) and `contains` (method):
<details>
<summary>Click to expand</summary>

```ts
const doc = Dom();

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

#### Node Children Relationship

The `Node` prototype will only expose `readonly` properties (getters) to access `children` and `childNodes` for any node instance present in the DOM tree. The rule of thumbs is that if a node isn't appended to a parent, it should be present in the output of these accessors.

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser";

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

#### Element Remove / Replace Child Nodes

For consistency the `Element` prototype doesn't have a way to directly add or remove child nodes into the DOM tree, you need to use the provided API.
<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser";

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

#### Element Attributes

Nodes enhanced with DOM methods and properties don't allow direct access to manipulate the attributes of an `Element` like node, you must use the following API:

##### Non-namespace Attributes
<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser";

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
import { createDocument } from "@thednp/domparser";

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

#### Element Selector Engine
The Element API exposes all known methods to query the DOM tree except `getElementById` which is exclusive to the root node. Same caveats apply as for the Document API.

<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser";

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


#### Node & Element Text Exports

The API provides properties for accessing the content of elements:

* **`innerHTML`**
  * **Getter:** - returns the HTML markup contained *within* the element. This includes all child nodes (elements, text nodes, and comment nodes), serialized to a formatted HTML string.
* **`outerHTML`**
  * **Getter:** returns the complete HTML markup of the element, including the element itself and its contents.
* **`textContent`**
  * **Getter:** returns the concatenated text content of the element and all its descendants. This is the text that would be visible if the HTML were rendered, with all tags stripped out.


Examples:
<details>
<summary>Click to expand</summary>

```ts
import { createDocument } from "@thednp/domparser";

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
The library exports every of its tools you can use in your own library or app, basically sanitization tools, attributes parser or tokenizer.

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
import { createDocument } from "@thednp/domparser";

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
```
</details>

---

### getAttributes

<details>
<summary>Click to expand</summary>

```ts
/**
 * Get attributes from a string token and return an object
 * where the keys are the names of the attributes and the values
 * are the sanitized values of the attributes.
 *
 * @param tagStr the tring token
 * @param config an optional set of options for unsafe attributes and sanitization function
 * @returns the attributes object
 */
const getAttributes: (tagStr: string, options) => Record<string, string>;
```

Quick usage:
```ts
import { getAttributes } from "@thednp/domparser";

// define custom sanitization function
const mySanitizationFn = (attrName: string, attrValue: string) => {
  // process the value in any way you want and return it
};

// define options
const options = {
  sanitizeFn: mySanitizationFn,
  unsafeAttrs: new Set(["data-url"]),
}

// use the tokenizer methods
const attributes = getAttributes(
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

---

### encodeEntities

<details>
<summary>Click to expand</summary>

```ts
/**
 * A basic tool for HTML entities encoding
 * @param str the source string
 * @returns encoded string
 */
const encodeEntities: (str: string) => string;
```
</details>

---

### sanitizeAttrValue

<details>
<summary>Click to expand</summary>

```ts
/**
 * Sanitizes attribute values
 * @param attrName the attribute name
 * @param initialValue the attribute value
 * @returns the sanitized value
 */
const sanitizeAttrValue: (attrName: string, initialValue: string) => string;
```
</details>

---

### sanitizeUrl

<details>
<summary>Click to expand</summary>

```ts
/**
 * Sanitizes URLs in attribute values
 * @param url the URL
 * @returns the sanitized URL
 */
const sanitizeUrl: (url: string) => string;
```

--- 

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
</details>


## Tree-shaking
This library exports its components as separate modules so you can save even more space and allow for a more flexible sourcing of the code.
<details>
<summary>Click to expand</summary>

```ts
// import Parser or getAttributes only
import { Parser, getAttributes, tokenize } from "@thednp/domparser/parser"

// import Dom only
import { Dom } from "@thednp/domparser/dom"

// import sanitization only
import { encodeEntities, sanitizeUrl, sanitizeAttrValue  } from "@thednp/domparser/sanitize"
```
</details>


## TypeScript Support

`@thednp/domparser` is fully typed with TypeScript. Type definitions are included in the package. You can use the library with full type safety in your TypeScript projects.


* **Error Handling:** The README doesn't mention how the library handles parsing errors (e.g., malformed HTML). Does it throw errors? Does it silently ignore invalid parts?  Adding a brief note on error handling would be helpful.  For instance:


## Error Handling

The **Parser** will attempt to parse even malformed HTML. Invalid tags or attributes might be ignored or handled in a specific way (depending on the `filterTags` and `filterAttrs` options). It does *not* throw exceptions for typical parsing errors. For critical errors [describe what constitutes a "critical error," if any], an exception might be thrown.


## Technical Notes
* this parser will throw a specific error when an unmatched open/closing tag is detected;
* this parser should be capable to handle HTML comments `<!-- comment -->` even if they have other valid tags inside, but considering that nested comments aren't supported in the current HTML5 draft; the comment's usual structure is `{ nodeName: "#comment", nodeValue: "<!-- comment -->" }`;
* also the parser will handle self-closing tags and some cases of incorrect markup such as `<path />` versus `<path></path>` (cases where both are valid) and `<meta name=".." />` vs `<meta name="..">` (only the second case is valid);
* another note is that `<!doctype>` tag is always stripped, but will be added to the root node in the `doctype` property;
* if the current DOM tree contains a `<meta charset="utf-8">` the `charset` value will be added to the root property `charset`;
* similar to the native DOMParser, this script returns a document like tree structure where the root element is a "root" property of the output; what's different is that our script will also export a list of tags and a list of components;
* the script properly handles `CustomElement`s, UI Library components, and even camelCase tags like `clipPath` or attributes like `preserveAspectRatio`;
* the current implementation does provide basic sanitization options, however by default all values are not sanitized by the **Parser** and all tags and attributes are allowed, but **Dom** does use the default sanitizer, in the end it all comes to you to implement the best and most secure application you are required to develop;
* if you encounter any issue, please report it [here](https://github.com/thednp/domparser/issues), thanks!


## Backstory
I've created some tools to generate SVG components for [VanJS](https://github.com/thednp/vite-plugin-vanjs-svg) and other tools, and I noticed my "hello world" app bundle was 102Kb and looking into the dependencies, I found that an entire parser and tooling was all bundled in my app client side code and I thought: that's not good. Then I immediately started to work on this thing.

The result: bundle size 10Kb, render time significantly faster, basically microseconds.


## License
**DOMParser** is [MIT Licensed](https://github.com/thednp/domparser/blob/master/LICENSE).
