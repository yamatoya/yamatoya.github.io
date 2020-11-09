import graphData from "./graphData";

const color = {
    grid: "#ccc",
    border: "#000",
};

export interface InLayer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
}

export class Lokichart {
    barhMargine = 10;
    width = 0;
    height = 0;
    keisenMargine = 50;
    barWidth = 0;
    graphwidth = 0;
    graphHeight = 0;
    rightMargin = 0;

    private canvases: HTMLCanvasElement[];
    private _chartContainer: HTMLElement;
    private graphData: graphData;

    chart: InLayer;
    overlay: InLayer;
    grid: InLayer;

    constructor(container: HTMLElement, originalData: graphData) {
        //this._chartContainer = document.getElementById("graph");
        this._chartContainer = container;
        this.graphData = originalData;
        this.canvases = [];

        this.overlay = {
            canvas: document.createElement("canvas"),
            context: null,
        };
        this.chart = {
            canvas: document.createElement("canvas"),
            context: null,
        };
        this.grid = {
            canvas: document.createElement("canvas"),
            context: null,
        };
        this._create();
    }

    private _create() {
        this.overlay.context = this.overlay.canvas.getContext("2d");
        this.canvases.push(this.overlay.canvas);

        this.chart.context = this.chart.canvas.getContext("2d");
        this.canvases.push(this.chart.canvas);

        this.grid.context = this.grid.canvas.getContext("2d");
        this.canvases.push(this.grid.canvas);

        this.canvases.reverse();

        this.canvases.forEach((t) => {
            this._chartContainer?.appendChild(t);
        });

        this.initial(this._chartContainer);

        this.overlay.canvas.addEventListener("mousemove", (e) => {
            this.drow(e, this.grid.context);
        });
    }

    initial(container: HTMLElement | null) {
        if (container == undefined) {
            return;
        }
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.chart.canvas.width = this.width;
        this.chart.canvas.height = this.height;
        this.grid.canvas.width = this.width;
        this.grid.canvas.height = this.height;
        this.overlay.canvas.width = this.width;
        this.overlay.canvas.height = this.height;

        this.graphwidth = this.width - this.keisenMargine * 2;
        this.graphHeight = this.height - this.keisenMargine * 2;
        this.drawBar(this.chart.context, this.chart.canvas);
    }

    /// Y軸の目盛りを描写する
    writeYAxis(
        ctx: CanvasRenderingContext2D | null,
        x: number,
        y: number,
        Yxis: number
    ) {
        if (ctx == null) {
            return;
        }
        ctx.fillStyle = "#0063B1";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "end";

        ctx.fillText(Yxis.toString(), x, y);
    }

    /// グラフのバーを引く
    drawBar(ctx: CanvasRenderingContext2D | null, can: HTMLCanvasElement) {
        if (ctx == null) {
            return;
        }
        const count = this.graphData.label.length;

        this.barWidth = Math.round(this.graphwidth / count) - this.barhMargine;
        this.rightMargin =
            this.width -
            (this.keisenMargine +
                (this.barWidth + this.barhMargine) * count -
                this.barWidth);
        const barLabel = can.height - this.keisenMargine + 20;

        const aryMax = (a: number, b: number) => {
            return Math.max(a, b);
        };

        const aryMin = (a: number, b: number) => {
            return Math.min(a, b);
        };

        const maxPrice = Math.ceil(this.graphData.value.reduce(aryMax));
        const minPrice = Math.ceil(this.graphData.value.reduce(aryMin));
        const tick = 10;
        const scale = this.makeYaxis(minPrice, maxPrice, tick);
        console.log(scale);
        let gentenHeight = can.height - this.keisenMargine;
        let minGraphHeight = 0;

        for (let i = 0; i < scale.length; i++) {
            if (scale[scale.length - i - 1] == 0) {
                gentenHeight =
                    this.keisenMargine +
                    Math.ceil((this.graphHeight * (i + 1)) / scale.length);
            }
            console.log(
                `genten:${gentenHeight} low:${can.height - this.keisenMargine}`
            );

            // Y軸の補助線
            this.drawGentenKeisen(
                ctx,
                this.keisenMargine,
                gentenHeight,
                this.graphwidth
            );
            minGraphHeight =
                this.keisenMargine +
                Math.ceil(this.graphHeight / scale.length) * i;
        }

        const positiveGraphHeight = gentenHeight - this.keisenMargine;
        const negativeGraphHeight = minGraphHeight - gentenHeight;

        for (let b = 0; b < count; b++) {
            if (this.overlay.context == null) {
                return;
            }
            this.overlay.context.fillStyle = "red";
            this.overlay.context.font = "12px sans-serif";
            this.overlay.context.textAlign = "left";
            // x軸のlabel表示
            this.overlay.context.fillText(
                this.getXlabel(b),
                this.keisenMargine +
                    this.barhMargine * 1.5 +
                    (this.barWidth + this.barhMargine) * b,
                barLabel
            );

            // グラフのバー描画
            ctx.fillStyle = "#81C784";
            ctx.fillRect(
                this.keisenMargine +
                    this.barhMargine +
                    (this.barWidth + this.barhMargine) * b,
                this.graphData.value[b] >= 0
                    ? gentenHeight - 1
                    : gentenHeight + 1,
                this.barWidth,
                this.graphData.value[b] >= 0
                    ? -(positiveGraphHeight * this.graphData.value[b]) /
                          scale[scale.length - 1]
                    : (negativeGraphHeight * this.graphData.value[b]) / scale[0]
            );

            // データ量
            this.overlay.context.fillText(
                this.graphData.value[b].toLocaleString(),
                this.keisenMargine +
                    this.barhMargine * 1.5 +
                    (this.barWidth + this.barhMargine) * b,
                this.graphData.value[b] >= 0
                    ? gentenHeight -
                          (positiveGraphHeight * this.graphData.value[b]) /
                              scale[scale.length - 1] -
                          10
                    : gentenHeight +
                          (negativeGraphHeight * this.graphData.value[b]) /
                              scale[0] +
                          20
            );
        }
    }

    // 横の補助線を引く
    drawGentenKeisen(
        ctx: CanvasRenderingContext2D | null,
        x: number,
        y: number,
        width: number
    ) {
        if (ctx == null) {
            return;
        }
        ctx.strokeStyle = color.grid;
        ctx.strokeStyle = color.border;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();
    }

    private yearLabel: string = "";
    /// X軸のラベル文字列を生成
    private getXlabel(plot: number) {
        let result = "";
        if (this.graphData.term == "m") {
            let label = this.graphData.label[plot].split("/");
            if (this.yearLabel != label[0] || this.yearLabel == "") {
                this.yearLabel = label[0];
                result = `${label[0]}年`;
            } else {
                result = `${label[1]}月`;
            }
        }
        return result;
    }

    private makeYaxis(yMin: number, yMax: number, ticks: number = 10) {
        let result: number[] = [];
        if (yMin == yMax) {
            yMin = yMin - 10;
            yMax = yMax + 10;
        }
        const range = yMax - yMin;
        if (ticks < 2) {
            ticks = 2;
        } else if (ticks > 2) {
            ticks -= 2;
        }
        let tmepStep = range / ticks;
        let mag = Math.floor(Math.log10(tmepStep));
        let magPow = Math.pow(10, mag);
        let magMsd = Math.floor(tmepStep / magPow + 0.5);
        let stepSize = magMsd * magPow;
        let lb = stepSize * Math.floor(yMin / stepSize);
        let ub = stepSize * Math.ceil(yMax / stepSize);

        let val = lb;
        while (1) {
            result.push(val);
            val += stepSize;
            if (val > ub) {
                break;
            }
        }
        return result;
    }

    private n = {
        x: 10,
        y: 10,
    };

    drow(e: MouseEvent, ctx: CanvasRenderingContext2D | null) {
        if (ctx == null) {
            return;
        }
        ctx.clearRect(0, 0, this.width, this.height);

        if (e.offsetX <= this.keisenMargine + this.barhMargine) {
            this.n.x = this.keisenMargine + this.barhMargine;
        } else if (e.offsetX >= this.width - this.rightMargin) {
            this.n.x = this.width - this.rightMargin;
        } else {
            //n.x=e.offsetX
            //  n.x = width - (Math.floor((width - e.offsetX - keisenMargine) / (barWidth + this.barhMargine) + 1) * (barWidth + this.barhMargine)) - keisenMargine + this.barhMargine
            this.n.x =
                Math.floor(
                    (e.offsetX - this.keisenMargine) /
                        (this.barWidth + this.barhMargine)
                ) *
                    (this.barWidth + this.barhMargine) +
                (this.keisenMargine + this.barhMargine);
        }

        if (e.offsetY < this.keisenMargine) {
            this.n.y = this.keisenMargine;
        } else if (e.offsetY > this.height - this.keisenMargine) {
            this.n.y = this.height - this.keisenMargine;
        } else {
            this.n.y = e.offsetY;
        }

        ctx.fillStyle = "#ccc";

        // // カーソルがある場所に縦の線を引く
        ctx.fillRect(
            this.n.x,
            this.keisenMargine,
            this.barWidth,
            this.graphHeight
        );

        let selectedBar = Math.floor(
            (e.offsetX - this.keisenMargine) /
                (this.barWidth + this.barhMargine)
        );
        if (selectedBar < 0) {
            selectedBar = 0;
        } else if (selectedBar > this.graphData.label.length - 1) {
            selectedBar = this.graphData.label.length - 1;
        }

        // 横
        ctx.fillRect(this.keisenMargine, this.n.y, this.graphwidth, 1);
        ctx.fillStyle = "red";
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "bottom";
        ctx.fillText(
            `${this.convertLabel(this.graphData.label[selectedBar])}`,
            this.n.x,
            this.keisenMargine - 24
        );
        ctx.fillText(
            `${this.graphData.value[selectedBar].toLocaleString()}${
                this.graphData.unit
            }`,
            this.n.x,
            this.keisenMargine - 10
        );
    }

    convertLabel(label: string) {
        return `${label.split("/")[0]}年${label.split("/")[1]}月`;
    }
}

export default Lokichart;
