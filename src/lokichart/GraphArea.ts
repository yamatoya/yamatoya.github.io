import BarSet from "./BarSet";
import { GraphData, GraphDataSet } from "./GraphData";

export class GrapArea {
    OriginalData: GraphData;
    GraphData: GraphDataSet;

    Content: HTMLElement;
    Height: number;
    Width: number;
    Target: string;

    LeftMagine = 50;
    RightMagine = 50;
    TopMagine = 50;
    LowerMagine = 50;
    GraphStartCoordinateX = 50;
    GraphExndCoordinateX = 50;

    GraphHeight = 0;
    GraphWidth = 0;
    GraphXAxisCoordinateY = 0;
    NegativeGraphHeight = 0;
    PositiveGraphHeight = 0;

    BarLabelCoordinateY = 0;
    BarGroupLavelCoordinateY = 0;

    ScaleY: number[] = [];
    BarSet: BarSet;

    constructor(content: HTMLElement, data: GraphData, target: string) {
        this.OriginalData = data;

        this.Content = content;
        this.Height = content.clientHeight;
        this.Width = content.clientWidth;
        this.Target = target;

        this.GraphData = new GraphDataSet();
        data.dataset.forEach((s) => {
            if (s.key == target) {
                this.GraphData = s;
            }
        });

        const tick = 10;
        this.ScaleY = this.makeYaxis(this.MiniValue, this.MaxValue, tick);
        this.BarSet = new BarSet(
            this.OriginalData,
            this.GraphWidth,
            this.Target
        );
        this.load();
    }
    public load(): void {
        this.LeftMagine = (this.Width * 5) / 100;
        this.RightMagine = (this.Width * 5) / 100;
        this.TopMagine = (this.Width * 5) / 100;
        this.LowerMagine = (this.Width * 5) / 100;

        this.GraphStartCoordinateX = this.LeftMagine;
        this.GraphExndCoordinateX = this.Width - this.RightMagine;
        this.GraphHeight = this.Height - this.TopMagine - this.LowerMagine;
        this.GraphWidth = this.Width - this.LeftMagine - this.RightMagine;
        this.BarSet = new BarSet(
            this.OriginalData,
            this.GraphWidth,
            this.Target
        );
        this.GraphExndCoordinateX = this.Width - this.RightMagine;
        this.GraphHeight = this.Height - this.TopMagine - this.LowerMagine;
        this.GraphWidth = this.Width - this.LeftMagine - this.RightMagine;
        this.GraphXAxisCoordinateY = this.Height - this.LowerMagine;
        for (let i = 0; i < this.ScaleY.length; i++) {
            if (this.ScaleY[this.ScaleY.length - i - 1] == 0) {
                this.GraphXAxisCoordinateY =
                    this.TopMagine +
                    Math.ceil(
                        (this.GraphHeight * (i + 1)) / this.ScaleY.length
                    );
            }
        }
        this.BarLabelCoordinateY = this.GraphXAxisCoordinateY + 12;
        this.BarGroupLavelCoordinateY = this.BarLabelCoordinateY + 20;
        this.PositiveGraphHeight = this.GraphXAxisCoordinateY - this.TopMagine;
        this.NegativeGraphHeight =
            this.GraphHeight - this.GraphXAxisCoordinateY;
        this.BarSet = new BarSet(
            this.OriginalData,
            this.GraphWidth,
            this.Target
        );
        this.BarSet.generateBarData(
            this.PositiveGraphHeight,
            this.NegativeGraphHeight,
            this.ScaleY,
            this.LeftMagine,
            this.GraphXAxisCoordinateY
        );
    }

    public get MiniValue(): number {
        const aryMin = (a: number, b: number): number => {
            return Math.min(a, b);
        };
        const minPrice = Math.ceil(this.GraphData.value.reduce(aryMin));
        return minPrice;
    }

    public get MaxValue(): number {
        const aryMax = (a: number, b: number): number => {
            return Math.max(a, b);
        };
        const maxPrice = Math.ceil(this.GraphData.value.reduce(aryMax));
        return maxPrice;
    }

    /**
     * Yの補助線目盛りを生成する
     */
    private makeYaxis(yMin: number, yMax: number, ticks = 10): number[] {
        const result = [];
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
        const tmepStep = range / ticks;
        const mag = Math.floor(Math.log10(tmepStep));
        const magPow = Math.pow(10, mag);
        const magMsd = Math.floor(tmepStep / magPow + 0.5);
        const stepSize = magMsd * magPow;
        const lb = stepSize * Math.floor(yMin / stepSize);
        const ub = stepSize * Math.ceil(yMax / stepSize);

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
}
export default GrapArea;
