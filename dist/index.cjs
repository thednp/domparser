"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const C=e=>e.toLowerCase(),y=e=>e.toUpperCase(),k=(e,s)=>e.startsWith(s),A=(e,s)=>e.endsWith(s),d=e=>e.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s]||s),v=e=>{const s=decodeURIComponent(e.trim());return/^(?:javascript|data|vbscript):/i.test(s)?"":d(s)},x=(e,s)=>{if(!s)return"";const a=s.trim();return e==="src"||e==="href"||e==="action"||e==="formaction"||A(e,"url")?v(a):d(a)},N=(e,s=new Set)=>{const a={},p=e.split(/\s+/);if(p.length<2)return a;const g=e.slice(p[0].length);let o;const n=/([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;for(;o=n.exec(g);){const[,t,c,i,l]=o;t&&t!=="/"&&!s.has(C(t))&&(a[t]=x(C(t),c??i??l??""))}return a},z={nodeName:"#document",children:[]};function E(e={}){const s=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr","path","circle","ellipse","line","rect","use","stop","polygon","polyline"]),a=new Set,p=new Set;if(e){const{filterTags:o,filterAttrs:n}=e;o&&o.forEach(t=>a.add(t)),n&&n.forEach(t=>p.add(t))}const g=o=>{const n=[];let t="",c=!1,i=!1,l=0;for(let f=0;f<o.length;f++){const r=o.charCodeAt(f);if(c&&(r===34||r===39)){i?r===l&&(i=!1):(l=r,i=!0),t+=String.fromCharCode(r);continue}if(r===60&&!i)t.trim()&&n.push({type:"text",value:d(t.trim()),isSC:!1}),t="",c=!0;else if(r===62&&!i){if(t){const h=A(t,"/");n.push({type:"tag",value:h?t.slice(0,-1).trim():t.trim(),isSC:h})}t="",c=!1}else t+=String.fromCharCode(r)}return t.trim()&&n.push({type:"text",value:d(t.trim()),isSC:!1}),n};return{parseFromString(o){const n={...z,children:[]};if(!o)return{root:n,components:[],tags:[]};const t=[n],c=new Set,i=new Set;let l=!0;return g(o).forEach(f=>{const{value:r,isSC:h}=f;if(f.type==="text"){t[t.length-1].children.push({nodeName:"#text",value:r});return}const m=k(r,"/"),u=m?r.slice(1):r.split(/[\s/>]/)[0],S=C(u),w=h||s.has(S);if(a.has(S)){m?l=!0:l=!1;return}if(l)if((u[0]===y(u[0])||u.includes("-")?c:i).add(u),m)!w&&t.length>1&&t.pop();else{const b={tagName:u,nodeName:y(u),attributes:N(r,p),children:[]};t[t.length-1].children.push(b),!w&&t.push(b)}}),{root:n,components:Array.from(c),tags:Array.from(i)}}}}exports.Parser=E;exports.encodeEntities=d;exports.getAttributes=N;exports.sanitizeAttrValue=x;exports.sanitizeUrl=v;
//# sourceMappingURL=index.cjs.map
