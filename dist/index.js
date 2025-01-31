var NodeParser=function(){"use strict";var f=Object.defineProperty;var m=(h,r,l)=>r in h?f(h,r,{enumerable:!0,configurable:!0,writable:!0,value:l}):h[r]=l;var u=(h,r,l)=>m(h,typeof r!="symbol"?r+"":r,l);const h=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr","path","circle","ellipse","line","rect","use","stop","polygon","polyline"]),r=d=>/^[a-zA-Z_][a-zA-Z_0-9]+$/.test(d)?d:`"${d}"`;class l{constructor(){u(this,"tags",new Set);u(this,"components",new Set);u(this,"root",{nodeName:"#document",attributes:{},children:[]});u(this,"stack",[this.root]);u(this,"currentNode",this.root)}parseFromString(o){const e=this.tokenize(o);return this.parseTokens(e),{root:this.root,components:Array.from(this.components),tags:Array.from(this.tags)}}tokenize(o){const e=[];let t="",a=!1,i=!1,c=34;for(let s=0;s<o.length;s++){const n=o.charCodeAt(s);if(a&&(n===34||n===39)){i?n===c&&(i=!1):(i=!0,c=n),t+=String.fromCharCode(n);continue}if(n===60&&!i)t.trim()&&e.push({type:"text",value:t.trim()}),t="",a=!0;else if(n===62&&!i){if(t){const g=t.endsWith("/");g&&(t=t.slice(0,-1)),e.push({type:"tag",value:t.trim(),isSelfClosing:g})}t="",a=!1}else t+=String.fromCharCode(n)}return t.trim()&&e.push({type:"text",value:t.trim(),isSelfClosing:!1}),e}parseTokens(o){this.root={nodeName:"#document",attributes:{},children:[]},this.stack=[this.root],this.currentNode=this.root;for(const e of o){let t=this.getTagName(e.value);const a=e.value.startsWith("/"),i=e.isSelfClosing;if(t=a?e.value.slice(1):this.getTagName(e.value),e.type==="tag")if(t=t.replace(/\/$/,""),t[0].toUpperCase()===t[0]||t.includes("-")?this.components.add(t):this.tags.add(t),a)this.stack.pop(),this.stack.length>0&&(this.currentNode=this.stack[this.stack.length-1]);else{const s={tagName:t,nodeName:t.toUpperCase(),attributes:i?{}:this.getAttributes(e.value),isSelfClosing:i,children:[]};i?this.currentNode.children.push(s):(this.currentNode.children.push(s),this.stack.push(s),this.currentNode=s)}else if(e.type==="text"){const c={nodeName:"#text",attributes:{},children:[],value:e.value};this.currentNode.children.push(c)}}}getTagName(o){return o.split(/[\s/>]/)[0]}getAttributes(o){const e={},t=/([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g,a=o.split(/\s+/);if(a.length<2)return e;const i=o.slice(a[0].length);let c;for(;(c=t.exec(i))!==null;){const[,s,n,g,p]=c;s&&s!=="/"&&(e[s]=n||g||p||"")}return e}}return u(l,"selfClosingTags",h),u(l,"quoteText",r),l}();
//# sourceMappingURL=index.js.map
