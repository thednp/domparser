const y = (t) => t.toLowerCase(), b = (t) => t.toUpperCase(), x = (t, s) => t.startsWith(s), w = (t, s) => t.endsWith(s), m = (t, s) => t.charCodeAt(s), C = (t) => t.replace(/[&<>"']/g, (s) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[s] || s), k = (t) => {
  const s = decodeURIComponent(t.trim());
  return /^(?:javascript|data|vbscript):/i.test(s) ? "" : C(s);
}, N = (t, s) => {
  if (!s) return "";
  const a = s.trim();
  return t === "src" || t === "href" || t === "action" || t === "formaction" || w(t, "url") ? k(a) : C(a);
}, E = (t, s = /* @__PURE__ */ new Set()) => {
  const a = {}, p = t.split(/\s+/);
  if (p.length < 2) return a;
  const S = t.slice(p[0].length);
  let o;
  const r = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
  for (; o = r.exec(S); ) {
    const [, e, l, c, f] = o;
    e && e !== "/" && !s.has(y(e)) && (a[e] = N(y(e), l ?? c ?? f ?? ""));
  }
  return a;
}, U = {
  nodeName: "#document",
  children: []
};
function W(t = {}) {
  const s = /* @__PURE__ */ new Set([
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
  ]), a = /* @__PURE__ */ new Set(), p = /* @__PURE__ */ new Set();
  if (t) {
    const { filterTags: o, filterAttrs: r } = t;
    o && o.forEach((e) => a.add(e)), r && r.forEach((e) => p.add(e));
  }
  const S = (o) => {
    const r = [];
    let e = "", l = !1, c = !1, f = 0, d = !1;
    for (let i = 0; i < o.length; i++) {
      const n = m(o, i);
      if (d) {
        e += String.fromCharCode(n), w(e, "--") && m(o, i + 1) === 62 && (r.push({
          nodeType: "comment",
          value: e.trim(),
          isSC: !1
        }), e = "", d = !1, i++);
        continue;
      }
      if (l && (n === 34 || n === 39)) {
        c ? n === f && (c = !1) : (f = n, c = !0), e += String.fromCharCode(n);
        continue;
      }
      if (n === 60 && !c) {
        if (e.trim() && r.push({
          nodeType: "text",
          value: C(e.trim()),
          isSC: !1
        }), e = "", l = !0, m(o, i + 1) === 33 && m(o, i + 2) === 45 && m(o, i + 3) === 45) {
          d = !0, e += "!--", i += 3;
          continue;
        }
      } else if (n === 62 && !c && l && !d) {
        if (e) {
          const g = w(e, "/"), h = x(e, "!doctype");
          r.push({
            nodeType: h ? "doctype" : "tag",
            value: g ? e.slice(0, -1).trim() : e.trim(),
            isSC: g
          });
        }
        e = "", l = !1;
      } else
        e += String.fromCharCode(n);
    }
    return e.trim() && r.push({
      nodeType: "text",
      value: C(e.trim()),
      isSC: !1
    }), r;
  };
  return {
    parseFromString(o) {
      const r = { ...U, children: [] };
      if (!o) return { root: r, components: [], tags: [] };
      const e = [r], l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
      let f = !0;
      return S(o).forEach((d) => {
        const { nodeType: i, value: n, isSC: g } = d;
        if (i === "doctype") return;
        if (["text", "comment"].includes(i)) {
          e[e.length - 1].children.push({
            nodeName: `#${i}`,
            nodeValue: i === "text" ? n : `<${n}>`
          });
          return;
        }
        const h = x(n, "/"), u = h ? n.slice(1) : n.split(/[\s/>]/)[0], T = y(u), v = g || s.has(T);
        if (a.has(T)) {
          h ? f = !0 : f = !1;
          return;
        }
        if (f)
          if ((u[0] === b(u[0]) || u.includes("-") ? l : c).add(u), h)
            !v && e.length > 1 && e.pop();
          else {
            const A = {
              tagName: u,
              nodeName: b(u),
              attributes: E(n, p),
              children: []
            };
            e[e.length - 1].children.push(A), !v && e.push(A);
          }
      }), {
        root: r,
        components: Array.from(l),
        tags: Array.from(c)
      };
    }
  };
}
export {
  W as Parser,
  C as encodeEntities,
  E as getAttributes,
  N as sanitizeAttrValue,
  k as sanitizeUrl
};
//# sourceMappingURL=index.mjs.map
