import { convertCompilerOptionsFromJson } from "typescript";

const data: graphData = {
    "label": [
        "2018/4-6",
        "2018/7-9",
        "2018/10-12",
        "2019/1-3",
        "2019/4-6",
        "2019/7-9",
        "2019/10-12",
        "2020/1-3"
    ],
    "value": [
        14.20,
        13.69,
        10.53,
        5.07,
        15.32,
        11.05,
        7.98,
        11.97
    ]
};

const color = {
    grid: "#ccc",
    border: "#000",
}

export interface canvasStr {
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D | null
}

export interface graphData {
    label: string[]
    value: number[]
}

let canvases = []
let contexts = []
let width = 0, height = 0, keisenMargine = 50
let _chartContainer = document.getElementById("graph");

let grid: canvasStr = {
    canvas: document.createElement("canvas"),
    context: null
}
grid.context = grid.canvas.getContext("2d")
canvases.push(grid.canvas)
contexts.push(grid.context)
canvases.forEach(function (t) {
    _chartContainer?.appendChild(t)
})

initial(_chartContainer);

function initial(container: HTMLElement | null) {
    if (container == undefined) {
        return;
    }
    width = container.clientWidth;
    height = container.clientHeight;
    console.log(height);
    grid.canvas.width = width;
    grid.canvas.height = height;

    drawKeisen(grid.context, grid.canvas)
    drawBar(data, grid.context, grid.canvas)
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
    const width = can.width - keisenMargine * 2;
    const height = can.height - keisenMargine * 2;

    const barhMargine = 10;
    const barWidth = Math.round(width / count) - barhMargine;
    const barLabel = can.height - keisenMargine + 20;

    const aryMax = function (a: number, b: number) { return Math.max(a, b); }
    const maxPrice = Math.ceil(data.value.reduce(aryMax));

    ctx.fillStyle = "#0063B1";
    ctx.font = "12px sans-serif";
    ctx.fillText(maxPrice.toString(), keisenMargine - 20, keisenMargine + 10)
    ctx.fillText(" 0", keisenMargine - 20, can.height - keisenMargine)
    for (let i = 0; i < 10; i++) {
        drawMemori(ctx, keisenMargine, keisenMargine + height / 10 * i, width)
    }

    for (let b = 0; b < count; b++) {
        ctx.fillStyle = "red";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(data.label[b], keisenMargine * 1.5 + barhMargine + (barWidth + barhMargine) * b, barLabel)

        ctx.fillStyle = "#0063B1";
        ctx.fillRect(keisenMargine + barhMargine + (barWidth + barhMargine) * b, can.height - keisenMargine - 1, barWidth, -height * data.value[b] / maxPrice)
    }


}
