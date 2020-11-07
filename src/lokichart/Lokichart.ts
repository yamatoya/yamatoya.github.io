import { convertCompilerOptionsFromJson } from "typescript";

const data: graphData = {
    label: [
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
        "2020/05",
    ],
    value: [
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
        2845,
    ],
    unit: "億円",
    name: "営業収益",
};

const color = {
    grid: "#ccc",
    border: "#000",
};

export interface InLayer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
}

export interface graphData {
    label: string[];
    value: number[];
    unit: string;
    name: string;
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

    chart: InLayer;
    overlay: InLayer;
    grid: InLayer;

    constructor(container: HTMLElement) {
        //this._chartContainer = document.getElementById("graph");
        this._chartContainer = container;
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
        console.log(this.height);
        this.chart.canvas.width = this.width;
        this.chart.canvas.height = this.height;
        this.grid.canvas.width = this.width;
        this.grid.canvas.height = this.height;
        this.overlay.canvas.width = this.width;
        this.overlay.canvas.height = this.height;

        this.graphwidth = this.width - this.keisenMargine * 2;
        this.graphHeight = this.height - this.keisenMargine * 2;
        this.drawKeisen(this.chart.context, this.chart.canvas);
        this.drawBar(data, this.chart.context, this.chart.canvas);
    }

    drawKeisen(ctx: CanvasRenderingContext2D | null, can: HTMLCanvasElement) {
        if (ctx == null) {
            return;
        }
        ctx.fillStyle = color.border;
        ctx.strokeStyle = color.border;
        ctx.beginPath();
        ctx.moveTo(this.keisenMargine, this.keisenMargine);
        ctx.lineTo(this.keisenMargine, this.keisenMargine);
        ctx.lineTo(this.keisenMargine, can.height - this.keisenMargine);
        ctx.lineTo(
            can.width - this.keisenMargine + 3,
            can.height - this.keisenMargine
        );
        ctx.stroke();
    }

    drawMemori(
        ctx: CanvasRenderingContext2D | null,
        x: number,
        y: number,
        width: number
    ) {
        if (ctx == null) {
            return;
        }
        ctx.fillStyle = color.border;
        ctx.strokeStyle = color.grid;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();
    }

    drawBar(
        data: graphData,
        ctx: CanvasRenderingContext2D | null,
        can: HTMLCanvasElement
    ) {
        if (ctx == null) {
            return;
        }
        const count = data.label.length;

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
        const maxPrice = Math.ceil(data.value.reduce(aryMax));

        ctx.fillStyle = "#0063B1";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "end";
        ctx.fillText(
            maxPrice.toString(),
            this.keisenMargine - 2,
            this.keisenMargine + 10
        );
        ctx.fillText(
            " 0",
            this.keisenMargine - 2,
            can.height - this.keisenMargine
        );

        const memoriCount = Math.floor(maxPrice / Math.ceil(maxPrice / 10));
        for (let i = 0; i < memoriCount; i++) {
            this.drawMemori(
                ctx,
                this.keisenMargine,
                this.keisenMargine +
                    Math.ceil(this.graphHeight / memoriCount) * i,
                this.graphwidth
            );
        }

        for (let b = 0; b < count; b++) {
            ctx.fillStyle = "red";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            // x軸のlabel表示
            ctx.fillText(
                data.label[b],
                this.keisenMargine +
                    this.barhMargine * 1.5 +
                    (this.barWidth + this.barhMargine) * b,
                barLabel
            );

            ctx.fillStyle = "#0063B1";
            ctx.fillRect(
                this.keisenMargine +
                    this.barhMargine +
                    (this.barWidth + this.barhMargine) * b,
                can.height - this.keisenMargine - 1,
                this.barWidth,
                (-this.graphHeight * data.value[b]) / maxPrice
            );
        }
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
        console.log(this.width - this.rightMargin);

        if (e.offsetY < this.keisenMargine) {
            this.n.y = this.keisenMargine;
        } else if (e.offsetY > this.height - this.keisenMargine) {
            this.n.y = this.height - this.keisenMargine;
        } else {
            this.n.y = e.offsetY;
        }

        ctx.fillStyle = "#e9546b";

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
        } else if (selectedBar > data.label.length - 1) {
            selectedBar = data.label.length - 1;
        }

        // 横
        ctx.fillRect(this.keisenMargine, this.n.y, this.graphwidth, 1);
        ctx.fillStyle = "red";
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "bottom";
        ctx.fillText(
            `${this.convertLabel(data.label[selectedBar])}`,
            this.n.x,
            this.keisenMargine - 24
        );
        ctx.fillText(
            `${data.value[selectedBar].toLocaleString()}${data.unit}`,
            this.n.x,
            this.keisenMargine - 10
        );
    }

    convertLabel(label: string) {
        return `${label.split("/")[0]}年${label.split("/")[1]}月`;
    }
}

export default Lokichart;
