import Bar from "./Bar";
import BarGroup from "./BarGroup";
import { GraphData, GraphDataSet } from "./GraphData";

export class BarSet {

    BarMagine: number = 10;
    BarMaxWidth = 30;
    BarWidth: number = 30;
    Bars: Bar[];
    BarGroups: BarGroup[] = [];
    GraphData: GraphDataSet;

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
        this.BarGroups = []
    }
    public generateBarData(positive: number, negative: number, scaleY: number[], left: number, xAxis: number) {
        let group_year: string = "";
        for (let i = 0; i < this.GraphData.value.length; i++) {
            const coordinateX = left + (this.BarWidth + this.BarMagine) * i
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

            let current_year = this.GraphData.label[i].split("/")[0]
            if (group_year != current_year) {
                if (group_year != "") {
                    this.BarGroups[this.BarGroups.length - 1].BarGroupEndCoordinateX = coordinateX - this.BarMagine / 2
                }
                group_year = current_year;
                const barGroup = new BarGroup(group_year, coordinateX - this.BarMagine / 2);
                this.BarGroups.push(barGroup)
            }
        }
        this.BarGroups[this.BarGroups.length - 1].BarGroupEndCoordinateX = this.Bars[this.Bars.length - 1].BarCoordinateX + this.BarWidth + this.BarMagine / 2
    }

    public get LastBarStartCoordinateX() {
        return this.Bars[this.Bars.length - 1].BarCoordinateX
    }

}

export default BarSet;
