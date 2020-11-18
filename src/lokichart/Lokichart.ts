import GraphArea from "./GraphArea"
import { ChartCfg } from "./ChartCfg";


const color = {
    grid: "#ccc",
    border: "#000",
};

export interface InLayer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
}

export class Lokichart {
    private GraphArea: GraphArea;

    private GraphXAxisCoordinateY: number;

    keisenMargine = 50;
    barBoxWidth = 0;
    rightMargin = 0;

    readonly maxGraphWidth = 30;

    private canvases: HTMLCanvasElement[];
    private yearLabel: string = "";
    private barLabelHeight: number = 0;
    private Term = {
        Monthly: "m",
        Quorter: "q",
    } as const;

    chart: InLayer;
    overlay: InLayer;
    grid: InLayer;

    constructor(props: ChartCfg) {
        const {
            container,
            originalData,
            targetKey,
            LeftGraphAreaMagine = 50,
            RightGraphAreaMagine = 50,
            TopGraphAreaMagine = 50,
            LowerGraphAreaMagine = 50,
        } = props;

        this.GraphArea = new GraphArea(container, TopGraphAreaMagine, RightGraphAreaMagine, LowerGraphAreaMagine, LeftGraphAreaMagine, originalData, targetKey);

        this.GraphXAxisCoordinateY = 0;
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
            this.GraphArea.Content?.appendChild(t);
        });

        this.initial();

        this.overlay.canvas.addEventListener("mousemove", (e) => {
            this.drow(e, this.grid.context);
        });
    }

    initial() {
        this.chart.canvas.width = this.GraphArea.Width;
        this.chart.canvas.height = this.GraphArea.Height;
        this.grid.canvas.width = this.GraphArea.Width;
        this.grid.canvas.height = this.GraphArea.Height;
        this.overlay.canvas.width = this.GraphArea.Width;
        this.overlay.canvas.height = this.GraphArea.Height;

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
        const BarCount = this.GraphArea.BarSet.Bars.length

        this.barBoxWidth =
            Math.round(this.GraphArea.GraphWidth / BarCount) - this.GraphArea.BarSet.BarMagine;
        this.rightMargin =
            this.GraphArea.Width -
            (this.keisenMargine +
                (this.barBoxWidth + this.GraphArea.BarSet.BarMagine) * BarCount -
                this.barBoxWidth);
        this.barLabelHeight = can.height - this.keisenMargine + 20;

        // Y=0の罫線
        this.drawGentenKeisen(ctx, this.GraphArea.GraphXAxisCoordinateY);

        for (let b = 0; b < BarCount; b++) {
            if (this.overlay.context == null) {
                return;
            }
            this.overlay.context.fillStyle = "red";
            this.overlay.context.font = "12px sans-serif";
            this.overlay.context.textAlign = "left";

            // Xのラベル描画
            this.writeLabelX(b);

            // グラフのバー描画
            this.writeGraphBar(ctx, b);

            // データ量
            this.writeDataAmount(b);
        }
    }

    // X軸のラベル描画
    private writeLabelX(plot: number) {
        let result = "";

        // 月データのラベル
        if (this.isTermMonthly(this.GraphArea.GraphData.term)) {
            let label = this.GraphArea.GraphData.label[plot].split("/");
            if (this.yearLabel != label[0] || this.yearLabel == "") {
                this.yearLabel = label[0];
                this.writeLabelXYear(plot, `${label[0]}年`);
            }
            this.writeLabelXEach(plot, `${label[1]}月`);
        } else if (this.isTermQuorter(this.GraphArea.GraphData.term)) {
            let label = this.GraphArea.GraphData.label[plot].split("/");

            if (this.yearLabel != label[0] || this.yearLabel == "") {
                this.yearLabel = label[0];
                this.writeLabelXYear(plot, `${label[0]}年`);
            }
            this.writeLabelXEach(plot, `${label[1]}`);
        }
    }

    private isTermMonthly(term: string) {
        return term == this.Term.Monthly;
    }

    private isTermQuorter(term: string) {
        return (term = this.Term.Quorter);
    }

    /**
     * X軸のラベルで一行目に描画する
     * @param plot
     * @param result
     */
    private writeLabelXEach(plot: number, result: string) {
        if (this.overlay.context == null) {
            return;
        }
        // x軸のlabel表示
        this.overlay.context.fillText(result, this.GraphArea.BarSet.Bars[plot].BarCoordinateX, this.barLabelHeight);
    }

    /**
     * X軸のラベルで二行目に描画する
     * @param plot
     * @param result
     */
    private writeLabelXYear(plot: number, result: string) {
        if (this.overlay.context == null) {
            return;
        }
        // x軸のlabel表示
        this.overlay.context.fillText(
            result,
            this.keisenMargine +
            this.GraphArea.BarSet.BarMagine * 1.5 +
            (this.barBoxWidth + this.GraphArea.BarSet.BarMagine) * plot,
            this.barLabelHeight + 14
        );

        let separetaYearWidth =
            this.keisenMargine +
            this.GraphArea.BarSet.BarMagine +
            (this.barBoxWidth + this.GraphArea.BarSet.BarMagine) * plot -
            this.GraphArea.BarSet.BarMagine * 0.5;

        if (this.grid.context == null) {
            return;
        }
        this.overlay.context.strokeStyle = color.grid;
        this.overlay.context.strokeStyle = color.border;
        this.overlay.context.beginPath();
        this.overlay.context.moveTo(separetaYearWidth, this.GraphArea.GraphXAxisCoordinateY - 10);
        this.overlay.context.lineTo(separetaYearWidth, this.GraphArea.GraphXAxisCoordinateY - 10);
        this.overlay.context.lineTo(separetaYearWidth, this.GraphArea.GraphXAxisCoordinateY + 10);
        this.overlay.context.stroke();
        console.log(`sepa:${separetaYearWidth}/min:${this.GraphArea.GraphXAxisCoordinateY}`);
    }

    /**
     * 各データのグラフバーを描画する
     * @param ctx
     * @param plot
     */
    private writeGraphBar(ctx: CanvasRenderingContext2D, plot: number) {

        ctx.fillStyle = "#81C784";
        let BarCoordinateY
        if (this.GraphArea.BarSet.Bars[plot].BarHeight > 0) {
            BarCoordinateY = this.GraphArea.GraphXAxisCoordinateY + 1
        } else {
            BarCoordinateY = this.GraphArea.GraphXAxisCoordinateY - 1
        }
        ctx.fillRect(this.GraphArea.BarSet.Bars[plot].BarCoordinateX, BarCoordinateY, this.GraphArea.BarSet.BarWidth, this.GraphArea.BarSet.Bars[plot].BarHeight)
    }

    /**
     * 実データをグラフの上に描画する
     * @param plot
     */
    private writeDataAmount(plot: number) {
        if (this.overlay.context == null) {
            return;
        }
        this.overlay.context.fillText(
            this.GraphArea.BarSet.Bars[plot].BarNumber.toLocaleString(),
            this.GraphArea.BarSet.Bars[plot].BarCoordinateX,
            this.GraphArea.BarSet.Bars[plot].BarNumberCoordinateY
        );
    }

    // 原点の罫線を描画する
    drawGentenKeisen(ctx: CanvasRenderingContext2D | null, y: number) {
        if (ctx == null) {
            return;
        }
        ctx.strokeStyle = color.grid;
        ctx.strokeStyle = color.border;
        ctx.beginPath();
        ctx.moveTo(this.GraphArea.GraphStartCoordinateX, y);
        ctx.lineTo(this.GraphArea.GraphStartCoordinateX, y);
        ctx.lineTo(this.GraphArea.GraphExndCoordinateX, y);
        ctx.stroke();
    }


    private n = {
        x: 10,
        y: 10,
    };

    /**
     * マウスカーソルがあるグラフをハイライトし、横の高さを示す補助線を引く
     * @param e マウスカーソルイベント
     * @param ctx Canvas
     */
    drow(e: MouseEvent, ctx: CanvasRenderingContext2D | null) {
        if (ctx == null) {
            return;
        }
        ctx.clearRect(0, 0, this.GraphArea.Width, this.GraphArea.Height);

        // マウスのカーソル位置をX軸方向でグラフにスナップさせる
        if (e.offsetX <= this.keisenMargine + this.GraphArea.BarSet.BarMagine) {
            this.n.x = this.keisenMargine + this.GraphArea.BarSet.BarMagine;
        } else if (e.offsetX >= this.GraphArea.Width - this.rightMargin) {
            this.n.x = this.GraphArea.Width - this.rightMargin;
        } else {
            this.n.x =
                Math.floor(
                    (e.offsetX - this.keisenMargine) /
                    (this.barBoxWidth + this.GraphArea.BarSet.BarMagine)
                ) *
                (this.barBoxWidth + this.GraphArea.BarSet.BarMagine) +
                (this.keisenMargine + this.GraphArea.BarSet.BarMagine);
        }

        // 縦の線をグラフの領域内に収める
        if (e.offsetY < this.keisenMargine) {
            this.n.y = this.keisenMargine;
        } else if (e.offsetY > this.GraphArea.Height - this.keisenMargine) {
            this.n.y = this.GraphArea.Height - this.keisenMargine;
        } else {
            this.n.y = e.offsetY;
        }

        ctx.fillStyle = "#ccc";

        // // カーソルがある場所に縦の線を引く
        ctx.fillRect(
            this.n.x,
            this.keisenMargine,
            this.GraphArea.BarSet.BarWidth,
            this.GraphArea.GraphHeight
        );

        let selectedBar = Math.floor(
            (e.offsetX - this.keisenMargine) /
            (this.barBoxWidth + this.GraphArea.BarSet.BarMagine)
        );
        if (selectedBar < 0) {
            selectedBar = 0;
        } else if (selectedBar > this.GraphArea.GraphData.label.length - 1) {
            selectedBar = this.GraphArea.GraphData.label.length - 1;
        }

        // カーソルがある場所に横の線を引く
        ctx.fillRect(this.keisenMargine, this.n.y, this.GraphArea.Width, 1);
        ctx.fillStyle = "red";
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "bottom";

        // 選択したグラフの値と時期を描画する
        ctx.fillText(
            `${this.convertLabel(this.GraphArea.GraphData.label[selectedBar])}`,
            this.n.x,
            this.keisenMargine - 24
        );
        ctx.fillText(
            `${this.GraphArea.GraphData.value[selectedBar].toLocaleString()}${this.GraphArea.GraphData.unit
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