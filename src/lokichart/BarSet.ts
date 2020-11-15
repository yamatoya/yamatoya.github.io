import BarGroup from "./BarGroup";

export class BarSet {
    BarLabelCoordinateY: number = 0;
    BarGroupLavelCoordinateY: number = 0;
    BarMagine: number = 10;
    BarMaxWidth = 30;
    BarWidth: number;
    BarGroups: BarGroup[] = [];

    constructor(DataLength: number, GraphWdith: number) {
        // グラフの幅をデータ数で割って、Bar間の距離を引けば、棒の幅を算出できる
        // 棒の幅の最大値はBarMaxWidthまで。
        this.BarWidth =
            Math.round(GraphWdith / DataLength) - this.BarMagine >
            this.BarMaxWidth
                ? this.BarMaxWidth
                : Math.round(GraphWdith / DataLength) - this.BarMagine;
    }
}

export default BarSet;
