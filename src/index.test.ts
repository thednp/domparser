import DOMParser from "./index";

import { describe, expect, test } from "vitest";

describe(`Test DOMParser`, () => {
  test(`Test HTML Markup`, () => {
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
    const parser = new DOMParser();

    const { root, components, tags } = parser.parseFromString(html);
    console.log(root, components, tags);

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
    expect(root.children[0].tagName).toEqual("html");
  });

  test(`Test SVG Markup`, () => {
    const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 768 767.999994" preserveAspectRatio="xMidYMid meet" width="2rem" height="2rem" class="w-8 h-8">
        <defs>
            <clipPath id="5499afe1a4">
                <path d="M 215.664062 352.992188 L 398 352.992188 L 398 586 L 215.664062 586 Z M 215.664062 352.992188" clip-rule="nonzero"></path>
            </clipPath>
        </defs>
        <path fill="#f44336" d="M 192.09375 -0.09375 C 86.0625 -0.09375 0.09375 85.875 0.09375 191.90625 L 0.09375 575.90625 C 0.09375 681.9375 86.0625 767.90625 192.09375 767.90625 L 576.09375 767.90625 C 682.125 767.90625 768.09375 681.9375 768.09375 575.90625 L 768.09375 191.90625 C 768.09375 85.875 682.125 -0.09375 576.09375 -0.09375 Z M 192.09375 -0.09375 " fill-opacity="1" fill-rule="nonzero"></path>
    </svg>`.trim();

    const parser = new DOMParser();

    const { root, components, tags } = parser.parseFromString(svgMarkup);
    const svg = root.children[0];

    expect(components).toEqual([]);
    expect(tags).toEqual(["svg", "defs", "clipPath", "path"]);

    expect(root.tagName).toEqual(undefined);
    expect(root.nodeName).toEqual("#document");
    expect(svg.nodeName).toEqual("SVG");
    expect(svg.tagName).toEqual("svg");
    expect(svg.children.length).toEqual(2);
    expect(svg.children[0].tagName).toEqual("defs");
    expect(svg.children[0].nodeName).toEqual("DEFS");
    expect(svg.children[0].children.length).toEqual(1);
    expect(svg.children[0].children[0].tagName).toEqual("clipPath");
    expect(svg.children[0].children[0].attributes["id"]).toEqual("5499afe1a4");
    expect(svg.children[0].children[0].children.length).toEqual(1);
    expect(svg.children[0].children[0].children[0].tagName).toEqual("path");
    expect(svg.children[0].children[0].children[0].attributes["clip-rule"])
      .toEqual("nonzero");
    expect(svg.children[0].children[0].children[0].attributes["d"]).toEqual(
      "M 215.664062 352.992188 L 398 352.992188 L 398 586 L 215.664062 586 Z M 215.664062 352.992188",
    );
  });

  test(`Test quote`, () => {
    const attributes = {
      link: "http://example.com",
      "data-value": "example",
    };
    const attrString = Object.entries(attributes).map(([key, value]) =>
      `${DOMParser.quoteText(key)}="${value}"`
    ).join(" ");
    const html = `<element ${attrString} />`;
    const parser = new DOMParser();
    const parsed = parser.parseFromString(html);
    expect(parsed.tags).toEqual(["element"]);
  });
});
