// benchmark.ts
/**
 * ```bash
 * node --experimental-transform-types demo/benchmark.ts libName
 * ```
 * ```bash
 * deno -A demo/benchmark.ts
 * ```
 */
import { JSDOM } from "jsdom"
import { Parser } from '../src/parts/parser.ts';
import { DomParser } from '../src/parts/dom-parser.ts';

const LIBS = {
  jsdom: JSDOM,
  Parser,
  DomParser
}

const libName = process.argv[2];
const parser = LIBS[libName];
const divLength = 200;
const standardParseTime = 1; // Parser
const standardQueryTime = 1; // DomParser
const standardGenTime = 2;   // DomParser

if (!libName) {
  console.log("💡 Usage node --experimental-transform-types demo/benchmark.ts libName")
  console.log("> libName must be jsdom Parser or DomParser");
  process.exit(1);
}

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Simple HTML5 Page</title>
    <meta name="description" content="A simple HTML5 page with metadata, comments, headings, and paragraphs.">
    <meta name="author" content="Your Name">
    <!-- This is a comment in the head section -->
    <link rel="icon" href="favicon.ico" type="image/x-icon">
</head>
<body>
    <!-- This is a comment in the body section -->
    <header>
        <h1>Welcome to My Simple HTML5 Page</h1>
    </header>
    <main>
        <section>
            <h2>About This Page</h2>
            <!-- This is a content section -->
            <p>This is a simple HTML5 page designed to demonstrate the use of metadata, comments, headings, and paragraphs. The page includes a title, a description, and an author in the metadata section.</p>
            <p>HTML5 provides a rich set of semantic elements that help in structuring content and improving accessibility and SEO. By using these elements, we can create more meaningful and user-friendly web pages.</p>
            <p>This is the first additional paragraph. You can use the p tag to define individual paragraphs in HTML.</p>
            <p>The second paragraph introduces more content. Each paragraph starts on a new line and stretches out to the full width available.</p>
            <p>Here is the third paragraph, demonstrating how to organize content into manageable blocks.</p>
            <p>The fourth paragraph helps to separate content visually and semantically, indicating new thoughts or topics.</p>
            <p>This is the fifth paragraph, showing how to use the p tag to create paragraphs in HTML documents.</p>
            <p>The sixth paragraph illustrates the use of CSS to control the appearance of paragraphs, such as adding margins or padding.</p>
            <p>The seventh paragraph demonstrates the importance of paragraphs in organizing content for better readability and understanding.</p>
            <p>The eighth paragraph can be used to add more information or details to your webpage.</p>
            <p>Here is the ninth paragraph, further emphasizing the role of paragraphs in HTML for structuring content.</p>
            <p>Finally, the tenth paragraph concludes this set of additional paragraphs, showing how to effectively use the p tag in HTML.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2025 Your Name. All rights reserved.</p>
    </footer>
</body>
</html>
`.trim();

// const dp = DomParser().parseFromString(html).root;

console.log(`\nBenchmarking ${libName}...`);
let startParseTime = 0;
let endParseTime = 0;
let startSelectorTime = 0;
let endSelectorTime = 0;
let startGenTime = 0;
let endGenTime = 0;
let paragraphs = [] as any[];
let divs = [] as any[];
const htmlLength = html.length;
if (libName === 'jsdom') {
  // parse
  startParseTime = new Date().getTime();
  const dom = new JSDOM(html).window.document;
  endParseTime = new Date().getTime();
  // query
  startSelectorTime = new Date().getTime();
  const results = dom.querySelectorAll("p");
  endSelectorTime = new Date().getTime();
  paragraphs = Array.from(results);
  // generate div
  const section = dom.querySelector('section')!;
  startGenTime = new Date().getTime();
  for (let i = 0; i < divLength; i += 1) {
    section.append(dom.createElement("div"))
  }
  endGenTime = new Date().getTime();
} else {
  // parse
  startParseTime = new Date().getTime();
  const doc = parser().parseFromString(html).root;
  endParseTime = new Date().getTime();
  if (libName === "DomParser") {
    // query
    startSelectorTime = new Date().getTime();
    paragraphs = doc.querySelectorAll("p");
    endSelectorTime = new Date().getTime();
    // generate div
    const section = doc.querySelector('section');
    startGenTime = new Date().getTime();
    for (let i = 0; i < divLength; i += 1) {
      section.append(doc.createElement("div"))
    }
    endGenTime = new Date().getTime();
  }
}

// Calculate results
const elapsed = endParseTime - startParseTime;
const difference = (elapsed / standardParseTime);
const difference2decimals = difference.toFixed(2);

console.log("\nHere are the results:\n");
console.log(`Parsing of ${htmlLength} characters HTML markup took: ${elapsed}ms,`)
console.log(
  `which is ${Math.round(difference) < 2
    ? "same as"
    : (difference2decimals + "x slower than")} Parser.`
);

if (startSelectorTime || endSelectorTime) {
  const elapsed = endSelectorTime - startSelectorTime;
  const difference = (elapsed / standardQueryTime);
  const difference2decimals = difference.toFixed(2);
  console.log(`\nQuery for of ${paragraphs.length} paragraphs took: ${elapsed}ms,`)
  console.log(
    `which is ${Math.round(difference) < 2
      ? "same as"
      : (difference2decimals + "x slower than")} DomParser.`
  );
}

if (startGenTime || endGenTime) {
  const elapsed = endGenTime - startGenTime;
  const difference = (elapsed / standardGenTime);
  const difference2decimals = difference.toFixed(2);
  console.log(`\nGenerating and appending ${divLength} divs took: ${elapsed}ms,`)
  console.log(
    `which is ${Math.round(difference) < 2
      ? "same as"
      : (difference2decimals + "x slower than")} DomParser.\n`
  );
}
