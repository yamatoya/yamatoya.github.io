import { convertCompilerOptionsFromJson } from "typescript";

const data: graphData = {
    "label": [
        "2018/04",
        "2018/05",
        "2018/06",
        "2018/07",
        "2018/08",
        "2018/09",
        "2018/10",
        "2018/11",
        "2018/12",
        "2019/01",
        "2019/02",
        "2019/03",
        "2019/04",
        "2019/05",
        "2019/06",
        "2019/07",
        "2019/08",
        "2019/09",
        "2019/10",
        "2019/11",
        "2019/12",
        "2020/01",
        "2020/02",
        "2020/03",
        "2020/04",
        "2020/05"
    ],
    "value": [
        10138,
        8675,
        6699,
        7971,
        9589,
        9867,
        11360,
        8589,
        8162,
        7345,
        6319,
        6549,
        7026,
        8314,
        10143,
        9143,
        5259,
        4446,
        3857,
        3100,
        2406,
        2320,
        6578,
        3322,
        2625,
        2845
    ],
    "unit": "億円",
    "name": "営業収益"
};

const color = {
    grid: "#ccc",
    border: "#000",
}
const barhMargine = 10;

export interface canvasStr {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D | null
}

export interface graphData {
    label: string[]
    value: number[]
    unit: string
    name: string
}

let canvases = []
let contexts = []
let width = 0, height = 0, keisenMargine = 50, barWidth = 0, graphwidth=0, graphHeight=0, rightMargin = 0;
let _chartContainer = document.getElementById("graph");

let overlay: canvasStr = {
    canvas: document.createElement("canvas"),
    context: null
}
overlay.context = overlay.canvas.getContext("2d")
canvases.push(overlay.canvas)
contexts.push(overlay.context)

let chart: canvasStr = {
    canvas: document.createElement("canvas"),
    context: null
}
chart.context = chart.canvas.getContext("2d")
canvases.push(chart.canvas)
contexts.push(chart.context)

let grid: canvasStr = {
    canvas: document.createElement("canvas"),
    context: null
}
grid.context = grid.canvas.getContext("2d")
canvases.push(grid.canvas)
contexts.push(grid.context)

canvases.reverse()
contexts.reverse()

canvases.forEach(function (t) {
    _chartContainer?.appendChild(t)
})

initial(_chartContainer);

overlay.canvas.addEventListener('mousemove', e => {
    drow(e,grid.context);
})


function initial(container: HTMLElement | null) {
    if (container == undefined) {
        return;
    }
    width = container.clientWidth;
    height = container.clientHeight;
    console.log(height);
    chart.canvas.width = width;
    chart.canvas.height = height;
    grid.canvas.width = width;
    grid.canvas.height = height;
    overlay.canvas.width = width;
    overlay.canvas.height = height;

    graphwidth = width - keisenMargine * 2;
    graphHeight = height - keisenMargine * 2;
    drawKeisen(chart.context, chart.canvas)
    drawBar(data, chart.context, chart.canvas)
}

function drawKeisen(ctx: CanvasRenderingContext2D | null, can: HTMLCanvasElement) {
    if (ctx == null) {
        return;
    }
    ctx.fillStyle = color.border
    ctx.strokeStyle = color.border
    ctx.beginPath();
    ctx.moveTo(keisenMargine, keisenMargine);
    ctx.lineTo(keisenMargine, keisenMargine);
    ctx.lineTo(keisenMargine, can.height - keisenMargine)
    ctx.lineTo(can.width - keisenMargine + 3, can.height - keisenMargine)
    ctx.stroke();
}

function drawMemori(ctx: CanvasRenderingContext2D | null, x: number, y: number, width: number) {
    if (ctx == null) {
        return;
    }
    ctx.fillStyle = color.border
    ctx.strokeStyle = color.grid
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
}

function drawBar(data: graphData, ctx: CanvasRenderingContext2D | null, can: HTMLCanvasElement) {
    if (ctx == null) {
        return;
    }
    const count = data.label.length;

    barWidth = Math.round(graphwidth / count) - barhMargine;
    rightMargin = width - (keisenMargine + (barWidth + barhMargine) * count - barWidth) 
    const barLabel = can.height - keisenMargine + 20;

    const aryMax = function (a: number, b: number) { return Math.max(a, b); }
    const maxPrice = Math.ceil(data.value.reduce(aryMax));

    ctx.fillStyle = "#0063B1";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "end";
    ctx.fillText(maxPrice.toString(), keisenMargine-2, keisenMargine + 10)
    ctx.fillText(" 0", keisenMargine-2, can.height - keisenMargine)

    const memoriCount = Math.floor(maxPrice/Math.ceil(maxPrice/10))
    for (let i = 0; i < memoriCount; i++) {
        drawMemori(ctx, keisenMargine, keisenMargine + Math.ceil((graphHeight/memoriCount)) * i, graphwidth)
    }

    for (let b = 0; b < count; b++) {
        ctx.fillStyle = "red";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "left";
        // x軸のlabel表示
        ctx.fillText(data.label[b], keisenMargine  + barhMargine　*　1.5 + (barWidth + barhMargine) * b, barLabel)

        ctx.fillStyle = "#0063B1";
        ctx.fillRect(keisenMargine + barhMargine + (barWidth + barhMargine) * b, can.height - keisenMargine - 1, barWidth, -graphHeight * data.value[b] / maxPrice)
    }
}

var n = {
    x: 10,
    y: 10
}

function drow(e: MouseEvent,ctx: CanvasRenderingContext2D | null) {
    if (ctx == null) {
        return;
    }
    ctx.clearRect(0, 0, width, height);

    if (e.offsetX <= keisenMargine + barhMargine) {
         n.x = keisenMargine + barhMargine;
    } else if (e.offsetX >= width-rightMargin) {
         n.x = width-rightMargin
    } else {
        //n.x=e.offsetX
        //  n.x = width - (Math.floor((width - e.offsetX - keisenMargine) / (barWidth + barhMargine) + 1) * (barWidth + barhMargine)) - keisenMargine + barhMargine
        n.x = Math.floor((e.offsetX - keisenMargine) / (barWidth + barhMargine)) * (barWidth + barhMargine) + (keisenMargine+barhMargine)
    }
    console.log(width-rightMargin)

    if (e.offsetY < keisenMargine) {
         n.y = keisenMargine
    } else if (e.offsetY > height-keisenMargine) {
         n.y = height-keisenMargine
    } else {
         n.y = e.offsetY;
    }

    ctx.fillStyle = "#e9546b"

    // // カーソルがある場所に縦の線を引く
    ctx.fillRect(n.x, keisenMargine, barWidth, graphHeight);

    let selectedBar = Math.floor((e.offsetX - keisenMargine) / (barWidth + barhMargine));
    if(selectedBar<0) {
        selectedBar = 0
    } else if (selectedBar > data.label.length-1) {
        selectedBar = data.label.length -1
    }
    
    // 横
    ctx.fillRect(keisenMargine, n.y, graphwidth, 1);
    ctx.fillStyle = "red";
    ctx.font = "12px sans-serif";
    ctx.textBaseline  = "bottom";
    ctx.fillText(`${convertLabel(data.label[selectedBar])}`, n.x, keisenMargine-24);
    ctx.fillText(`${data.value[selectedBar].toLocaleString()}${data.unit}`, n.x, keisenMargine-10);
}

function convertLabel(label:string) {
    return `${label.split("/")[0]}年${label.split("/")[1]}月`
}
