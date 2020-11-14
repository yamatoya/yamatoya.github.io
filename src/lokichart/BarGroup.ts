import Bar from "./Bar";

export class BarGroup {
    BarGroupWidth: number;
    BarGroupLabel: string;
    BarLabelCoordinateY: number;
    BarGroupLavelCoordinateY: number;
    BarMaginr: number;
    Bars: Bar[];

    constructor() {
        this.BarGroupWidth = 0;
        this.BarGroupLabel = "";
        this.BarLabelCoordinateY = 0;
        this.BarGroupLavelCoordinateY = 0;
        this.BarMaginr = 0;
        this.Bars = [];
    }
}
