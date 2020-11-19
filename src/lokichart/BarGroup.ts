import Bar from "./Bar";

export class BarGroup {
    public readonly BarGroupStartCoordinateX: number;
    public readonly BarGroupLabel: string;
    BarGroupEndCoordinateX: number

    constructor(year: string, start: number) {
        this.BarGroupStartCoordinateX = start;
        this.BarGroupLabel = year;
        this.BarGroupEndCoordinateX = 0
    }

    public get BarGroupLabelCoordinateX() {
        const width = this.BarGroupEndCoordinateX - this.BarGroupStartCoordinateX
        const centerCoordinateX = this.BarGroupStartCoordinateX + width / 2
        return centerCoordinateX
    }
}

export default BarGroup;
