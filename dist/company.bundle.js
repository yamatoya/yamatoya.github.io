!function(t){function e(e){for(var a,s,r=e[0],l=e[1],o=e[2],g=0,d=[];g<r.length;g++)s=r[g],Object.prototype.hasOwnProperty.call(h,s)&&h[s]&&d.push(h[s][0]),h[s]=0;for(a in l)Object.prototype.hasOwnProperty.call(l,a)&&(t[a]=l[a]);for(c&&c(e);d.length;)d.shift()();return n.push.apply(n,o||[]),i()}function i(){for(var t,e=0;e<n.length;e++){for(var i=n[e],a=!0,r=1;r<i.length;r++){var l=i[r];0!==h[l]&&(a=!1)}a&&(n.splice(e--,1),t=s(s.s=i[0]))}return t}var a={},h={0:0},n=[];function s(e){if(a[e])return a[e].exports;var i=a[e]={i:e,l:!1,exports:{}};return t[e].call(i.exports,i,i.exports,s),i.l=!0,i.exports}s.m=t,s.c=a,s.d=function(t,e,i){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},s.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(s.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)s.d(i,a,function(e){return t[e]}.bind(null,a));return i},s.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="";var r=window.webpackJsonp=window.webpackJsonp||[],l=r.push.bind(r);r.push=e,r=r.slice();for(var o=0;o<r.length;o++)e(r[o]);var c=l;n.push([10,1]),i()}({1:function(t,e,i){"use strict";const a="#ccc",h="#000";e.a=class{constructor(t,e,i){this.barhMargine=10,this.width=0,this.height=0,this.keisenMargine=50,this.barWidth=0,this.barBoxWidth=0,this.graphwidth=0,this.graphHeight=0,this.rightMargin=0,this.maxGraphWidth=30,this.yearLabel="",this.positiveGraphHeight=0,this.negativeGraphHeight=0,this.gentenHeight=0,this.scaleY=[],this.barLabelHeight=0,this.n={x:10,y:10},this._chartContainer=t,this.targetKey=i,this.graphData={icon:"",key:"",label:[],name:"",term:"",unit:"",value:[]},e.dataset.forEach(t=>{t.key==this.targetKey&&(this.graphData=t,console.log(this.graphData))}),this.canvases=[],this.overlay={canvas:document.createElement("canvas"),context:null},this.chart={canvas:document.createElement("canvas"),context:null},this.grid={canvas:document.createElement("canvas"),context:null},this._create()}_create(){this.overlay.context=this.overlay.canvas.getContext("2d"),this.canvases.push(this.overlay.canvas),this.chart.context=this.chart.canvas.getContext("2d"),this.canvases.push(this.chart.canvas),this.grid.context=this.grid.canvas.getContext("2d"),this.canvases.push(this.grid.canvas),this.canvases.reverse(),this.canvases.forEach(t=>{var e;null===(e=this._chartContainer)||void 0===e||e.appendChild(t)}),this.initial(this._chartContainer),this.overlay.canvas.addEventListener("mousemove",t=>{this.drow(t,this.grid.context)})}initial(t){null!=t&&(this.width=t.clientWidth,this.height=t.clientHeight,this.chart.canvas.width=this.width,this.chart.canvas.height=this.height,this.grid.canvas.width=this.width,this.grid.canvas.height=this.height,this.overlay.canvas.width=this.width,this.overlay.canvas.height=this.height,this.graphwidth=this.width-2*this.keisenMargine,this.graphHeight=this.height-2*this.keisenMargine,this.drawBar(this.chart.context,this.chart.canvas))}writeYAxis(t,e,i,a){null!=t&&(t.fillStyle="#0063B1",t.font="12px sans-serif",t.textAlign="end",t.fillText(a.toString(),e,i))}drawBar(t,e){if(null==t)return;const i=this.graphData.label.length;this.barBoxWidth=Math.round(this.graphwidth/i)-this.barhMargine,this.barWidth=Math.round(this.graphwidth/i)-this.barhMargine>this.maxGraphWidth?this.maxGraphWidth:Math.round(this.graphwidth/i)-this.barhMargine,this.rightMargin=this.width-(this.keisenMargine+(this.barBoxWidth+this.barhMargine)*i-this.barBoxWidth),this.barLabelHeight=e.height-this.keisenMargine+20;const a=Math.ceil(this.graphData.value.reduce((t,e)=>Math.max(t,e))),h=Math.ceil(this.graphData.value.reduce((t,e)=>Math.min(t,e)));this.scaleY=this.makeYaxis(h,a,10),this.gentenHeight=e.height-this.keisenMargine;let n=0;for(let t=0;t<this.scaleY.length;t++)0==this.scaleY[this.scaleY.length-t-1]&&(this.gentenHeight=this.keisenMargine+Math.ceil(this.graphHeight*(t+1)/this.scaleY.length)),n=this.keisenMargine+Math.ceil(this.graphHeight/this.scaleY.length)*t;this.drawGentenKeisen(t,this.keisenMargine,this.gentenHeight,this.graphwidth),this.positiveGraphHeight=this.gentenHeight-this.keisenMargine,this.negativeGraphHeight=n-this.gentenHeight;for(let e=0;e<i;e++){if(null==this.overlay.context)return;this.overlay.context.fillStyle="red",this.overlay.context.font="12px sans-serif",this.overlay.context.textAlign="left",this.writeLabelX(e),this.writeGraphBar(t,e),this.writeDataAmount(e)}}writeLabelX(t){if("m"==this.graphData.term){let e=this.graphData.label[t].split("/");this.yearLabel==e[0]&&""!=this.yearLabel||(this.yearLabel=e[0],this.writeLabelXYear(t,e[0]+"年")),this.writeLabelXEach(t,e[1]+"月")}else if(this.graphData.term="q"){let e=this.graphData.label[t].split("/");console.log(this.yearLabel),this.yearLabel==e[0]&&""!=this.yearLabel||(this.yearLabel=e[0],this.writeLabelXYear(t,e[0]+"年")),this.writeLabelXEach(t,""+e[1])}}writeLabelXEach(t,e){null!=this.overlay.context&&this.overlay.context.fillText(e,this.keisenMargine+1.5*this.barhMargine+(this.barBoxWidth+this.barhMargine)*t,this.barLabelHeight)}writeLabelXYear(t,e){null!=this.overlay.context&&this.overlay.context.fillText(e,this.keisenMargine+1.5*this.barhMargine+(this.barBoxWidth+this.barhMargine)*t,this.barLabelHeight+14)}writeGraphBar(t,e){t.fillStyle="#81C784",t.fillRect(this.keisenMargine+this.barhMargine+(this.barBoxWidth+this.barhMargine)*e,this.graphData.value[e]>=0?this.gentenHeight-1:this.gentenHeight+1,this.barWidth,this.graphData.value[e]>=0?-this.positiveGraphHeight*this.graphData.value[e]/this.scaleY[this.scaleY.length-1]:this.negativeGraphHeight*this.graphData.value[e]/this.scaleY[0])}writeDataAmount(t){null!=this.overlay.context&&this.overlay.context.fillText(this.graphData.value[t].toLocaleString(),this.keisenMargine+this.barhMargine+(this.barBoxWidth+this.barhMargine)*t,this.graphData.value[t]>=0?this.gentenHeight-this.positiveGraphHeight*this.graphData.value[t]/this.scaleY[this.scaleY.length-1]-10:this.gentenHeight+this.negativeGraphHeight*this.graphData.value[t]/this.scaleY[0]+20)}drawGentenKeisen(t,e,i,n){null!=t&&(t.strokeStyle=a,t.strokeStyle=h,t.beginPath(),t.moveTo(e,i),t.lineTo(e,i),t.lineTo(e+n,i),t.stroke())}getXlabel(t){let e="";if("m"==this.graphData.term){let i=this.graphData.label[t].split("/");this.yearLabel!=i[0]||""==this.yearLabel?(this.yearLabel=i[0],e=i[0]+"年"):e=i[1]+"月"}else if(this.graphData.term="q"){let i=this.graphData.label[t].split("/");this.yearLabel!=i[0]||""==this.yearLabel?(this.yearLabel=i[0],e=i[0]+"年"):e=""+i[1]}return e}makeYaxis(t,e,i=10){let a=[];t==e&&(t-=10,e+=10);i<2?i=2:i>2&&(i-=2);let h=(e-t)/i,n=Math.floor(Math.log10(h)),s=Math.pow(10,n),r=Math.floor(h/s+.5)*s,l=r*Math.floor(t/r),o=r*Math.ceil(e/r),c=l;for(;a.push(c),c+=r,!(c>o););return a}drow(t,e){if(null==e)return;e.clearRect(0,0,this.width,this.height),t.offsetX<=this.keisenMargine+this.barhMargine?this.n.x=this.keisenMargine+this.barhMargine:t.offsetX>=this.width-this.rightMargin?this.n.x=this.width-this.rightMargin:this.n.x=Math.floor((t.offsetX-this.keisenMargine)/(this.barBoxWidth+this.barhMargine))*(this.barBoxWidth+this.barhMargine)+(this.keisenMargine+this.barhMargine),t.offsetY<this.keisenMargine?this.n.y=this.keisenMargine:t.offsetY>this.height-this.keisenMargine?this.n.y=this.height-this.keisenMargine:this.n.y=t.offsetY,e.fillStyle="#ccc",e.fillRect(this.n.x,this.keisenMargine,this.barWidth,this.graphHeight);let i=Math.floor((t.offsetX-this.keisenMargine)/(this.barBoxWidth+this.barhMargine));i<0?i=0:i>this.graphData.label.length-1&&(i=this.graphData.label.length-1),e.fillRect(this.keisenMargine,this.n.y,this.graphwidth,1),e.fillStyle="red",e.font="12px sans-serif",e.textBaseline="bottom",e.fillText(""+this.convertLabel(this.graphData.label[i]),this.n.x,this.keisenMargine-24),e.fillText(`${this.graphData.value[i].toLocaleString()}${this.graphData.unit}`,this.n.x,this.keisenMargine-10)}convertLabel(t){return`${t.split("/")[0]}年${t.split("/")[1]}月`}}},10:function(t,e,i){"use strict";i.r(e);var a=i(1),h=i(4),n=i.n(h),s=function(t,e,i,a){return new(i||(i=Promise))((function(h,n){function s(t){try{l(a.next(t))}catch(t){n(t)}}function r(t){try{l(a.throw(t))}catch(t){n(t)}}function l(t){var e;t.done?h(t.value):(e=t.value,e instanceof i?e:new i((function(t){t(e)}))).then(s,r)}l((a=a.apply(t,e||[])).next())}))};window.addEventListener("DOMContentLoaded",(function(){!function(){s(this,void 0,void 0,(function*(){const t=function(){const t=new URLSearchParams(window.location.search),e={name:"coincheck",target:"revenue"},i=t.get("name");null!=i&&(e.name=i);const a=t.get("target");null!=a&&(e.target=a);return e}(),e=yield function(t){return s(this,void 0,void 0,(function*(){const e=yield fetch(t);return yield e.json()}))}(`https://yamatoya.github.io/${t.name}/data.json`);!function(t,e){const i=document.getElementById("pageTitle");let a="";e.dataset.filter(e=>e.key===t.target).map(e=>{e.key==t.target&&("q"==e.term?a=`四半期 ${e.name} 推移`:"m"==e.term&&(a=`月間 ${e.name} 推移`))}),null!=i&&(i.innerText=a)}(t,e),function(t){const e=document.getElementById("companyName");if(null==e)return;e.innerText=t+" / yamaNote",e.href=`../${t}/index.html`,document.title=t+"ダッシュボード: yamaNonte"}(e.name),function(t,e){const i=document.getElementById("sideNav");if(null==i)return;const a=document.getElementById("sideTop");if(null==i)return;let h="";t.dataset.forEach(t=>{h+=`<li class="nav-item">\n                            <a class="nav-link" href="index.html?name=${e.name}&target=${t.key}">\n                                <span data-feather="${t.icon}"></span>\n                                ${t.name}\n                            </a>\n                        </li>`}),i.innerHTML=h,n.a.replace(),a.href=`../${e.name}/index.html`}(e,t),function(t){var e;const i=document.getElementById("companyQuarterDataTable");if(null==i)return;const a=document.getElementById("companyMonthlyDataTable");if(null==a)return;let h=i.createTHead().insertRow(0),n="<th>#</th>",s=a.createTHead(),r=s.insertRow(0),l="<th>#</th>",o=[],c=1;n+=null===(e=t.dataset.find(t=>"q"==t.term))||void 0===e?void 0:e.label.reduce((t,e)=>t+`<th>${e}</th>`),h.innerHTML=n,i.appendChild(h),t.dataset.filter(t=>"q"==t.term).map(t=>{let e=i.insertRow(0),a=`<td>${t.name}</td>`;a+=t.value.reduce((t,e)=>t+`<td>${e}</td>`),e.innerHTML=a,i.appendChild(e)}),t.dataset.filter(t=>"m"==t.term).map(t=>{const e=document.getElementById("monthlyTitle");if(null==e)return;e.innerText="月間データ推移",l+=`<th>${t.name}</th>`;let i=0;t.label.forEach(t=>{null==o[i]&&(o[i]=[]),o[i][0]=t,console.log(`k:${i}:${t}`),i++});let a=0;t.value.forEach(t=>{null==o[a]&&(o[a]=[]),o[a][c]=t,a++}),c++}),o.length>0&&(console.log(o),r.innerHTML=l,s.appendChild(r),o.forEach(t=>{let e=i.insertRow(0),h="";t.forEach(t=>{h+=`<td>${t}</td>`}),e.innerHTML=h,a.appendChild(e)}))}(e),function(t,e){const i=document.getElementById("graph");if(null==i)return;new a.a(i,t,e),console.log(t),console.log(e)}(e,t.target)}))}()}))}});