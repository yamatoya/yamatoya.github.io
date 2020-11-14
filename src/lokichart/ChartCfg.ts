import GraphData from "./GraphData";

export interface ChartCfg {
    readonly container: HTMLElement;
    readonly originalData: GraphData;
    readonly targetKey: string;
    readonly LeftGraphAreaMagine?: number;
    readonly RightGraphAreaMagine?: number;
    readonly TopGraphAreaMagine?: number;
    readonly LowerGraphAreaMagine?: number;
}
