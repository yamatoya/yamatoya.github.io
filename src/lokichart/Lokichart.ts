import BarSet from "./BarSet";
import { ChartCfg } from "./ChartCfg";
import { GraphDataSet } from "./GraphData";

const color = {
    grid: "#ccc",
    border: "#000",
};

export interface InLayer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
}

export class Lokichart {
    private GraphArea: HTMLElement;
    private GraphAreaHeight: number;
    private GraphAreaWidth: number;

    private LeftGraphAreaMagine: number;
    private RightGraphAreaMagine: number;
    private TopGraphAreaMagine: number;
    private LowerGraphAreaMagine: number;
    private GraphStartCoordinateX: number;
    private GraphExndCoordinateX: number;

    private GraphHeight: number;
    private GraphWidth: number;
    private GraphXAxisCoordinateY: number;

    private BarSet: BarSet;

    keisenMargine = 50;
    barBoxWidth = 0;
    rightMargin = 0;

    readonly maxGraphWidth = 30;

    private canvases: HTMLCanvasElement[];
    private graphData: GraphDataSet;
    private targetKey: string;
    private yearLabel: string = "";
    private positiveGraphHeight: number = 0;
    private negativeGraphHeight: number = 0;
    private gentenHeight: number = 0;
    private scaleY: number[] = [];
    private barLabelHeight: number = 0;
    private minGraphHeight: number = 0;
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

        this.GraphArea = container;
        this.targetKey = targetKey;
        this.graphData = new GraphDataSet();
        originalData.dataset.forEach((s) => {
            if (s.key == this.targetKey) {
                this.graphData = s;
            } else {
                return;
            }
        });

        this.GraphAreaHeight = this.GraphArea.clientHeight;
        this.GraphAreaWidth = this.GraphArea.clientWidth;

        this.LeftGraphAreaMagine = LeftGraphAreaMagine;
        this.RightGraphAreaMagine = RightGraphAreaMagine;
        this.TopGraphAreaMagine = TopGraphAreaMagine;
        this.LowerGraphAreaMagine = LowerGraphAreaMagine;
        this.GraphStartCoordinateX = this.LeftGraphAreaMagine;
        this.GraphExndCoordinateX =
            this.GraphAreaWidth - this.RightGraphAreaMagine;
        this.GraphHeight =
            this.GraphAreaHeight -
            this.TopGraphAreaMagine -
            this.LowerGraphAreaMagine;
        this.GraphWidth =
            this.GraphAreaWidth - LeftGraphAreaMagine - RightGraphAreaMagine;
        this.GraphXAxisCoordinateY = 0;
        this.canvases = [];
        this.BarSet = new BarSet(this.graphData.value.length, this.GraphWidth);

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
            this.GraphArea?.appendChild(t);
        });

        this.initial(this.GraphArea);

        this.overlay.canvas.addEventListener("mousemove", (e) => {
            this.drow(e, this.grid.context);
        });
    }

    initial(container: HTMLElement | null) {
        if (container == undefined) {
            return;
        }

        this.chart.canvas.width = this.GraphAreaWidth;
        this.chart.canvas.height = this.GraphAreaHeight;
        this.grid.canvas.width = this.GraphAreaWidth;
        this.grid.canvas.height = this.GraphAreaHeight;
        this.overlay.canvas.width = this.GraphAreaWidth;
        this.overlay.canvas.height = this.GraphAreaHeight;

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
        const BarCount = this.graphData.label.length;

        this.barBoxWidth =
            Math.round(this.GraphWidth / BarCount) - this.BarSet.BarMagine;
        this.rightMargin =
            this.GraphAreaWidth -
            (this.keisenMargine +
                (this.barBoxWidth + this.BarSet.BarMagine) * BarCount -
                this.barBoxWidth);
        this.barLabelHeight = can.height - this.keisenMargine + 20;

        const aryMax = (a: number, b: number) => {
            return Math.max(a, b);
        };

        const aryMin = (a: number, b: number) => {
            return Math.min(a, b);
        };

        const maxPrice = Math.ceil(this.graphData.value.reduce(aryMax));
        const minPrice = Math.ceil(this.graphData.value.reduce(aryMin));
        const tick = 10;
        this.scaleY = this.makeYaxis(minPrice, maxPrice, tick);
        this.gentenHeight = can.height - this.keisenMargine;

        for (let i = 0; i < this.scaleY.length; i++) {
            if (this.scaleY[this.scaleY.length - i - 1] == 0) {
                this.gentenHeight =
                    this.keisenMargine +
                    Math.ceil(
                        (this.GraphHeight * (i + 1)) / this.scaleY.length
                    );
            }
            this.minGraphHeight =
                this.keisenMargine +
                Math.ceil(this.GraphHeight / this.scaleY.length) * i;
        }

        // Y=0の罫線
        this.drawGentenKeisen(ctx, this.gentenHeight);

        this.positiveGraphHeight = this.gentenHeight - this.keisenMargine;
        this.negativeGraphHeight = this.minGraphHeight - this.gentenHeight;

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
        if (this.isTermMonthly(this.graphData.term)) {
            let label = this.graphData.label[plot].split("/");
            if (this.yearLabel != label[0] || this.yearLabel == "") {
                this.yearLabel = label[0];
                this.writeLabelXYear(plot, `${label[0]}年`);
            }
            this.writeLabelXEach(plot, `${label[1]}月`);
        } else if (this.isTermQuorter(this.graphData.term)) {
            let label = this.graphData.label[plot].split("/");

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
        this.overlay.context.fillText(
            result,
            this.keisenMargine +
                this.BarSet.BarMagine * 1.5 +
                (this.barBoxWidth + this.BarSet.BarMagine) * plot,
            this.barLabelHeight
        );
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
                this.BarSet.BarMagine * 1.5 +
                (this.barBoxWidth + this.BarSet.BarMagine) * plot,
            this.barLabelHeight + 14
        );

        let separetaYearWidth =
            this.keisenMargine +
            this.BarSet.BarMagine +
            (this.barBoxWidth + this.BarSet.BarMagine) * plot -
            this.BarSet.BarMagine * 0.5;

        if (this.grid.context == null) {
            return;
        }
        this.overlay.context.strokeStyle = color.grid;
        this.overlay.context.strokeStyle = color.border;
        this.overlay.context.beginPath();
        this.overlay.context.moveTo(separetaYearWidth, this.gentenHeight - 10);
        this.overlay.context.lineTo(separetaYearWidth, this.gentenHeight - 10);
        this.overlay.context.lineTo(separetaYearWidth, this.gentenHeight + 10);
        this.overlay.context.stroke();
        console.log(`sepa:${separetaYearWidth}/min:${this.gentenHeight}`);
    }

    /**
     * 各データのグラフバーを描画する
     * @param ctx
     * @param plot
     */
    private writeGraphBar(ctx: CanvasRenderingContext2D, plot: number) {
        ctx.fillStyle = "#81C784";
        ctx.fillRect(
            this.keisenMargine +
                this.BarSet.BarMagine +
                (this.barBoxWidth + this.BarSet.BarMagine) * plot,
            this.graphData.value[plot] >= 0
                ? this.gentenHeight - 1
                : this.gentenHeight + 1,
            this.BarSet.BarWidth,
            this.graphData.value[plot] >= 0
                ? -(this.positiveGraphHeight * this.graphData.value[plot]) /
                      this.scaleY[this.scaleY.length - 1]
                : (this.negativeGraphHeight * this.graphData.value[plot]) /
                      this.scaleY[0]
        );
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
            this.graphData.value[plot].toLocaleString(),
            this.keisenMargine +
                this.BarSet.BarMagine +
                (this.barBoxWidth + this.BarSet.BarMagine) * plot,
            this.graphData.value[plot] >= 0
                ? this.gentenHeight -
                      (this.positiveGraphHeight * this.graphData.value[plot]) /
                          this.scaleY[this.scaleY.length - 1] -
                      10
                : this.gentenHeight +
                      (this.negativeGraphHeight * this.graphData.value[plot]) /
                          this.scaleY[0] +
                      20
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
        ctx.moveTo(this.GraphStartCoordinateX, y);
        ctx.lineTo(this.GraphStartCoordinateX, y);
        ctx.lineTo(this.GraphExndCoordinateX, y);
        ctx.stroke();
    }

    /**
     * Yの補助線目盛りを生成する
     * @param yMin
     * @param yMax
     * @param ticks
     */
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

    /**
     * マウスカーソルがあるグラフをハイライトし、横の高さを示す補助線を引く
     * @param e マウスカーソルイベント
     * @param ctx Canvas
     */
    drow(e: MouseEvent, ctx: CanvasRenderingContext2D | null) {
        if (ctx == null) {
            return;
        }
        ctx.clearRect(0, 0, this.GraphAreaWidth, this.GraphAreaHeight);

        // マウスのカーソル位置をX軸方向でグラフにスナップさせる
        if (e.offsetX <= this.keisenMargine + this.BarSet.BarMagine) {
            this.n.x = this.keisenMargine + this.BarSet.BarMagine;
        } else if (e.offsetX >= this.GraphAreaWidth - this.rightMargin) {
            this.n.x = this.GraphAreaWidth - this.rightMargin;
        } else {
            this.n.x =
                Math.floor(
                    (e.offsetX - this.keisenMargine) /
                        (this.barBoxWidth + this.BarSet.BarMagine)
                ) *
                    (this.barBoxWidth + this.BarSet.BarMagine) +
                (this.keisenMargine + this.BarSet.BarMagine);
        }

        // 縦の線をグラフの領域内に収める
        if (e.offsetY < this.keisenMargine) {
            this.n.y = this.keisenMargine;
        } else if (e.offsetY > this.GraphAreaHeight - this.keisenMargine) {
            this.n.y = this.GraphAreaHeight - this.keisenMargine;
        } else {
            this.n.y = e.offsetY;
        }

        ctx.fillStyle = "#ccc";

        // // カーソルがある場所に縦の線を引く
        ctx.fillRect(
            this.n.x,
            this.keisenMargine,
            this.BarSet.BarWidth,
            this.GraphHeight
        );

        let selectedBar = Math.floor(
            (e.offsetX - this.keisenMargine) /
                (this.barBoxWidth + this.BarSet.BarMagine)
        );
        if (selectedBar < 0) {
            selectedBar = 0;
        } else if (selectedBar > this.graphData.label.length - 1) {
            selectedBar = this.graphData.label.length - 1;
        }

        // カーソルがある場所に横の線を引く
        ctx.fillRect(this.keisenMargine, this.n.y, this.GraphAreaWidth, 1);
        ctx.fillStyle = "red";
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "bottom";

        // 選択したグラフの値と時期を描画する
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
