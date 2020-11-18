export class Bar {
    public readonly BarHeight: number;
    public readonly BarCoordinateX: number;
    public readonly BarNumberCoordinateY: number;
    public readonly BarNumber: number;
    public readonly BarLabel: string;

    constructor(barNumber: number, barLabel: string, coordinateX: number, height: number, barNumberCoordinateY: number) {
        this.BarHeight = height;
        this.BarNumberCoordinateY = barNumberCoordinateY;
        this.BarNumber = barNumber;
        this.BarLabel = barLabel;
        this.BarCoordinateX = coordinateX
    }
}

export default Bar;
