import Bar from "./Bar";

export class BarGroup {
    BarGroupWidth: number;
    BarGroupLabel: string;
    Bars: Bar[];

    constructor() {
        this.BarGroupWidth = 0;
        this.BarGroupLabel = "";
        this.Bars = [];
    }
}

export default BarGroup;
