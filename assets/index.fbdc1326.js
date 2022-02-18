import{r as d,l as M,u as b,a as I,i as x,j as u,b as S,R as P,c as H}from"./vendor.331803d5.js";const q=function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function s(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerpolicy&&(n.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?n.credentials="include":e.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(e){if(e.ep)return;e.ep=!0;const n=s(e);fetch(e.href,n)}};q();const j=({setStory:t})=>{const r=`Once upon a time...

    * There were two choices.
    * There were four lines of content.
   
   - They lived happily ever after.
       -> END
   `,s=d.exports.useRef(null),[i,e]=d.exports.useState([]),n=M(c=>i.map(l=>{const a=c.lineBlockAt(l.index);return{from:a.from,to:a.to,severity:l.type.includes("ERROR")?"error":l.type.includes("WARNING")?"warning":"info",message:l.msg}})),{setContainer:o}=b({container:s.current,extensions:[n,I()],value:r,minHeight:"100vh",height:"100vh",theme:"dark",onChange:(c,l)=>{f(c)}}),f=c=>{const l=[],a=(p,W)=>{var N=/^(ERROR|WARNING|RUNTIME ERROR|RUNTIME WARNING|TODO): ('([^']+)' )?line (\d+): (.*)/;let m=p.match(N);if(m){const C=m[1],L=m[3],v=parseInt(m[4]),T=m[5],A=/\n/gi,y=[];let g=null;for(;g=A.exec(c);)y.push(g.index+1);const O=y[v-1]||0;l.push({type:C,filename:L,lineNumber:v,index:O,msg:T})}},h=new x.exports.CompilerOptions(null,[],!1,a,null),R=new x.exports.Compiler(c,h);try{const p=R.Compile();t(p)}catch(p){console.error(p)}finally{e(l)}};return d.exports.useEffect(()=>{f(r)},[]),d.exports.useEffect(()=>{s.current&&o(s.current)},[s.current]),u("div",{children:u("div",{ref:s})})},k=({story:t})=>{const r=d.exports.useRef(null);return d.exports.useEffect(()=>{if(!(t===null||r.current===null))return(async()=>await w(t,r.current))(),()=>{r.current&&(r.current.innerHTML="")}},[t]),t===null?null:u("div",{children:u("div",{className:"container",ref:r})})};async function D(t){var r=t.scrollTop,s=t.scrollHeight-t.clientHeight,i=Math.max(0,s-r),e=300*i/100,n=null;let o=null;var f=new Promise(l=>{o=l});function c(l){n==null&&(n=l);var a=(l-n)/e,h=3*a*a-2*a*a*a;t.scrollTo(0,(1-h)*r+h*s),a<1?requestAnimationFrame(c):o&&o()}return requestAnimationFrame(c),f}async function F(t){return new Promise(r=>{setTimeout(()=>{r()},t)})}async function E(t,r,s=[],i=!1){var e=document.createElement("p");return e.classList.add(...s),e.classList.add("invisible"),e.innerHTML=r,t.appendChild(e),new Promise(n=>{setTimeout(()=>{e.classList.remove("invisible"),n()},i?0:300)})}function G(t,r){var n;for(var s=t.querySelectorAll(r),i=0;i<s.length;i++){var e=s[i];(n=e.parentNode)==null||n.removeChild(e)}}async function w(t,r){for(;t.canContinue;){var s=t.Continue(),i=t.currentTags;await E(r,s),i&&i.length>0&&await E(r,i.map(e=>`#${e}`).join(" "),["tags"])}t.currentChoices.forEach(async function(e,n){var o=document.createElement("p");o.classList.add("choice","invisible"),o.innerHTML=`<a href='#'>${e.text}</a>`,r.appendChild(o),await D(r),await F(200*n),o.classList.remove("invisible");var f=o.querySelectorAll("a")[0];f.addEventListener("click",function(c){c.preventDefault(),G(r,".choice"),t.ChooseChoiceIndex(e.index),w(t,r)})})}function U(){d.exports.useState(0);const[t,r]=d.exports.useState(null);return u("div",{className:"App",children:S("div",{className:"row",children:[u(j,{setStory:r}),u(k,{story:t})]})})}P.render(u(H.StrictMode,{children:u(U,{})}),document.getElementById("root"));