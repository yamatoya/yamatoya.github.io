!function(t){var a={};function e(r){if(a[r])return a[r].exports;var i=a[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,e),i.l=!0,i.exports}e.m=t,e.c=a,e.d=function(t,a,r){e.o(t,a)||Object.defineProperty(t,a,{enumerable:!0,get:r})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,a){if(1&a&&(t=e(t)),8&a)return t;if(4&a&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&a&&"string"!=typeof t)for(var i in t)e.d(r,i,function(a){return t[a]}.bind(null,i));return r},e.n=function(t){var a=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(a,"a",a),a},e.o=function(t,a){return Object.prototype.hasOwnProperty.call(t,a)},e.p="",e(e.s=11)}({1:function(t,a,e){"use strict";var r=class{constructor(t,a,e,r,i){this.BarHeight=r,this.BarNumberCoordinateY=i,this.BarNumber=t,this.BarLabel=a,this.BarCoordinateX=e}};var i=class{constructor(t,a){this.BarGroupStartCoordinateX=a,this.BarGroupLabel=t,this.BarGroupEndCoordinateX=0}get BarGroupLabelCoordinateX(){const t=this.BarGroupEndCoordinateX-this.BarGroupStartCoordinateX;return this.BarGroupStartCoordinateX+t/2}};class h{constructor(){this.icon="",this.key="",this.label=[],this.name="",this.term="",this.unit="",this.value=[]}}var s=class{constructor(t,a,e){this.BarMagine=10,this.BarMaxWidth=30,this.BarWidth=30,this.BarGroups=[],this.GraphData=new h,t.dataset.forEach(t=>{t.key==e&&(this.GraphData=t)}),Math.round(a/this.GraphData.value.length)-this.BarMagine<this.BarMaxWidth?this.BarWidth=Math.round(a/this.GraphData.value.length)-this.BarMagine:this.BarMagine=Math.round(a/this.GraphData.value.length)-this.BarWidth,this.Bars=[],this.BarGroups=[]}generateBarData(t,a,e,h,s){let n="";for(let o=0;o<this.GraphData.value.length;o++){const l=h+this.BarMagine/2+(this.BarWidth+this.BarMagine)*o;let p,c;this.GraphData.value[o]>=0?(p=-t*this.GraphData.value[o]/e[e.length-1],c=s+p-8):(p=a*this.GraphData.value[o]/e[0],c=s+p+15);const d=new r(this.GraphData.value[o],this.GraphData.label[o],l,p,c);this.Bars.push(d);const G=this.GraphData.label[o].split("/")[0];if(n!=G){""!=n&&(this.BarGroups[this.BarGroups.length-1].BarGroupEndCoordinateX=l-this.BarMagine/2),n=G;const t=new i(n,l-this.BarMagine/2);this.BarGroups.push(t)}}this.BarGroups[this.BarGroups.length-1].BarGroupEndCoordinateX=this.Bars[this.Bars.length-1].BarCoordinateX+this.BarWidth+this.BarMagine/2}get LastBarStartCoordinateX(){return this.Bars[this.Bars.length-1].BarCoordinateX}};var n=class{constructor(t,a,e){this.LeftMagine=50,this.RightMagine=50,this.TopMagine=50,this.LowerMagine=50,this.GraphStartCoordinateX=50,this.GraphExndCoordinateX=50,this.GraphHeight=0,this.GraphWidth=0,this.GraphXAxisCoordinateY=0,this.NegativeGraphHeight=0,this.PositiveGraphHeight=0,this.BarLabelCoordinateY=0,this.BarGroupLavelCoordinateY=0,this.ScaleY=[],this.OriginalData=a,this.Content=t,this.Height=t.clientHeight,this.Width=t.clientWidth,this.Target=e,this.GraphData=new h,a.dataset.forEach(t=>{t.key==e&&(this.GraphData=t)});this.ScaleY=this.makeYaxis(this.MiniValue,this.MaxValue,10),this.BarSet=new s(this.OriginalData,this.GraphWidth,this.Target),this.load()}load(){this.LeftMagine=5*this.Width/100,this.RightMagine=5*this.Width/100,this.TopMagine=5*this.Width/100,this.LowerMagine=Math.min(45,Math.max(45,5*this.Width/100)),this.GraphStartCoordinateX=this.LeftMagine,this.GraphExndCoordinateX=this.Width-this.RightMagine,this.GraphHeight=this.Height-this.TopMagine-this.LowerMagine,this.GraphWidth=this.Width-this.LeftMagine-this.RightMagine,this.BarSet=new s(this.OriginalData,this.GraphWidth,this.Target),this.GraphExndCoordinateX=this.Width-this.RightMagine,this.GraphHeight=this.Height-this.TopMagine-this.LowerMagine,this.GraphWidth=this.Width-this.LeftMagine-this.RightMagine,this.GraphXAxisCoordinateY=this.Height-this.LowerMagine;for(let t=0;t<this.ScaleY.length;t++)0==this.ScaleY[this.ScaleY.length-t-1]&&(this.GraphXAxisCoordinateY=this.TopMagine+Math.ceil(this.GraphHeight*(t+1)/this.ScaleY.length));this.BarLabelCoordinateY=this.GraphXAxisCoordinateY+12,this.BarGroupLavelCoordinateY=this.BarLabelCoordinateY+20,this.PositiveGraphHeight=this.GraphXAxisCoordinateY-this.TopMagine,this.NegativeGraphHeight=this.GraphHeight-this.GraphXAxisCoordinateY,this.BarSet=new s(this.OriginalData,this.GraphWidth,this.Target),this.BarSet.generateBarData(this.PositiveGraphHeight,this.NegativeGraphHeight,this.ScaleY,this.LeftMagine,this.GraphXAxisCoordinateY)}get MiniValue(){return Math.ceil(this.GraphData.value.reduce((t,a)=>Math.min(t,a)))}get MaxValue(){return Math.ceil(this.GraphData.value.reduce((t,a)=>Math.max(t,a)))}makeYaxis(t,a,e=10){const r=[];t==a&&(t-=10,a+=10);e<2?e=2:e>2&&(e-=2);const i=(a-t)/e,h=Math.floor(Math.log10(i)),s=Math.pow(10,h),n=Math.floor(i/s+.5)*s,o=n*Math.floor(t/n),l=n*Math.ceil(a/n);let p=o;for(;r.push(p),p+=n,!(p>l););return r}};const o="#ccc",l="#000";a.a=class{constructor(t){this.barBoxWidth=0,this.Term={Monthly:"m",Quorter:"q"},this.n={x:10,y:10};const{container:a,originalData:e,targetKey:r}=t;this.GraphArea=new n(a,e,r),this.canvases=[],this.overlay={canvas:document.createElement("canvas"),context:null},this.chart={canvas:document.createElement("canvas"),context:null},this.grid={canvas:document.createElement("canvas"),context:null},this._create()}_create(){this.overlay.context=this.overlay.canvas.getContext("2d"),this.canvases.push(this.overlay.canvas),this.chart.context=this.chart.canvas.getContext("2d"),this.canvases.push(this.chart.canvas),this.grid.context=this.grid.canvas.getContext("2d"),this.canvases.push(this.grid.canvas),this.canvases.reverse(),this.canvases.forEach(t=>{var a;null===(a=this.GraphArea.Content)||void 0===a||a.appendChild(t)}),this.initial(),this.overlay.canvas.addEventListener("mousemove",t=>{this.drow(t,this.grid.context)})}initial(){this.chart.canvas.width=this.GraphArea.Width,this.chart.canvas.height=this.GraphArea.Height,this.grid.canvas.width=this.GraphArea.Width,this.grid.canvas.height=this.GraphArea.Height,this.overlay.canvas.width=this.GraphArea.Width,this.overlay.canvas.height=this.GraphArea.Height,this.draw()}resize(){var t,a,e;null===(t=this.grid.context)||void 0===t||t.clearRect(0,0,this.GraphArea.Width,this.GraphArea.Height),null===(a=this.overlay.context)||void 0===a||a.clearRect(0,0,this.GraphArea.Width,this.GraphArea.Height),null===(e=this.chart.context)||void 0===e||e.clearRect(0,0,this.GraphArea.Width,this.GraphArea.Height),this.GraphArea.Height=this.GraphArea.Content.clientHeight,this.GraphArea.Width=this.GraphArea.Content.clientWidth,this.GraphArea.load(),this.initial()}writeYAxis(t,a,e,r){null!=t&&(t.fillStyle="#0063B1",t.font="12px sans-serif",t.textAlign="end",t.fillText(r.toString(),a,e))}draw(){if(null==this.chart.context)return;const t=this.GraphArea.BarSet.Bars.length;this.barBoxWidth=Math.round(this.GraphArea.GraphWidth/t)-this.GraphArea.BarSet.BarMagine,this.drawGentenKeisen(this.chart.context);for(let a=0;a<t;a++){if(null==this.overlay.context)return;this.overlay.context.fillStyle="red",this.overlay.context.font="12px sans-serif",this.overlay.context.textAlign="left",this.writeLabelX(a),this.writeGraphBar(this.chart.context,a),this.writeDataAmount(a)}this.writeGroup()}writeGroup(){if(null!=this.overlay.context)for(let t=0;t<this.GraphArea.BarSet.BarGroups.length;t++){const a=this.GraphArea.BarSet.BarGroups[t];if(this.overlay.context.fillStyle="Blue",this.overlay.context.font="14px sans-serif",this.overlay.context.textAlign="center",this.overlay.context.fillText(a.BarGroupLabel,a.BarGroupLabelCoordinateX,this.GraphArea.BarGroupLavelCoordinateY),t==this.GraphArea.BarSet.BarGroups.length-1)break;this.overlay.context.strokeStyle=o,this.overlay.context.strokeStyle=l,this.overlay.context.beginPath(),this.overlay.context.moveTo(a.BarGroupEndCoordinateX,this.GraphArea.GraphXAxisCoordinateY-10),this.overlay.context.lineTo(a.BarGroupEndCoordinateX,this.GraphArea.GraphXAxisCoordinateY-10),this.overlay.context.lineTo(a.BarGroupEndCoordinateX,this.GraphArea.GraphXAxisCoordinateY+10),this.overlay.context.stroke()}}writeLabelX(t){const a=this.GraphArea.GraphData.label[t].split("/");let e="";this.isTermMonthly(this.GraphArea.GraphData.term)?e=a[1]+"月":this.isTermQuorter(this.GraphArea.GraphData.term)&&(e=""+a[1]),null!=this.overlay.context&&this.overlay.context.fillText(e,this.GraphArea.BarSet.Bars[t].BarCoordinateX,this.GraphArea.BarLabelCoordinateY)}isTermMonthly(t){return t===this.Term.Monthly}isTermQuorter(t){return t===this.Term.Quorter}writeLabelXEach(t,a){null!=this.overlay.context&&this.overlay.context.fillText(a,this.GraphArea.BarSet.Bars[t].BarCoordinateX,this.GraphArea.BarLabelCoordinateY)}writeGraphBar(t,a){let e;e=this.GraphArea.BarSet.Bars[a].BarHeight>0?this.GraphArea.GraphXAxisCoordinateY+1:this.GraphArea.GraphXAxisCoordinateY-1;const r=t.createLinearGradient(this.GraphArea.BarSet.Bars[a].BarCoordinateX,e,this.GraphArea.BarSet.Bars[a].BarCoordinateX+this.GraphArea.BarSet.BarWidth,e+this.GraphArea.BarSet.Bars[a].BarHeight);r.addColorStop(0,"#6FC3F7"),r.addColorStop(.6,"#8bd1f1"),r.addColorStop(1,"#EAD6EE"),t.fillStyle=r,t.fillRect(this.GraphArea.BarSet.Bars[a].BarCoordinateX,e,this.GraphArea.BarSet.BarWidth,this.GraphArea.BarSet.Bars[a].BarHeight)}writeDataAmount(t){null!=this.overlay.context&&this.overlay.context.fillText(this.GraphArea.BarSet.Bars[t].BarNumber.toLocaleString(),this.GraphArea.BarSet.Bars[t].BarCoordinateX,this.GraphArea.BarSet.Bars[t].BarNumberCoordinateY)}drawGentenKeisen(t){null!=t&&(t.strokeStyle=o,t.strokeStyle=l,t.beginPath(),t.moveTo(this.GraphArea.GraphStartCoordinateX,this.GraphArea.GraphXAxisCoordinateY),t.lineTo(this.GraphArea.GraphStartCoordinateX,this.GraphArea.GraphXAxisCoordinateY),t.lineTo(this.GraphArea.GraphExndCoordinateX,this.GraphArea.GraphXAxisCoordinateY),t.stroke())}drow(t,a){if(null==a)return;a.clearRect(0,0,this.GraphArea.Width,this.GraphArea.Height),t.offsetX<=this.GraphArea.LeftMagine+this.GraphArea.BarSet.BarMagine?this.n.x=this.GraphArea.LeftMagine+this.GraphArea.BarSet.BarMagine/2:t.offsetX>=this.GraphArea.BarSet.LastBarStartCoordinateX?this.n.x=this.GraphArea.BarSet.LastBarStartCoordinateX:this.n.x=Math.floor((t.offsetX-this.GraphArea.LeftMagine)/(this.barBoxWidth+this.GraphArea.BarSet.BarMagine))*(this.barBoxWidth+this.GraphArea.BarSet.BarMagine)+this.GraphArea.LeftMagine+this.GraphArea.BarSet.BarMagine/2,t.offsetY<this.GraphArea.LowerMagine?this.n.y=this.GraphArea.LowerMagine:t.offsetY>this.GraphArea.Height-this.GraphArea.LowerMagine?this.n.y=this.GraphArea.Height-this.GraphArea.LowerMagine:this.n.y=t.offsetY,a.fillStyle="#ccc",a.fillRect(this.n.x,this.GraphArea.TopMagine,this.GraphArea.BarSet.BarWidth,this.GraphArea.GraphHeight);let e=Math.floor((t.offsetX-this.GraphArea.LeftMagine)/(this.barBoxWidth+this.GraphArea.BarSet.BarMagine));e<0?e=0:e>this.GraphArea.GraphData.label.length-1&&(e=this.GraphArea.GraphData.label.length-1),a.fillRect(this.GraphArea.LeftMagine,this.n.y,this.GraphArea.Width,1),a.fillStyle="red",a.font="12px sans-serif",a.textBaseline="bottom",a.fillText(""+this.convertLabel(this.GraphArea.GraphData.label[e]),this.n.x,this.GraphArea.TopMagine-24),a.fillText(`${this.GraphArea.GraphData.value[e].toLocaleString()}${this.GraphArea.GraphData.unit}`,this.n.x,this.GraphArea.TopMagine-10)}convertLabel(t){return`${t.split("/")[0]}年${t.split("/")[1]}月`}}},11:function(t,a,e){"use strict";e.r(a);var r=e(1);const i={name:"コインチェック株式会社",dataset:[{key:"revenue",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[9.42,3.15,5.5,3.1,12.75,8.02,4.81,12.57,8.2],unit:"億円",name:"営業収益",icon:"bar-chart-2"},{key:"profit",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[-2.59,-5.88,-3.24,-5.6,1.42,.09,-1.27,2.69,1.02],unit:"億円",name:"税引き前利益",icon:"activity"},{key:"hr",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[4.06,3.73,4.32,5.36,3.99,3.08,2.58,3.21,2.94],unit:"億円",name:"人件費",icon:"users"},{key:"system",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[2.92,2.71,3.43,4.19,3.39,2.59,1.51,1.55,1.39],unit:"億円",name:"システム関連費用",icon:"monitor"},{key:"ad",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[700,1e3,1100,5600,4200,8700,5900,7500,5900],unit:"万円",name:"広告宣伝費",icon:"tv"}]};window.addEventListener("DOMContentLoaded",(function(){const t=document.getElementById("graph");null!=t&&new r.a({container:t,originalData:i,targetKey:"revenue"})}))}});