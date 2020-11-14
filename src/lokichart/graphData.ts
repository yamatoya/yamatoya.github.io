export class GraphData {
    name: string;
    dataset: GraphDataSet[];
    constructor() {
        this.name = "";
        this.dataset = [];
    }
}

export class GraphDataSet {
    key: string;
    term: string;
    label: string[];
    value: number[];
    unit: string;
    name: string;
    icon: string;
    constructor() {
        this.icon = "";
        this.key = "";
        this.label = [];
        this.name = "";
        this.term = "";
        this.unit = "";
        this.value = [];
    }
}

export default GraphData;
