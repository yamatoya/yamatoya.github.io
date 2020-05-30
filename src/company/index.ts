import Chart, { plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.plugins.unregister(ChartDataLabels);

window.addEventListener('DOMContentLoaded', function () {
    generatePage();
});

function setPageInformation(targetInfo: CompanyOption) {
    const ctx = document.getElementById('pageTitle');
    if (ctx != null) {
        switch (targetInfo.target) {
            case 'profit':
                ctx.innerText = "四半期 税引き前利益 推移"
                break;
            case 'ad':
                ctx.innerText = "四半期 広告宣伝費 推移"
                break;
            case 'hr':
                ctx.innerText = "四半期 人件費 推移"
                break;
            case 'system':
                ctx.innerText = "四半期 システム関連費用 推移"
                break;
            case 'revenue':
            default:
                ctx.innerText = "四半期 営業収益 推移"
                break;
        }
    }
}

function bindURL(name: string) {
    document.querySelectorAll('a.nav-link').forEach(function (x) {
        if (x instanceof HTMLAnchorElement) {
            x.href.replace('coincheck', name)
        }
    })
}

// メインメソッド
async function generatePage() {
    const targetInfo = getQueryString();
    const data = await http<CompanyData>(
        `https://yamatoya.github.io/${targetInfo.name}/data.json`
    );
    bindCompanyName(targetInfo.name);
    bindURL(targetInfo.name);
    const graphData = getGraphData(data, targetInfo);
    bindGraph(graphData);
    bindTable(data);
    setPageInformation(targetInfo)
}

// 会社名マッピング
// TASK：会社ページを追加した場合は、ここに追加が必要
function bindCompanyName(companyName: string) {
    const targetCompanyName = document.getElementById('companyName');
    if (targetCompanyName == null) {
        return;
    }
    let name = '';
    switch (companyName) {
        case 'coincheck':
            name = 'コインチェック株式会社';
            break;

        default:
            break;
    }
    targetCompanyName.innerText = name
    document.title = `${name}ダッシュボード: yamaNonte`
}

function getGraphData(data: CompanyData, targetInfo: CompanyOption): GraphData {
    let graphData: GraphData = { label: [], data: [], unit: "" };
    let unit: 'revenue_unit' | 'profit_unit' | 'hr_unit' | 'ad_unit' | 'system_unit';
    let target: 'revenue' | 'profit' | 'hr' | 'system' | 'ad';

    graphData.label = data.label
    target = targetInfo.target;
    switch (targetInfo.target) {
        case 'profit':
            unit = 'profit_unit'
            break;
        case 'hr':
            unit = 'hr_unit'
            break;
        case 'system':
            unit = 'system_unit'
            break;
        case 'ad':
            unit = 'ad_unit'
            break;
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

function bindGraph(graphData: GraphData) {
    const targetGraph = document.getElementById('myChart');
    if (targetGraph == null) {
        return;
    }
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

function bindTable(data: CompanyData) {
    const targetTable = <HTMLTableElement>document.getElementById('companyDataTable');
    if (targetTable == null) {
        return;
    }
    for (let index = 0; index < data.label.length; index++) {
        let tr: HTMLTableRowElement = targetTable.insertRow(0);
        tr.innerHTML = `<td>${data.label[index]}</td>
        <td>${data.revenue[index]}${data.revenue_unit}</td>
        <td>${data.profit[index]}${data.profit_unit}</td>
        <td>${data.ad[index]}${data.ad_unit}</td>
        <td>${data.hr[index]}${data.hr_unit}</td>
        <td>${data.system[index]}${data.system_unit}</td>`;
        targetTable.appendChild(tr);
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
        if (target != null && (target == 'revenue' || target == 'profit' || target == 'hr' || target == 'system' || target == 'ad')) {
            option.target = target
        }
    }
    return option;
}

interface CompanyData {
    label: string[];
    revenue: number[];
    revenue_unit: string;
    profit: number[];
    profit_unit: string;
    hr: number[];
    hr_unit: string;
    system: number[];
    system_unit: string;
    ad: number[];
    ad_unit: string;
}

interface GraphData {
    label: string[];
    data: number[];
    unit: string;
}

interface CompanyOption {
    name: string;
    target: 'revenue' | 'profit' | 'hr' | 'system' | 'ad';
}