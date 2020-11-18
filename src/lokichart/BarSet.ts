import Bar from "./Bar";
import BarGroup from "./BarGroup";
import { GraphData, GraphDataSet } from "./GraphData";

export class BarSet {

    BarLabelCoordinateY: number = 0;
    BarGroupLavelCoordinateY: number = 0;

    BarMagine: number = 10;
    BarMaxWidth = 30;
    BarWidth: number = 30;
    BarGroups: BarGroup[] = [];
    GraphData: GraphDataSet;

    Bars: Bar[];

    constructor(data: GraphData, GraphWdith: number, target: string) {

        this.GraphData = new GraphDataSet();
        data.dataset.forEach((s) => {
            if (s.key == target) {
                this.GraphData = s;
            }
        });

        // グラフの幅をデータ数で割って、Bar間の距離を引けば、棒の幅を算出できる
        // 棒の幅の最大値はBarMaxWidthまで。

        if (Math.round(GraphWdith / this.GraphData.value.length) - this.BarMagine < this.BarMaxWidth) {
            this.BarWidth = Math.round(GraphWdith / this.GraphData.value.length) - this.BarMagine
        } else {
            this.BarMagine = Math.round(GraphWdith / this.GraphData.value.length) - this.BarWidth
        }

        this.Bars = [];
    }
    public generateBarData(positive: number, negative: number, scaleY: number[], left: number, xAxis: number) {
        for (let i = 0; i < this.GraphData.value.length; i++) {

            const coordinateX = left + this.BarMagine + (this.BarWidth + this.BarMagine) * i
            let graphHeight, barNumberCoordinateY
            if (this.GraphData.value[i] >= 0) {
                graphHeight = -(positive * this.GraphData.value[i]) / scaleY[scaleY.length - 1]
                barNumberCoordinateY = xAxis + graphHeight - 8
            } else {
                graphHeight = (negative * this.GraphData.value[i]) / scaleY[0]
                barNumberCoordinateY = xAxis + graphHeight + 15
            }
            const bar = new Bar(this.GraphData.value[i], this.GraphData.label[i], coordinateX, graphHeight, barNumberCoordinateY)
            this.Bars.push(bar)
        }


    }

}

export default BarSet;
