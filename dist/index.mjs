var g = Object.defineProperty;
var p = (n, e, t) => e in n ? g(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var l = (n, e, t) => p(n, typeof e != "symbol" ? e + "" : e, t);
const h = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "path",
  "circle",
  "ellipse",
  "line",
  "rect",
  "use",
  "stop",
  "polygon",
  "polyline"
]), m = (n) => /^[a-zA-Z_][a-zA-Z_0-9]+$/.test(n) ? n : `"${n}"`;
class f {
  constructor() {
    l(this, "tags", /* @__PURE__ */ new Set());
    l(this, "components", /* @__PURE__ */ new Set());
    l(this, "root", { nodeName: "#document", attributes: {}, children: [] });
    l(this, "stack", [this.root]);
    l(this, "currentNode", this.root);
  }
  /**
   * Returns a simple DOM representation of the parsed HTML.
   * @param htmlString The string of HTML to be parsed.
   * @return the parsed result.
   */
  parseFromString(e) {
    const t = this.tokenize(e);
    return this.parseTokens(t), {
      root: this.root,
      components: Array.from(this.components),
      tags: Array.from(this.tags)
    };
  }
  /**
   * Parse a string of HTML and return an array of tokens
   * where each token is an object with a type property and a value property.
   *
   * @param htmlString The string of HTML to be tokenized.
   * @return The array of tokens.
   */
  tokenize(e) {
    const t = [];
    let s = "", o = !1, r = !1, u = 34;
    for (let i = 0; i < e.length; i++) {
      const a = e.charCodeAt(i);
      if (o && (a === 34 || a === 39)) {
        r ? a === u && (r = !1) : (r = !0, u = a), s += String.fromCharCode(a);
        continue;
      }
      if (a === 60 && !r) {
        const c = s.trim();
        c && t.push({ type: "text", value: c, isSelfClosing: !1 }), s = "", o = !0;
      } else if (a === 62 && !r) {
        if (s) {
          const c = s.endsWith("/");
          c && (s = s.slice(0, -1)), t.push({
            type: "tag",
            value: s.trim(),
            isSelfClosing: c
          });
        }
        s = "", o = !1;
      } else
        s += String.fromCharCode(a);
    }
    return s.trim() && t.push({
      type: "text",
      value: s.trim(),
      isSelfClosing: !1
    }), t;
  }
  /**
   * Parse an array of tokens into a DOM representation.
   * @param tokens An array of tokens to be parsed.
   */
  parseTokens(e) {
    this.root = { nodeName: "#document", attributes: {}, children: [] }, this.stack = [this.root], this.currentNode = this.root;
    for (const t of e) {
      if (t.type === "text") {
        const i = {
          nodeName: "#text",
          attributes: {},
          children: [],
          value: t.value
        };
        this.currentNode.children.push(i);
        continue;
      }
      const s = t.value.startsWith("/"), o = s ? t.value.slice(1) : this.getTagName(t.value), r = t.isSelfClosing || h.has(o);
      if (o[0].toUpperCase() === o[0] || o.includes("-") ? this.components.add(o) : this.tags.add(o), s)
        !r && this.stack.length > 1 && (this.stack.pop(), this.currentNode = this.stack[this.stack.length - 1]);
      else {
        const i = {
          tagName: o,
          nodeName: o.toUpperCase(),
          attributes: this.getAttributes(t.value),
          children: []
        };
        this.currentNode.children.push(i), r || (this.stack.push(i), this.currentNode = i);
      }
    }
  }
  /**
   * Returns the name of the tag.
   * @param tagString A string of HTML that represents a tag.
   * @return The name of the tag.
   */
  getTagName(e) {
    return e.split(/[\s/>]/)[0];
  }
  /**
   * Returns an object where the keys are the names of the attributes
   * and the values are the values of the attributes.
   *
   * @param tagString A string of HTML that represents a tag.
   * @return an object where the keys are the names of the attributes and the values are the values of the attributes.
   */
  getAttributes(e) {
    const t = {}, s = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g, o = e.split(/\s+/);
    if (o.length < 2) return t;
    const r = e.slice(o[0].length);
    let u;
    for (; (u = s.exec(r)) !== null; ) {
      const [, i, a, c, d] = u;
      i && i !== "/" && (t[i] = a || /* istanbul ignore next @preserve */
      c || /* istanbul ignore next @preserve */
      d || /* istanbul ignore next @preserve */
      "");
    }
    return t;
  }
}
l(f, "selfClosingTags", h), l(f, "quoteText", m);
export {
  f as default
};
//# sourceMappingURL=index.mjs.map
