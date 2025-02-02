const C = (e) => e.toLowerCase(), b = (e) => e.toUpperCase(), x = (e, s) => e.startsWith(s), v = (e, s) => e.endsWith(s), d = (e) => e.replace(/[&<>"']/g, (s) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[s] || /* istanbul ignore next @preserve */
s), A = (e) => {
  const s = decodeURIComponent(e.trim());
  return /^(?:javascript|data|vbscript):/i.test(s) ? "" : d(s);
}, N = (e, s) => {
  if (!s) return "";
  const a = s.trim();
  return e === "src" || e === "href" || e === "action" || e === "formaction" || v(e, "url") ? A(a) : d(a);
}, k = (e, s = /* @__PURE__ */ new Set()) => {
  const a = {}, p = e.split(/\s+/);
  if (p.length < 2) return a;
  const g = e.slice(p[0].length);
  let o;
  const n = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
  for (; o = n.exec(g); ) {
    const [, t, c, i, l] = o;
    t && t !== "/" && !s.has(C(t)) && (a[t] = N(C(t), c ?? i ?? l ?? ""));
  }
  return a;
}, E = {
  nodeName: "#document",
  children: []
};
function T(e = {}) {
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
  if (e) {
    const { filterTags: o, filterAttrs: n } = e;
    o && o.forEach((t) => a.add(t)), n && n.forEach((t) => p.add(t));
  }
  const g = (o) => {
    const n = [];
    let t = "", c = !1, i = !1, l = 0;
    for (let u = 0; u < o.length; u++) {
      const r = o.charCodeAt(u);
      if (c && (r === 34 || r === 39)) {
        i ? r === l && (i = !1) : (l = r, i = !0), t += String.fromCharCode(r);
        continue;
      }
      if (r === 60 && !i)
        t.trim() && n.push({
          type: "text",
          value: d(t.trim()),
          isSC: !1
        }), t = "", c = !0;
      else if (r === 62 && !i) {
        if (t) {
          const h = v(t, "/");
          n.push({
            type: "tag",
            value: h ? t.slice(0, -1).trim() : t.trim(),
            isSC: h
          });
        }
        t = "", c = !1;
      } else
        t += String.fromCharCode(r);
    }
    return t.trim() && n.push({
      type: "text",
      value: d(t.trim()),
      isSC: !1
    }), n;
  };
  return {
    parseFromString(o) {
      const n = { ...E, children: [] };
      if (!o) return { root: n, components: [], tags: [] };
      const t = [n], c = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
      let l = !0;
      return g(o).forEach((u) => {
        const { value: r, isSC: h } = u;
        if (u.type === "text") {
          t[t.length - 1].children.push({
            // attributes: {},
            // children: [],
            nodeName: "#text",
            value: r
          });
          return;
        }
        const m = x(r, "/"), f = m ? r.slice(1) : r.split(/[\s/>]/)[0], S = C(f), w = h || s.has(S);
        if (a.has(S)) {
          m ? l = !0 : l = !1;
          return;
        }
        if (l)
          if ((f[0] === b(f[0]) || f.includes("-") ? c : i).add(f), m)
            !w && t.length > 1 && t.pop();
          else {
            const y = {
              tagName: f,
              nodeName: b(f),
              attributes: k(r, p),
              children: []
            };
            t[t.length - 1].children.push(y), !w && t.push(y);
          }
      }), {
        root: n,
        components: Array.from(c),
        tags: Array.from(i)
      };
    }
  };
}
export {
  T as Parser,
  d as encodeEntities,
  k as getAttributes,
  N as sanitizeAttrValue,
  A as sanitizeUrl
};
//# sourceMappingURL=index.mjs.map
