import BarSet from "./BarSet";
import { GraphData, GraphDataSet } from "./GraphData"

export class GrapArea {

    OriginalData: GraphData
    GraphData: GraphDataSet;

    Content: HTMLElement
    Height: number;
    Width: number;

    LeftMagine: number;
    RightMagine: number;
    TopMagine: number;
    LowerMagine: number;
    GraphStartCoordinateX: number;
    GraphExndCoordinateX: number;

    GraphHeight: number
    GraphWidth: number
    GraphXAxisCoordinateY: number = 0
    NegativeGraphHeight: number = 0
    PositiveGraphHeight: number = 0

    ScaleY: number[] = [];
    BarSet: BarSet

    constructor(content: HTMLElement, top: number, right: number, lower: number, left: number, data: GraphData, target: string) {
        this.OriginalData = data

        this.Content = content;
        this.Height = content.clientHeight;
        this.Width = content.clientWidth;

        this.LeftMagine = left;
        this.RightMagine = right;
        this.TopMagine = top;
        this.LowerMagine = lower;
        this.GraphStartCoordinateX = this.LeftMagine;
        this.GraphExndCoordinateX = this.Width - this.RightMagine;
        this.GraphHeight = this.Height - this.TopMagine - this.LowerMagine;
        this.GraphWidth = this.Width - this.LeftMagine - this.RightMagine;

        this.GraphData = new GraphDataSet();
        data.dataset.forEach((s) => {
            if (s.key == target) {
                this.GraphData = s;
            }
        });

        const tick = 10;
        this.ScaleY = this.makeYaxis(this.MiniValue, this.MaxValue, tick);
        console.log(this.ScaleY)

        this.GraphXAxisCoordinateY = this.Height - this.LowerMagine
        for (let i = 0; i < this.ScaleY.length; i++) {
            if (this.ScaleY[this.ScaleY.length - i - 1] == 0) {
                this.GraphXAxisCoordinateY = this.TopMagine + Math.ceil((this.GraphHeight * (i + 1)) / this.ScaleY.length);
            }
        }
        this.PositiveGraphHeight = this.GraphXAxisCoordinateY - this.TopMagine
        this.NegativeGraphHeight = this.GraphHeight - this.GraphXAxisCoordinateY
        this.BarSet = new BarSet(this.OriginalData, this.GraphWidth, target)
        this.BarSet.generateBarData(this.PositiveGraphHeight, this.NegativeGraphHeight, this.ScaleY, this.LeftMagine, this.GraphXAxisCoordinateY);
    }

    public get MiniValue() {
        const aryMin = (a: number, b: number) => {
            return Math.min(a, b);
        };
        const minPrice = Math.ceil(this.GraphData.value.reduce(aryMin));
        return minPrice
    }

    public get MaxValue() {
        const aryMax = (a: number, b: number) => {
            return Math.max(a, b);
        };
        const maxPrice = Math.ceil(this.GraphData.value.reduce(aryMax));
        return maxPrice
    }

    /**
     * Yの補助線目盛りを生成する
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
}
export default GrapArea
