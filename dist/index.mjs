var f = Object.defineProperty;
var m = (n, s, e) => s in n ? f(n, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[s] = e;
var h = (n, s, e) => m(n, typeof s != "symbol" ? s + "" : s, e);
const g = /* @__PURE__ */ new Set([
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
]), C = (n) => /^[a-zA-Z_][a-zA-Z_0-9]+$/.test(n) ? n : `"${n}"`;
class d {
  constructor() {
    h(this, "tags", /* @__PURE__ */ new Set());
    h(this, "components", /* @__PURE__ */ new Set());
    h(this, "root", { nodeName: "#document", attributes: {}, children: [] });
    h(this, "stack", [this.root]);
    h(this, "currentNode", this.root);
  }
  /**
   * Returns a simple DOM representation of the parsed HTML.
   * @param htmlString The string of HTML to be parsed.
   * @return the parsed result.
   */
  parseFromString(s) {
    const e = this.tokenize(s);
    return this.parseTokens(e), {
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
  tokenize(s) {
    const e = [];
    let t = "", a = !1, i = !1, l = 34;
    for (let o = 0; o < s.length; o++) {
      const r = s.charCodeAt(o);
      if (a && (r === 34 || r === 39)) {
        i ? r === l && (i = !1) : (i = !0, l = r), t += String.fromCharCode(r);
        continue;
      }
      if (r === 60 && !i) {
        const c = t.trim(), u = this.getTagName(c), p = g.has(u);
        c && e.push({ type: "text", value: c, isSelfClosing: p }), t = "", a = !0;
      } else if (r === 62 && !i) {
        if (t) {
          const c = t.endsWith("/");
          c && (t = t.slice(0, -1)), e.push({
            type: "tag",
            value: t.trim(),
            isSelfClosing: c
          });
        }
        t = "", a = !1;
      } else
        t += String.fromCharCode(r);
    }
    return t.trim() && e.push({
      type: "text",
      value: t.trim(),
      isSelfClosing: !1
    }), e;
  }
  /**
   * Parse an array of tokens into a DOM representation.
   * @param tokens An array of tokens to be parsed.
   */
  parseTokens(s) {
    this.root = { nodeName: "#document", attributes: {}, children: [] }, this.stack = [this.root], this.currentNode = this.root;
    for (const e of s) {
      let t = this.getTagName(e.value);
      const a = e.value.startsWith("/"), i = e.isSelfClosing;
      if (t = a ? e.value.slice(1) : this.getTagName(e.value), e.type === "tag")
        if (t = t.replace(/\/$/, ""), t[0].toUpperCase() === t[0] || t.includes("-") ? this.components.add(t) : this.tags.add(t), a)
          this.stack.pop(), this.stack.length > 0 && (this.currentNode = this.stack[this.stack.length - 1]);
        else {
          const o = {
            tagName: t,
            nodeName: t.toUpperCase(),
            attributes: i ? {} : this.getAttributes(e.value),
            isSelfClosing: i,
            children: []
          };
          i ? this.currentNode.children.push(o) : (this.currentNode.children.push(o), this.stack.push(o), this.currentNode = o);
        }
      else if (e.type === "text") {
        const l = {
          nodeName: "#text",
          attributes: {},
          children: [],
          value: e.value
        };
        this.currentNode.children.push(l);
      }
    }
  }
  /**
   * Returns the name of the tag.
   * @param tagString A string of HTML that represents a tag.
   * @return The name of the tag.
   */
  getTagName(s) {
    return s.split(/[\s/>]/)[0];
  }
  /**
   * Returns an object where the keys are the names of the attributes
   * and the values are the values of the attributes.
   *
   * @param tagString A string of HTML that represents a tag.
   * @return an object where the keys are the names of the attributes and the values are the values of the attributes.
   */
  getAttributes(s) {
    const e = {}, t = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g, a = s.split(/\s+/);
    if (a.length < 2) return e;
    const i = s.slice(a[0].length);
    let l;
    for (; (l = t.exec(i)) !== null; ) {
      const [, o, r, c, u] = l;
      o && o !== "/" && (e[o] = r || /* istanbul ignore next @preserve */
      c || /* istanbul ignore next @preserve */
      u || /* istanbul ignore next @preserve */
      "");
    }
    return e;
  }
}
h(d, "selfClosingTags", g), h(d, "quoteText", C);
export {
  d as default
};
//# sourceMappingURL=index.mjs.map
