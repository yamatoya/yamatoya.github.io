!function(t){function a(a){for(var r,n,s=a[0],o=a[1],l=a[2],c=0,d=[];c<s.length;c++)n=s[c],Object.prototype.hasOwnProperty.call(i,n)&&i[n]&&d.push(i[n][0]),i[n]=0;for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(t[r]=o[r]);for(p&&p(a);d.length;)d.shift()();return h.push.apply(h,l||[]),e()}function e(){for(var t,a=0;a<h.length;a++){for(var e=h[a],r=!0,s=1;s<e.length;s++){var o=e[s];0!==i[o]&&(r=!1)}r&&(h.splice(a--,1),t=n(n.s=e[0]))}return t}var r={},i={0:0},h=[];function n(a){if(r[a])return r[a].exports;var e=r[a]={i:a,l:!1,exports:{}};return t[a].call(e.exports,e,e.exports,n),e.l=!0,e.exports}n.m=t,n.c=r,n.d=function(t,a,e){n.o(t,a)||Object.defineProperty(t,a,{enumerable:!0,get:e})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,a){if(1&a&&(t=n(t)),8&a)return t;if(4&a&&"object"==typeof t&&t&&t.__esModule)return t;var e=Object.create(null);if(n.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:t}),2&a&&"string"!=typeof t)for(var r in t)n.d(e,r,function(a){return t[a]}.bind(null,r));return e},n.n=function(t){var a=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(a,"a",a),a},n.o=function(t,a){return Object.prototype.hasOwnProperty.call(t,a)},n.p="";var s=window.webpackJsonp=window.webpackJsonp||[],o=s.push.bind(s);s.push=a,s=s.slice();for(var l=0;l<s.length;l++)a(s[l]);var p=o;h.push([10,1]),e()}({1:function(t,a,e){"use strict";var r=class{constructor(t,a,e,r,i){this.BarHeight=r,this.BarNumberCoordinateY=i,this.BarNumber=t,this.BarLabel=a,this.BarCoordinateX=e}};var i=class{constructor(t,a){this.BarGroupStartCoordinateX=a,this.BarGroupLabel=t,this.BarGroupEndCoordinateX=0}get BarGroupLabelCoordinateX(){const t=this.BarGroupEndCoordinateX-this.BarGroupStartCoordinateX;return this.BarGroupStartCoordinateX+t/2}};class h{constructor(){this.icon="",this.key="",this.label=[],this.name="",this.term="",this.unit="",this.value=[]}}var n=class{constructor(t,a,e){this.BarMagine=10,this.BarMaxWidth=30,this.BarWidth=30,this.BarGroups=[],this.GraphData=new h,t.dataset.forEach(t=>{t.key==e&&(this.GraphData=t)}),Math.round(a/this.GraphData.value.length)-this.BarMagine<this.BarMaxWidth?this.BarWidth=Math.round(a/this.GraphData.value.length)-this.BarMagine:this.BarMagine=Math.round(a/this.GraphData.value.length)-this.BarWidth,this.Bars=[],this.BarGroups=[]}generateBarData(t,a,e,h,n){let s="";for(let o=0;o<this.GraphData.value.length;o++){const l=h+this.BarMagine/2+(this.BarWidth+this.BarMagine)*o;let p,c;this.GraphData.value[o]>=0?(p=-t*this.GraphData.value[o]/e[e.length-1],c=n+p-8):(p=a*this.GraphData.value[o]/e[0],c=n+p+15);const d=new r(this.GraphData.value[o],this.GraphData.label[o],l,p,c);this.Bars.push(d);const u=this.GraphData.label[o].split("/")[0];if(s!=u){""!=s&&(this.BarGroups[this.BarGroups.length-1].BarGroupEndCoordinateX=l-this.BarMagine/2),s=u;const t=new i(s,l-this.BarMagine/2);this.BarGroups.push(t)}}this.BarGroups[this.BarGroups.length-1].BarGroupEndCoordinateX=this.Bars[this.Bars.length-1].BarCoordinateX+this.BarWidth+this.BarMagine/2}get LastBarStartCoordinateX(){return this.Bars[this.Bars.length-1].BarCoordinateX}};var s=class{constructor(t,a,e){this.LeftMagine=50,this.RightMagine=50,this.TopMagine=50,this.LowerMagine=50,this.GraphStartCoordinateX=50,this.GraphExndCoordinateX=50,this.GraphHeight=0,this.GraphWidth=0,this.GraphXAxisCoordinateY=0,this.NegativeGraphHeight=0,this.PositiveGraphHeight=0,this.BarLabelCoordinateY=0,this.BarGroupLavelCoordinateY=0,this.ScaleY=[],this.OriginalData=a,this.Content=t,this.Height=t.clientHeight,this.Width=t.clientWidth,this.Target=e,this.GraphData=new h,a.dataset.forEach(t=>{t.key==e&&(this.GraphData=t)});this.ScaleY=this.makeYaxis(this.MiniValue,this.MaxValue,10),this.BarSet=new n(this.OriginalData,this.GraphWidth,this.Target),this.load()}load(){this.LeftMagine=5*this.Width/100,this.RightMagine=5*this.Width/100,this.TopMagine=5*this.Width/100,this.LowerMagine=5*this.Width/100,this.GraphStartCoordinateX=this.LeftMagine,this.GraphExndCoordinateX=this.Width-this.RightMagine,this.GraphHeight=this.Height-this.TopMagine-this.LowerMagine,this.GraphWidth=this.Width-this.LeftMagine-this.RightMagine,this.BarSet=new n(this.OriginalData,this.GraphWidth,this.Target),this.GraphExndCoordinateX=this.Width-this.RightMagine,this.GraphHeight=this.Height-this.TopMagine-this.LowerMagine,this.GraphWidth=this.Width-this.LeftMagine-this.RightMagine,this.GraphXAxisCoordinateY=this.Height-this.LowerMagine;for(let t=0;t<this.ScaleY.length;t++)0==this.ScaleY[this.ScaleY.length-t-1]&&(this.GraphXAxisCoordinateY=this.TopMagine+Math.ceil(this.GraphHeight*(t+1)/this.ScaleY.length));this.BarLabelCoordinateY=this.GraphXAxisCoordinateY+12,this.BarGroupLavelCoordinateY=this.BarLabelCoordinateY+20,this.PositiveGraphHeight=this.GraphXAxisCoordinateY-this.TopMagine,this.NegativeGraphHeight=this.GraphHeight-this.GraphXAxisCoordinateY,this.BarSet=new n(this.OriginalData,this.GraphWidth,this.Target),this.BarSet.generateBarData(this.PositiveGraphHeight,this.NegativeGraphHeight,this.ScaleY,this.LeftMagine,this.GraphXAxisCoordinateY)}get MiniValue(){return Math.ceil(this.GraphData.value.reduce((t,a)=>Math.min(t,a)))}get MaxValue(){return Math.ceil(this.GraphData.value.reduce((t,a)=>Math.max(t,a)))}makeYaxis(t,a,e=10){const r=[];t==a&&(t-=10,a+=10);e<2?e=2:e>2&&(e-=2);const i=(a-t)/e,h=Math.floor(Math.log10(i)),n=Math.pow(10,h),s=Math.floor(i/n+.5)*n,o=s*Math.floor(t/s),l=s*Math.ceil(a/s);let p=o;for(;r.push(p),p+=s,!(p>l););return r}};const o="#ccc",l="#000";a.a=class{constructor(t){this.barBoxWidth=0,this.Term={Monthly:"m",Quorter:"q"},this.n={x:10,y:10};const{container:a,originalData:e,targetKey:r}=t;this.GraphArea=new s(a,e,r),this.canvases=[],this.overlay={canvas:document.createElement("canvas"),context:null},this.chart={canvas:document.createElement("canvas"),context:null},this.grid={canvas:document.createElement("canvas"),context:null},this._create()}_create(){this.overlay.context=this.overlay.canvas.getContext("2d"),this.canvases.push(this.overlay.canvas),this.chart.context=this.chart.canvas.getContext("2d"),this.canvases.push(this.chart.canvas),this.grid.context=this.grid.canvas.getContext("2d"),this.canvases.push(this.grid.canvas),this.canvases.reverse(),this.canvases.forEach(t=>{var a;null===(a=this.GraphArea.Content)||void 0===a||a.appendChild(t)}),this.initial(),this.overlay.canvas.addEventListener("mousemove",t=>{this.drow(t,this.grid.context)})}initial(){this.chart.canvas.width=this.GraphArea.Width,this.chart.canvas.height=this.GraphArea.Height,this.grid.canvas.width=this.GraphArea.Width,this.grid.canvas.height=this.GraphArea.Height,this.overlay.canvas.width=this.GraphArea.Width,this.overlay.canvas.height=this.GraphArea.Height,this.draw()}resize(){var t,a,e;null===(t=this.grid.context)||void 0===t||t.clearRect(0,0,this.GraphArea.Width,this.GraphArea.Height),null===(a=this.overlay.context)||void 0===a||a.clearRect(0,0,this.GraphArea.Width,this.GraphArea.Height),null===(e=this.chart.context)||void 0===e||e.clearRect(0,0,this.GraphArea.Width,this.GraphArea.Height),this.GraphArea.Height=this.GraphArea.Content.clientHeight,this.GraphArea.Width=this.GraphArea.Content.clientWidth,this.GraphArea.load(),this.initial()}writeYAxis(t,a,e,r){null!=t&&(t.fillStyle="#0063B1",t.font="12px sans-serif",t.textAlign="end",t.fillText(r.toString(),a,e))}draw(){if(null==this.chart.context)return;const t=this.GraphArea.BarSet.Bars.length;this.barBoxWidth=Math.round(this.GraphArea.GraphWidth/t)-this.GraphArea.BarSet.BarMagine,this.drawGentenKeisen(this.chart.context);for(let a=0;a<t;a++){if(null==this.overlay.context)return;this.overlay.context.fillStyle="red",this.overlay.context.font="12px sans-serif",this.overlay.context.textAlign="left",this.writeLabelX(a),this.writeGraphBar(this.chart.context,a),this.writeDataAmount(a)}this.writeGroup()}writeGroup(){if(null!=this.overlay.context)for(let t=0;t<this.GraphArea.BarSet.BarGroups.length;t++){const a=this.GraphArea.BarSet.BarGroups[t];if(this.overlay.context.fillStyle="Blue",this.overlay.context.font="14px sans-serif",this.overlay.context.textAlign="center",this.overlay.context.fillText(a.BarGroupLabel,a.BarGroupLabelCoordinateX,this.GraphArea.BarGroupLavelCoordinateY),t==this.GraphArea.BarSet.BarGroups.length-1)break;this.overlay.context.strokeStyle=o,this.overlay.context.strokeStyle=l,this.overlay.context.beginPath(),this.overlay.context.moveTo(a.BarGroupEndCoordinateX,this.GraphArea.GraphXAxisCoordinateY-10),this.overlay.context.lineTo(a.BarGroupEndCoordinateX,this.GraphArea.GraphXAxisCoordinateY-10),this.overlay.context.lineTo(a.BarGroupEndCoordinateX,this.GraphArea.GraphXAxisCoordinateY+10),this.overlay.context.stroke()}}writeLabelX(t){const a=this.GraphArea.GraphData.label[t].split("/");let e="";this.isTermMonthly(this.GraphArea.GraphData.term)?e=a[1]+"月":this.isTermQuorter(this.GraphArea.GraphData.term)&&(e=""+a[1]),null!=this.overlay.context&&this.overlay.context.fillText(e,this.GraphArea.BarSet.Bars[t].BarCoordinateX,this.GraphArea.BarLabelCoordinateY)}isTermMonthly(t){return t===this.Term.Monthly}isTermQuorter(t){return t===this.Term.Quorter}writeLabelXEach(t,a){null!=this.overlay.context&&this.overlay.context.fillText(a,this.GraphArea.BarSet.Bars[t].BarCoordinateX,this.GraphArea.BarLabelCoordinateY)}writeGraphBar(t,a){let e;e=this.GraphArea.BarSet.Bars[a].BarHeight>0?this.GraphArea.GraphXAxisCoordinateY+1:this.GraphArea.GraphXAxisCoordinateY-1;const r=t.createLinearGradient(this.GraphArea.BarSet.Bars[a].BarCoordinateX,e,this.GraphArea.BarSet.Bars[a].BarCoordinateX+this.GraphArea.BarSet.BarWidth,e+this.GraphArea.BarSet.Bars[a].BarHeight);r.addColorStop(0,"#6FC3F7"),r.addColorStop(.6,"#8bd1f1"),r.addColorStop(1,"#EAD6EE"),t.fillStyle=r,t.fillRect(this.GraphArea.BarSet.Bars[a].BarCoordinateX,e,this.GraphArea.BarSet.BarWidth,this.GraphArea.BarSet.Bars[a].BarHeight)}writeDataAmount(t){null!=this.overlay.context&&this.overlay.context.fillText(this.GraphArea.BarSet.Bars[t].BarNumber.toLocaleString(),this.GraphArea.BarSet.Bars[t].BarCoordinateX,this.GraphArea.BarSet.Bars[t].BarNumberCoordinateY)}drawGentenKeisen(t){null!=t&&(t.strokeStyle=o,t.strokeStyle=l,t.beginPath(),t.moveTo(this.GraphArea.GraphStartCoordinateX,this.GraphArea.GraphXAxisCoordinateY),t.lineTo(this.GraphArea.GraphStartCoordinateX,this.GraphArea.GraphXAxisCoordinateY),t.lineTo(this.GraphArea.GraphExndCoordinateX,this.GraphArea.GraphXAxisCoordinateY),t.stroke())}drow(t,a){if(null==a)return;a.clearRect(0,0,this.GraphArea.Width,this.GraphArea.Height),t.offsetX<=this.GraphArea.LeftMagine+this.GraphArea.BarSet.BarMagine?this.n.x=this.GraphArea.LeftMagine+this.GraphArea.BarSet.BarMagine/2:t.offsetX>=this.GraphArea.BarSet.LastBarStartCoordinateX?this.n.x=this.GraphArea.BarSet.LastBarStartCoordinateX:this.n.x=Math.floor((t.offsetX-this.GraphArea.LeftMagine)/(this.barBoxWidth+this.GraphArea.BarSet.BarMagine))*(this.barBoxWidth+this.GraphArea.BarSet.BarMagine)+this.GraphArea.LeftMagine+this.GraphArea.BarSet.BarMagine/2,t.offsetY<this.GraphArea.LowerMagine?this.n.y=this.GraphArea.LowerMagine:t.offsetY>this.GraphArea.Height-this.GraphArea.LowerMagine?this.n.y=this.GraphArea.Height-this.GraphArea.LowerMagine:this.n.y=t.offsetY,a.fillStyle="#ccc",a.fillRect(this.n.x,this.GraphArea.TopMagine,this.GraphArea.BarSet.BarWidth,this.GraphArea.GraphHeight);let e=Math.floor((t.offsetX-this.GraphArea.LeftMagine)/(this.barBoxWidth+this.GraphArea.BarSet.BarMagine));e<0?e=0:e>this.GraphArea.GraphData.label.length-1&&(e=this.GraphArea.GraphData.label.length-1),a.fillRect(this.GraphArea.LeftMagine,this.n.y,this.GraphArea.Width,1),a.fillStyle="red",a.font="12px sans-serif",a.textBaseline="bottom",a.fillText(""+this.convertLabel(this.GraphArea.GraphData.label[e]),this.n.x,this.GraphArea.TopMagine-24),a.fillText(`${this.GraphArea.GraphData.value[e].toLocaleString()}${this.GraphArea.GraphData.unit}`,this.n.x,this.GraphArea.TopMagine-10)}convertLabel(t){return`${t.split("/")[0]}年${t.split("/")[1]}月`}}},10:function(t,a,e){"use strict";e.r(a);var r=e(1),i=e(4),h=e.n(i),n=function(t,a,e,r){return new(e||(e=Promise))((function(i,h){function n(t){try{o(r.next(t))}catch(t){h(t)}}function s(t){try{o(r.throw(t))}catch(t){h(t)}}function o(t){var a;t.done?i(t.value):(a=t.value,a instanceof e?a:new e((function(t){t(a)}))).then(n,s)}o((r=r.apply(t,a||[])).next())}))};window.addEventListener("DOMContentLoaded",(function(){!function(){n(this,void 0,void 0,(function*(){const t=function(){const t=new URLSearchParams(window.location.search),a={name:"coincheck",target:"revenue"},e=t.get("name");null!=e&&(a.name=e);const r=t.get("target");null!=r&&(a.target=r);return a}(),a=yield function(t){return n(this,void 0,void 0,(function*(){const a=yield fetch(t);return yield a.json()}))}(`https://yamatoya.github.io/${t.name}/data.json`);!function(t,a){const e=document.getElementById("pageTitle");let r="";a.dataset.filter(a=>a.key===t.target).map(a=>{a.key==t.target&&("q"==a.term?r=`四半期 ${a.name} 推移`:"m"==a.term&&(r=`月間 ${a.name} 推移`))}),null!=e&&(e.innerText=r)}(t,a),function(t){const a=document.getElementById("companyName");if(null==a)return;a.innerText=t+" / yamaNote",a.href=`../${t}/index.html`,document.title=t+"ダッシュボード: yamaNonte"}(a.name),function(t,a){const e=document.getElementById("sideNav");if(null==e)return;const r=document.getElementById("sideTop");if(null==e)return;let i="";t.dataset.forEach(t=>{i+=`<li class="nav-item">\n                            <a class="nav-link" href="index.html?name=${a.name}&target=${t.key}">\n                                <span data-feather="${t.icon}"></span>\n                                ${t.name}\n                            </a>\n                        </li>`}),e.innerHTML=i,h.a.replace(),r.href=`../${a.name}/index.html`}(a,t),function(t){var a;const e=document.getElementById("companyQuarterDataTable");if(null==e)return;const r=document.getElementById("companyMonthlyDataTable");if(null==r)return;const i=e.createTHead().insertRow(0);let h="<th>#</th>";const n=r.createTHead(),s=n.insertRow(0);let o="<th>#</th>";const l=[];let p=1;h+=null===(a=t.dataset.find(t=>"q"==t.term))||void 0===a?void 0:a.label.reduce((t,a)=>t+`<th>${a}</th>`),i.innerHTML=h,e.appendChild(i),t.dataset.filter(t=>"q"==t.term).map(t=>{const a=e.insertRow(0);let r=`<td>${t.name}</td>`;r+=t.value.reduce((t,a)=>t+`<td>${a}</td>`),a.innerHTML=r,e.appendChild(a)}),t.dataset.filter(t=>"m"==t.term).map(t=>{const a=document.getElementById("monthlyTitle");if(null==a)return;a.innerText="月間データ推移",o+=`<th>${t.name}</th>`;let e=0;t.label.forEach(t=>{null==l[e]&&(l[e]=[]),l[e][0]=t,e++});let r=0;t.value.forEach(t=>{null==l[r]&&(l[r]=[]),l[r][p]=t,r++}),p++}),l.length>0&&(s.innerHTML=o,n.appendChild(s),l.forEach(t=>{const a=e.insertRow(0);let i="";t.forEach(t=>{i+=`<td>${t}</td>`}),a.innerHTML=i,r.appendChild(a)}))}(a),function(t,a){const e=document.getElementById("graph");if(null==e)return;const i=new r.a({container:e,originalData:t,targetKey:a});let h;window.addEventListener("resize",(function(){h||window.clearTimeout(h),h=window.setTimeout((function(){i.resize()}),1e3)}))}(a,t.target)}))}()}))}});