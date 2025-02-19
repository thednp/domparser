import {
  DOMNode,
  getAttributes,
  Parser,
  DomParser,
  TextNode,
  selectorCache,
  NodeLike,
} from "../src/index";
import { describe, expect, test } from "vitest";

describe(`Test DOMParser`, () => {
  test(`Test Dom parsing`, () => {
    const testSample = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Example</title>
    <style id="my-style">p {margin: 0}</style>
  </head>
  <body>
    <h1>Sample</h1>
    <!--
      this is a comment
      <span>this is a span inside comment</span>
    -->
    <path d='M0 0L5 5'></path>
    <path d='M0 0L10 5' />
    <icon id="fancy" class="no-display" />
    <button class="button" data-url="https://test.com">
      <icon id="icon" />
      Click me
    </button>
    <Command id="comment">
      <some-element>Text</some-element>
    </Command>
    <button data-click="yes" onclick="sayno;" disabled />
  </body>
</html>
`.trim();

    const { root: doc } = DomParser().parseFromString(testSample);
    // console.log(JSON.stringify(doc, null, 2));
    // return;
    // console.log(doc.parentNode);
    // console.log(doc.head?.ownerDocument?.nodeName);
    // console.log(doc.all.length);
    // console.log(doc.head?.ownerDocument === doc);
    // console.log(doc.documentElement?.outerHTML);
    // return;
    
    expect(doc.parentElement).toBeUndefined();
    expect(doc.documentElement?.outerHTML.length).toEqual(633);
    expect(doc.all.length).toEqual(15);
    expect(doc.head?.children[2].childNodes[0].ownerDocument).toEqual(doc);
    expect((doc.head?.parentNode as DOMNode).tagName).toEqual("html");
    expect((doc.head?.parentElement as DOMNode).tagName).toEqual("html");
    expect(doc.head?.innerHTML).toContain("meta");
    expect(doc.head?.innerHTML).toContain("title");
    expect(doc.head?.innerHTML).toContain("style");
    expect((doc.head?.children[2].childNodes[0] as TextNode).textContent)
      .toEqual("p {margin: 0}");
    expect((doc.head?.children[2].childNodes[0].parentNode as DOMNode).tagName)
      .toEqual("style");
    expect(doc.getElementById("my-style")?.attributes.get("id")).toEqual(
      "my-style",
    );
    expect(doc.getElementById("does-not-exist")).toEqual(null);
    expect(doc.querySelector("#does-not-exist")).toEqual(null);
    expect(doc.querySelector(".does-not-exist")).toEqual(null);
    expect(doc.querySelectorAll("#does-not-exist")).toEqual([]);
    expect(doc.querySelectorAll(".does-not-exist")).toEqual([]);
    expect(doc.querySelector('[data-url="https://test.com"]')?.tagName).toEqual(
      "button",
    );
    expect(doc.querySelector("[disabled]")?.tagName).toEqual("button");
    expect(doc.getElementsByTagName("*").length).toEqual(15);
  });

  test(`Test DOM methods`, () => {
    const {root: doc} = DomParser().parseFromString();

    doc.append(
      doc.createElement(
        "html",
        { class: "html-class" },
        doc.createElement(
          "head",
          doc.createElement("meta", {
            charset: "utf-8",
          }),
          doc.createElement("title", "This is a title"),
          doc.createElement("meta", {
            name: "description",
            content: "Some description",
          }),
        ),
        doc.createElement(
          "body",
          { id: "my-body", "data-url": "https://nice.com" },
          doc.createElement("h1", "This is a heading"),
          doc.createElement("p",
            "This is a paragraph ",
            doc.createElement("a", { href: "#" }, "with a link"),
            "and some more text"
          ),
          doc.createComment("This is a comment"),
          "This is a text",
          "<!-- This is a comment again -->",
          doc.createTextNode("This is a text node via doc.createTextNode"),
          doc.createElementNS("http://www.w3.org/2000/svg", "svg",
            {
              xmlns: "http://www.w3.org/2000/svg"
            },
            doc.createElementNS("http://www.w3.org/2000/svg", 'path', {
              d: "M0 0L10 10"
            }),
            doc.createElementNS("http://www.w3.org/2000/svg", 'path', {
              d: "M0 0L10 10"
            })
          ),
        ),
      ),
    );

    expect(doc.charset).toEqual('UTF-8');
    expect(doc.all.length).toEqual(12);
    expect(doc.contains(doc.body as DOMNode)).toBeTruthy();
    expect(doc.body?.getAttribute("id")).toEqual("my-body");
    expect(doc.documentElement).toBeDefined();
    expect(doc.documentElement?.outerHTML).toBeDefined();
    expect(doc.documentElement?.outerHTML).not.contain("<!doctype html>");
    expect(doc.documentElement?.outerHTML).toContain(
      'data-url="https://nice.com"',
    );
    expect(doc.head).toBeDefined();
    expect(doc.body).toBeDefined();
    expect(doc.body?.childNodes[2]).toBeDefined();
    expect(doc.body?.childNodes[2].nodeName).toEqual("#comment");
    expect(doc.body?.childNodes[3].nodeName).toEqual("#text");
    expect(doc.body?.childNodes[4].nodeName).toEqual("#comment");
    expect(doc.querySelector("head")?.tagName).toEqual("head");
    expect(
      doc.querySelectorAll("p, h1").length,
      "selector can handle multiple selectors",
    ).toEqual(2);
    expect(doc.getElementById("my-body")?.tagName).toEqual("body");
    expect(doc.getElementsByTagName("body")[0]?.tagName).toEqual("body");
    expect(doc.getElementsByClassName("html-class")[0]?.tagName).toEqual(
      "html",
    );
    expect(doc.querySelector(".html-class")?.tagName).toEqual("html");
    expect(doc.querySelectorAll(".html-class")[0]?.tagName).toEqual("html");
    // console.log(doc.querySelector("head")?.textContent);
    expect(doc.querySelector("head")?.textContent).toContain("This is a title");
    expect(doc.querySelector("svg")?.textContent).toContain("");
    doc.querySelector("svg")?.setAttributeNS("http://www.w3.org/2000/svg", "viewBox", "0 0 25 25")
    doc.querySelector("svg")?.setAttribute("class", "svg-icon")
    expect(doc.querySelector("svg")?.hasAttribute("class")).toBeTruthy();
    expect(doc.querySelector("svg")?.getAttribute("class")).toEqual("svg-icon");
    expect(doc.querySelector("svg")?.getAttribute("id")).toBeNull();
    expect(doc.querySelector("svg")?.hasAttributeNS("http://www.w3.org/2000/svg", "viewBox")).toBeTruthy();
    expect(doc.querySelector("svg")?.getAttributeNS("http://www.w3.org/2000/svg", "viewBox")).toEqual("0 0 25 25");
    expect(doc.querySelector("svg")?.getAttributeNS("http://www.w3.org/2000/svg", "preserveAspectRatio")).toBeNull();
    expect(doc.querySelector("svg")?.hasAttributeNS("http://www.w3.org/2000/svg", "xmlns")).toBeTruthy();

    // console.log('before delete \n', doc.documentElement?.outerHTML);
    doc.querySelector("svg")?.remove();
    // console.log('after delete \n', doc.documentElement?.outerHTML);
    expect(doc.querySelector("svg")).toBeNull();

    expect(doc.body?.closest("body")?.tagName).toEqual('body');
    expect(doc.body?.closest("html")?.tagName).toEqual('html');
    expect(doc.body?.closest(".does-not-exist")).toBeNull();
    try {
      // @ts-expect-error
      doc.body?.closest();
    } catch(er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomError: selector must be a string")
    }

    expect(doc.body?.contains(doc.querySelector("h1") as DOMNode)).toBeTruthy();
    expect(doc.body?.contains(doc.querySelector("meta") as DOMNode)).toBeFalsy();
    expect(doc.documentElement?.contains(doc.querySelector("h1") as DOMNode)).toBeTruthy();
    try {
      // @ts-expect-error
      doc.body?.contains();
    } catch(er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomError: the childNode parameter must be a valid DOMNode")
    }

    doc.body?.replaceChildren(
      doc.createElement('h1', 'This is a new heading'),
      doc.createElement('p', 'This is a new paragraph'),
    );
    try {
      // @ts-expect-error
      doc.body?.removeChild({})
    } catch (er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomError: the childNode parameter must be a valid ChildNode")
    }

    // edge case, test cache
    const tagNames = ['html', 'body', 'button', 'p', 'div', 'a', 'svg', 'path', "h1", "h2", 'ul', 'li']
    const classes = ["my-body", 'btn', 'container', "link", "flex", "hidden", "active"]
    const selectors = new Set<string>();
    const attributes = [{ "aria-hidden": "false" }, { disabled: "false" }, { tabindex: "1" }]
    let idx = 0;
    for (const tag of tagNames) {
      for (const cls of classes) {
        for (const att of attributes) {
          const sel = idx % 2 ? (tag+"."+cls)
            : idx % 3 ? ('.'+cls)
            : idx % 4 ? (tag+'['+Object.keys(att)[0]+']')
            : tag;
          selectors.add(sel);
          // console.log(idx, sel)
          idx += 1;
          if (selectors.size === 100) break;
        }
        if (selectors.size === 100) break;
      }
      if (selectors.size === 100) break;
    }
    selectors.forEach(sel => doc.querySelector(sel));

    expect(selectors.size, 'exceed cache limit of 100').toEqual(100);
    expect(selectorCache.getStats()).toEqual({
      hitRate: 1,
      hits: 1353,
      misses: 0,
      size: 100,
    })
    selectorCache.clear();
    expect(selectorCache.getStats()).toEqual({
      hitRate: 0,
      hits: 0,
      misses: 0,
      size: 0,
    })

  });

  test(`Test Parser with HTML Markup`, () => {
    const html = `
<html>
  <head>
    <meta charset="UTF-8">
    <title>Example</title>
    <style id="my-style">p {margin: 0}</style>
  </head>
  <body>
    <h1>Hello World!</h1>
    <p class="example" aria-hidden="true">This is an example.</p>
    <text-element />
    Some text node.
    <Counter count="0" />
  </body>
</html>`.trim();
    const parser = Parser();

    const { root, components, tags } = parser.parseFromString(html);

    expect(components).toEqual(["text-element", "Counter"]);
    expect(tags).toEqual([
      "html",
      "head",
      "meta",
      "title",
      "style",
      "body",
      "h1",
      "p",
    ]);
    expect(root.nodeName).toEqual("#document");
    expect(root.children.length).toEqual(1);
    expect(root.children.length).toBeGreaterThan(0);
    if (root.children.length > 0) {
      expect((root.children[0] as NodeLike).tagName).toEqual("html");
    }
  });

  test(`Test Parser with SVG Markup`, () => {
    const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 768 767.999994" preserveAspectRatio="xMidYMid meet" width="2rem" height="2rem" class="w-8 h-8">
        <defs>
            <clipPath id="5499afe1a4">
                <path d="M 215.664062 352.992188 L 398 352.992188 L 398 586 L 215.664062 586 Z M 215.664062 352.992188" clip-rule="nonzero"></path>
            </clipPath>
        </defs>
        <path fill="#f44336" d="M 192.09375 -0.09375 C 86.0625 -0.09375 0.09375 85.875 0.09375 191.90625 L 0.09375 575.90625 C 0.09375 681.9375 86.0625 767.90625 192.09375 767.90625 L 576.09375 767.90625 C 682.125 767.90625 768.09375 681.9375 768.09375 575.90625 L 768.09375 191.90625 C 768.09375 85.875 682.125 -0.09375 576.09375 -0.09375 Z M 192.09375 -0.09375 " fill-opacity="1" fill-rule="nonzero"></path>
    </svg>`.trim();

    const parser = Parser();

    const { root, components, tags } = parser.parseFromString(svgMarkup);
    // const svg = root.children[0] as NodeLike & { children: (NodeLike & { children: (NodeLike & { children: NodeLike[] })[] })[] };
    const svg = root.children[0] as NodeLike;

    expect(components).toEqual([]);
    expect(tags).toEqual(["svg", "defs", "clipPath", "path"]);
    // @ts-expect-error - expecting tagName to be undefined
    expect(root.tagName).toBeUndefined();
    expect(root.nodeName).toEqual("#document");
    expect(svg.nodeName).toEqual("SVG");
    expect(svg.tagName).toEqual("svg");
    expect(svg.children?.length).toEqual(2);
    expect(svg.children?.[0].tagName).toEqual("defs");
    expect(svg.children?.[0].nodeName).toEqual("DEFS");
    expect(svg.children?.[0].children?.length).toEqual(1);
    expect(svg.children?.[0].children?.[0].tagName).toEqual("clipPath");
    expect(svg.children?.[0].children?.[0]?.attributes?.["id"]).toEqual("5499afe1a4");
    expect(svg.children?.[0].children?.[0]?.children?.length).toEqual(1);
    expect(svg.children?.[0].children?.[0].children?.[0].tagName).toEqual("path");
    expect(svg.children?.[0].children?.[0].children?.[0].attributes?.["clip-rule"])
      .toEqual("nonzero");
    expect(svg.children?.[0].children?.[0].children?.[0].attributes?.["d"]).toEqual(
      "M 215.664062 352.992188 L 398 352.992188 L 398 586 L 215.664062 586 Z M 215.664062 352.992188",
    );
  });

  test(`Test Sanitization`, () => {
    const svgMarkup = `
<svg xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  href="https://a.com/some-url"
  src="https://a.com/some-url?foo=bar&baz=yes"
  data-url="data:/path/to/some-url.svg"
  data-template="<span data-uri='some-value'></span>"
  data-other-url="javascript:/path/to/some-url.js"
  data-other-url="vbscript:/path/to/some-url.script"
  disabled
  action="https://a.com/some-url"
  formaction="https://a.com/some-url"
>
  <defs><clipPath></clipPath></defs>
  <path d="M 215.664062 352.992188 L 398 352.992188 L 398 586 L 215.664062 586 Z M 215.664062 352.992188" clip-rule="nonzero"></path>
</svg>`.trim();

    const parser = DomParser({
      filterTags: ["defs"],
      filterAttrs: ["clip-rule", "formaction"],
    });

    const { root, components, tags } = parser.parseFromString(svgMarkup);
    const svg = root.children[0];

    expect(components).toEqual([]);
    expect(tags).toEqual(["svg", "path"]);
    expect(svg.nodeName).toEqual("SVG");
    expect(svg.tagName).toEqual("svg");
    expect(svg.attributes.get("disabled")).toBeDefined();
    expect(svg.attributes.get("formaction")).toBeUndefined();
    expect(svg.attributes.get("data-template")).toEqual(
      "<span data-uri='some-value'></span>",
    );
    expect(svg.children.length).toEqual(1);
    expect(svg.children[0].tagName).toEqual("path");
    expect(svg.children[0].attributes.get("clip-rule")).toBeUndefined();
    expect(svg.children[0].attributes.get("d")).toBeDefined();
  });

  test(`Test #text node`, () => {
    expect(getAttributes("")).toEqual({});
    expect(Parser().parseFromString("Some text node").root.children[0]).toEqual({
      nodeName: "#text",
      nodeValue: "Some text node",
    });
  });

  test(`Test #comment node`, () => {
    expect(
      Parser().parseFromString("<!-- this is a comment <span>with a span</span> -->")
        .root.children[0],
    ).toEqual({
      nodeName: "#comment",
      nodeValue: "<!-- this is a comment <span>with a span</span> -->",
    });
    expect(Parser().parseFromString("<!-- this is a comment <span>with a span</span> -->").root.children.length).toEqual(1)
  });

  test(`Test edge cases`, () => {
    expect(getAttributes("")).toEqual({});
    expect(Parser().parseFromString(), "parse an empty string").toEqual({
      root: { nodeName: "#document", children: [] },
      components: [],
      tags: [],
    });
    expect(
      Parser().parseFromString("<!doctype html><span />").root.children[0],
      "doctype tags must be stripped",
    ).toEqual({
      tagName: "span",
      nodeName: "SPAN",
      children: [],
      attributes: {},
    });
    expect(DomParser().parseFromString("<html></html>").root.documentElement?.innerHTML).toEqual("");
    expect(DomParser().parseFromString("<html></html>").root.documentElement?.outerHTML).toContain(
      "<html></html>",
    );
    expect(DomParser().parseFromString("<html></html>").root.documentElement?.outerHTML).toContain(
      "<html></html>",
    );

    type AdvancedNode = DOMNode & { className?: "string" };
    const myNodes: AdvancedNode[] = [];
    DomParser({
      onNodeCallback: (n) => {
        Object.assign(n, { className: "nice" });
        myNodes.push(n as AdvancedNode);
        // console.log(n);
        return n;
      }
    }).parseFromString("<html></html>", )
    expect(myNodes.length).toEqual(1);
    expect(myNodes[0].className).toEqual('nice');
    try {
      DomParser().parseFromString("<html></span>")
    } catch (er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomParserError: Mismatched closing tag: </span>. Expected closing tag for <html>.")
    }
    try {
      DomParser().parseFromString("</html>")
    } catch (er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomParserError: Mismatched closing tag: </html>. No open tag found.")
    }
    try {
      DomParser().parseFromString("<html><p><span><clipPath></p></html>")
    } catch (er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomParserError: Mismatched closing tag: </p>. Expected closing tag for <clipPath>.")
    }
    try {
      // @ts-expect-error
      DomParser().parseFromString({});
    } catch (er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomParserError: 1st parameter is not a string.")
    }
    try {
      // @ts-expect-error
      DomParser("test").parseFromString("<html>Test</html");
    } catch (er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomParserError: 1st parameter is not an object.")
    }
    try {
      // @ts-expect-error
      DomParser().parseFromString("<html>Test</html>").root.append("Some text node");
    } catch (er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomParserError: Invalid node.")
    }
    try {
      DomParser().parseFromString("<html>Test</html");
    } catch (er) {
      expect(er).toBeDefined();
      expect(er.message).toEqual("DomParserError: Unclosed tag: <html>.")
    }
    // expect(DomParser().parseFromString("<pre><script>let a = 0;<\/script></pre>").root.all).toHaveLength(1);
    expect(DomParser().parseFromString("<pre>&lt;script type\"js\"&gt;let a = 0;&lt;/script&gt;</pre>").root.all).toHaveLength(1);
    expect(
      DomParser().parseFromString(`
        <script>
          var test = "<script>let a = 0;</script>";
        </script>
      `).root.all
    ).toHaveLength(1);
    expect(DomParser().parseFromString("<script>var test = `<script>let a = 0;</script>`;</script>").root.all).toHaveLength(1);
    expect(
      DomParser().parseFromString(
        '<style> head { display: none } body { margin: 0 } header { content: "</style>" }</style>'
      ).root.all
    ).toHaveLength(1);
    expect(DomParser({ sanitizeFn: undefined }).parseFromString(`
      <style>
        head { display: none }
        body { margin: 0 }
        header { content: '</style>' }
      </style>`
    ).root.all).toHaveLength(1);
  });
});
