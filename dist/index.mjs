var g = Object.defineProperty;
var p = (n, s, e) => s in n ? g(n, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[s] = e;
var c = (n, s, e) => p(n, typeof s != "symbol" ? s + "" : s, e);
const f = /* @__PURE__ */ new Set([
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
class h {
  constructor() {
    c(this, "tags", /* @__PURE__ */ new Set());
    c(this, "components", /* @__PURE__ */ new Set());
    c(this, "root", { nodeName: "#document", attributes: {}, children: [] });
    c(this, "stack", [this.root]);
    c(this, "currentNode", this.root);
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
      if (r === 60 && !i)
        t.trim() && e.push({ type: "text", value: t.trim() }), t = "", a = !0;
      else if (r === 62 && !i) {
        if (t) {
          const u = t.endsWith("/");
          u && (t = t.slice(0, -1)), e.push({
            type: "tag",
            value: t.trim(),
            isSelfClosing: u
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
      const [, o, r, u, d] = l;
      o && o !== "/" && (e[o] = r || /* istanbul ignore next @preserve */
      u || /* istanbul ignore next @preserve */
      d || /* istanbul ignore next @preserve */
      "");
    }
    return e;
  }
}
c(h, "selfClosingTags", f), c(h, "quoteText", m);
export {
  h as default
};
//# sourceMappingURL=index.mjs.map
