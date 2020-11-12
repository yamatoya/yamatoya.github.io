export interface graphData {
    name: string;
    dataset: graphDataSet[];
}

export interface graphDataSet {
    key: string;
    term: string;
    label: string[];
    value: number[];
    unit: string;
    name: string;
    icon: string;
}

export default graphData;
