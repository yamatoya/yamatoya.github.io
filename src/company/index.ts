import Chart, { plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.plugins.unregister(ChartDataLabels);

window.addEventListener('DOMContentLoaded', function () {
    generateGraph();
});

async function generateGraph() {
    const ctx = document.getElementById('myChart');
    if (ctx == null) {
        return;
    }
    const targetInfo = getQueryString();
    const data = await http<CompanyData>(
        `https://yamatoya.github.io/${targetInfo.name}/data.json`
    );
    const graphData = getGraphData(data, targetInfo);
    bindGraph(graphData, ctx);
}

function getGraphData(data: CompanyData, targetInfo: CompanyOption): GraphData {
    let graphData: GraphData = { label: [], data: [], unit: "" };
    let unit: 'revenue_unit' | 'profit_unit';
    let target: 'revenue' | 'profit';

    console.log(data);
    graphData.label = data.label
    target = targetInfo.target;
    switch (targetInfo.target) {
        case 'profit':
            unit = 'profit_unit'
        case 'revenue':
        default:
            unit = 'revenue_unit'
            break;
    }
    const targetKey: keyof CompanyData = target
    graphData.data = data[targetKey]

    const unitKey: keyof CompanyData = unit
    graphData.unit = data[unitKey]

    return graphData;
}

function bindGraph(graphData: GraphData, targetGraph: HTMLElement) {
    console.log(graphData);
    if (targetGraph instanceof HTMLCanvasElement) {
        var myChart = new Chart(targetGraph, {
            type: 'bar',
            data: {
                "labels": graphData.label,
                datasets: [{
                    data: graphData.data,
                    "backgroundColor": "rgba(255, 99, 132, 0.2)",
                    "borderColor": "rgb(255, 99, 132)",
                    "borderWidth": 1
                }]
            },
            plugins: [ChartDataLabels],
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                maintainAspectRatio: false,
                responsive: false,
                legend: {
                    display: false
                },
                plugins: {
                    datalabels: {
                        color: 'black',
                        display: true,
                        formatter: function (value: number) {
                            return `${value}${graphData.unit}`
                        }
                    },
                    font: {
                        weight: 'bold'
                    }
                }
            }
        });
    }
}

async function http<T>(
    request: RequestInfo
): Promise<T> {
    const response = await fetch(request);
    const body = await response.json();
    return body;
}

function getQueryString() {
    const params = new URLSearchParams(window.location.search)
    const option: CompanyOption = { name: "coincheck", target: "revenue" };
    if (params.has('name')) {
        const name = params.get('name');
        if (name != null) {
            option.name = name
        }
    }
    if (params.has('target')) {
        const target = params.get('target');
        if (target != null && (target == 'revenue' || target == 'profit')) {
            option.target = target
        }
    }
    console.log(option);
    return option;
}

interface CompanyData {
    label: string[];
    revenue: number[];
    revenue_unit: string;
    profit: number[];
    profit_unit: string;
}

interface GraphData {
    label: string[];
    data: number[];
    unit: string;
}

interface CompanyOption {
    name: string;
    target: 'revenue' | 'profit';
}