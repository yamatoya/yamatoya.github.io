!function(t){var a={};function e(i){if(a[i])return a[i].exports;var r=a[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,e),r.l=!0,r.exports}e.m=t,e.c=a,e.d=function(t,a,i){e.o(t,a)||Object.defineProperty(t,a,{enumerable:!0,get:i})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,a){if(1&a&&(t=e(t)),8&a)return t;if(4&a&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(e.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&a&&"string"!=typeof t)for(var r in t)e.d(i,r,function(a){return t[a]}.bind(null,r));return i},e.n=function(t){var a=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(a,"a",a),a},e.o=function(t,a){return Object.prototype.hasOwnProperty.call(t,a)},e.p="",e(e.s=11)}({1:function(t,a,e){"use strict";var i=class{constructor(t,a,e,i,r){this.BarHeight=i,this.BarNumberCoordinateY=r,this.BarNumber=t,this.BarLabel=a,this.BarCoordinateX=e}};class r{constructor(){this.icon="",this.key="",this.label=[],this.name="",this.term="",this.unit="",this.value=[]}}var h=class{constructor(t,a,e){this.BarLabelCoordinateY=0,this.BarGroupLavelCoordinateY=0,this.BarMagine=10,this.BarMaxWidth=30,this.BarWidth=30,this.BarGroups=[],this.GraphData=new r,t.dataset.forEach(t=>{t.key==e&&(this.GraphData=t)}),Math.round(a/this.GraphData.value.length)-this.BarMagine<this.BarMaxWidth?this.BarWidth=Math.round(a/this.GraphData.value.length)-this.BarMagine:this.BarMagine=Math.round(a/this.GraphData.value.length)-this.BarWidth,this.Bars=[]}generateBarData(t,a,e,r,h){for(let s=0;s<this.GraphData.value.length;s++){const n=r+this.BarMagine+(this.BarWidth+this.BarMagine)*s;let o,l;this.GraphData.value[s]>=0?(o=-t*this.GraphData.value[s]/e[e.length-1],l=h+o-8):(o=a*this.GraphData.value[s]/e[0],l=h+o+15);const c=new i(this.GraphData.value[s],this.GraphData.label[s],n,o,l);this.Bars.push(c)}}};var s=class{constructor(t,a,e,i,s,n,o){this.GraphXAxisCoordinateY=0,this.NegativeGraphHeight=0,this.PositiveGraphHeight=0,this.ScaleY=[],this.OriginalData=n,this.Content=t,this.Height=t.clientHeight,this.Width=t.clientWidth,this.LeftMagine=s,this.RightMagine=e,this.TopMagine=a,this.LowerMagine=i,this.GraphStartCoordinateX=this.LeftMagine,this.GraphExndCoordinateX=this.Width-this.RightMagine,this.GraphHeight=this.Height-this.TopMagine-this.LowerMagine,this.GraphWidth=this.Width-this.LeftMagine-this.RightMagine,this.GraphData=new r,n.dataset.forEach(t=>{t.key==o&&(this.GraphData=t)});this.ScaleY=this.makeYaxis(this.MiniValue,this.MaxValue,10),console.log(this.ScaleY),this.GraphXAxisCoordinateY=this.Height-this.LowerMagine;for(let t=0;t<this.ScaleY.length;t++)0==this.ScaleY[this.ScaleY.length-t-1]&&(this.GraphXAxisCoordinateY=this.TopMagine+Math.ceil(this.GraphHeight*(t+1)/this.ScaleY.length));this.PositiveGraphHeight=this.GraphXAxisCoordinateY-this.TopMagine,this.NegativeGraphHeight=this.GraphHeight-this.GraphXAxisCoordinateY,this.BarSet=new h(this.OriginalData,this.GraphWidth,o),this.BarSet.generateBarData(this.PositiveGraphHeight,this.NegativeGraphHeight,this.ScaleY,this.LeftMagine,this.GraphXAxisCoordinateY)}get MiniValue(){return Math.ceil(this.GraphData.value.reduce((t,a)=>Math.min(t,a)))}get MaxValue(){return Math.ceil(this.GraphData.value.reduce((t,a)=>Math.max(t,a)))}makeYaxis(t,a,e=10){let i=[];t==a&&(t-=10,a+=10);e<2?e=2:e>2&&(e-=2);let r=(a-t)/e,h=Math.floor(Math.log10(r)),s=Math.pow(10,h),n=Math.floor(r/s+.5)*s,o=n*Math.floor(t/n),l=n*Math.ceil(a/n),c=o;for(;i.push(c),c+=n,!(c>l););return i}};const n="#ccc",o="#000";a.a=class{constructor(t){this.keisenMargine=50,this.barBoxWidth=0,this.rightMargin=0,this.maxGraphWidth=30,this.yearLabel="",this.barLabelHeight=0,this.Term={Monthly:"m",Quorter:"q"},this.n={x:10,y:10};const{container:a,originalData:e,targetKey:i,LeftGraphAreaMagine:r=50,RightGraphAreaMagine:h=50,TopGraphAreaMagine:n=50,LowerGraphAreaMagine:o=50}=t;this.GraphArea=new s(a,n,h,o,r,e,i),this.GraphXAxisCoordinateY=0,this.canvases=[],this.overlay={canvas:document.createElement("canvas"),context:null},this.chart={canvas:document.createElement("canvas"),context:null},this.grid={canvas:document.createElement("canvas"),context:null},this._create()}_create(){this.overlay.context=this.overlay.canvas.getContext("2d"),this.canvases.push(this.overlay.canvas),this.chart.context=this.chart.canvas.getContext("2d"),this.canvases.push(this.chart.canvas),this.grid.context=this.grid.canvas.getContext("2d"),this.canvases.push(this.grid.canvas),this.canvases.reverse(),this.canvases.forEach(t=>{var a;null===(a=this.GraphArea.Content)||void 0===a||a.appendChild(t)}),this.initial(),this.overlay.canvas.addEventListener("mousemove",t=>{this.drow(t,this.grid.context)})}initial(){this.chart.canvas.width=this.GraphArea.Width,this.chart.canvas.height=this.GraphArea.Height,this.grid.canvas.width=this.GraphArea.Width,this.grid.canvas.height=this.GraphArea.Height,this.overlay.canvas.width=this.GraphArea.Width,this.overlay.canvas.height=this.GraphArea.Height,this.drawBar(this.chart.context,this.chart.canvas)}writeYAxis(t,a,e,i){null!=t&&(t.fillStyle="#0063B1",t.font="12px sans-serif",t.textAlign="end",t.fillText(i.toString(),a,e))}drawBar(t,a){if(null==t)return;const e=this.GraphArea.BarSet.Bars.length;this.barBoxWidth=Math.round(this.GraphArea.GraphWidth/e)-this.GraphArea.BarSet.BarMagine,this.rightMargin=this.GraphArea.Width-(this.keisenMargine+(this.barBoxWidth+this.GraphArea.BarSet.BarMagine)*e-this.barBoxWidth),this.barLabelHeight=a.height-this.keisenMargine+20,this.drawGentenKeisen(t,this.GraphArea.GraphXAxisCoordinateY);for(let a=0;a<e;a++){if(null==this.overlay.context)return;this.overlay.context.fillStyle="red",this.overlay.context.font="12px sans-serif",this.overlay.context.textAlign="left",this.writeLabelX(a),this.writeGraphBar(t,a),this.writeDataAmount(a)}}writeLabelX(t){if(this.isTermMonthly(this.GraphArea.GraphData.term)){let a=this.GraphArea.GraphData.label[t].split("/");this.yearLabel==a[0]&&""!=this.yearLabel||(this.yearLabel=a[0],this.writeLabelXYear(t,a[0]+"年")),this.writeLabelXEach(t,a[1]+"月")}else if(this.isTermQuorter(this.GraphArea.GraphData.term)){let a=this.GraphArea.GraphData.label[t].split("/");this.yearLabel==a[0]&&""!=this.yearLabel||(this.yearLabel=a[0],this.writeLabelXYear(t,a[0]+"年")),this.writeLabelXEach(t,""+a[1])}}isTermMonthly(t){return t==this.Term.Monthly}isTermQuorter(t){return this.Term.Quorter}writeLabelXEach(t,a){null!=this.overlay.context&&this.overlay.context.fillText(a,this.GraphArea.BarSet.Bars[t].BarCoordinateX,this.barLabelHeight)}writeLabelXYear(t,a){if(null==this.overlay.context)return;this.overlay.context.fillText(a,this.keisenMargine+1.5*this.GraphArea.BarSet.BarMagine+(this.barBoxWidth+this.GraphArea.BarSet.BarMagine)*t,this.barLabelHeight+14);let e=this.keisenMargine+this.GraphArea.BarSet.BarMagine+(this.barBoxWidth+this.GraphArea.BarSet.BarMagine)*t-.5*this.GraphArea.BarSet.BarMagine;null!=this.grid.context&&(this.overlay.context.strokeStyle=n,this.overlay.context.strokeStyle=o,this.overlay.context.beginPath(),this.overlay.context.moveTo(e,this.GraphArea.GraphXAxisCoordinateY-10),this.overlay.context.lineTo(e,this.GraphArea.GraphXAxisCoordinateY-10),this.overlay.context.lineTo(e,this.GraphArea.GraphXAxisCoordinateY+10),this.overlay.context.stroke(),console.log(`sepa:${e}/min:${this.GraphArea.GraphXAxisCoordinateY}`))}writeGraphBar(t,a){let e;t.fillStyle="#81C784",e=this.GraphArea.BarSet.Bars[a].BarHeight>0?this.GraphArea.GraphXAxisCoordinateY+1:this.GraphArea.GraphXAxisCoordinateY-1,t.fillRect(this.GraphArea.BarSet.Bars[a].BarCoordinateX,e,this.GraphArea.BarSet.BarWidth,this.GraphArea.BarSet.Bars[a].BarHeight)}writeDataAmount(t){null!=this.overlay.context&&this.overlay.context.fillText(this.GraphArea.BarSet.Bars[t].BarNumber.toLocaleString(),this.GraphArea.BarSet.Bars[t].BarCoordinateX,this.GraphArea.BarSet.Bars[t].BarNumberCoordinateY)}drawGentenKeisen(t,a){null!=t&&(t.strokeStyle=n,t.strokeStyle=o,t.beginPath(),t.moveTo(this.GraphArea.GraphStartCoordinateX,a),t.lineTo(this.GraphArea.GraphStartCoordinateX,a),t.lineTo(this.GraphArea.GraphExndCoordinateX,a),t.stroke())}drow(t,a){if(null==a)return;a.clearRect(0,0,this.GraphArea.Width,this.GraphArea.Height),t.offsetX<=this.keisenMargine+this.GraphArea.BarSet.BarMagine?this.n.x=this.keisenMargine+this.GraphArea.BarSet.BarMagine:t.offsetX>=this.GraphArea.Width-this.rightMargin?this.n.x=this.GraphArea.Width-this.rightMargin:this.n.x=Math.floor((t.offsetX-this.keisenMargine)/(this.barBoxWidth+this.GraphArea.BarSet.BarMagine))*(this.barBoxWidth+this.GraphArea.BarSet.BarMagine)+(this.keisenMargine+this.GraphArea.BarSet.BarMagine),t.offsetY<this.keisenMargine?this.n.y=this.keisenMargine:t.offsetY>this.GraphArea.Height-this.keisenMargine?this.n.y=this.GraphArea.Height-this.keisenMargine:this.n.y=t.offsetY,a.fillStyle="#ccc",a.fillRect(this.n.x,this.keisenMargine,this.GraphArea.BarSet.BarWidth,this.GraphArea.GraphHeight);let e=Math.floor((t.offsetX-this.keisenMargine)/(this.barBoxWidth+this.GraphArea.BarSet.BarMagine));e<0?e=0:e>this.GraphArea.GraphData.label.length-1&&(e=this.GraphArea.GraphData.label.length-1),a.fillRect(this.keisenMargine,this.n.y,this.GraphArea.Width,1),a.fillStyle="red",a.font="12px sans-serif",a.textBaseline="bottom",a.fillText(""+this.convertLabel(this.GraphArea.GraphData.label[e]),this.n.x,this.keisenMargine-24),a.fillText(`${this.GraphArea.GraphData.value[e].toLocaleString()}${this.GraphArea.GraphData.unit}`,this.n.x,this.keisenMargine-10)}convertLabel(t){return`${t.split("/")[0]}年${t.split("/")[1]}月`}}},11:function(t,a,e){"use strict";e.r(a);var i=e(1);const r={name:"コインチェック株式会社",dataset:[{key:"revenue",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[9.42,3.15,5.5,3.1,12.75,8.02,4.81,12.57,8.2],unit:"億円",name:"営業収益",icon:"bar-chart-2"},{key:"profit",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[-2.59,-5.88,-3.24,-5.6,1.42,.09,-1.27,2.69,1.02],unit:"億円",name:"税引き前利益",icon:"activity"},{key:"hr",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[4.06,3.73,4.32,5.36,3.99,3.08,2.58,3.21,2.94],unit:"億円",name:"人件費",icon:"users"},{key:"system",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[2.92,2.71,3.43,4.19,3.39,2.59,1.51,1.55,1.39],unit:"億円",name:"システム関連費用",icon:"monitor"},{key:"ad",term:"q",label:["2018/4-6","2018/7-9","2018/10-12","2019/1-3","2019/4-6","2019/7-9","2019/10-12","2020/1-3","2020/4-6"],value:[700,1e3,1100,5600,4200,8700,5900,7500,5900],unit:"万円",name:"広告宣伝費",icon:"tv"}]};window.addEventListener("DOMContentLoaded",(function(){const t=document.getElementById("graph");null!=t&&new i.a({container:t,originalData:r,targetKey:"revenue"})}))}});