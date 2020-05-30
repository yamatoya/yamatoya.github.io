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

// メインメソッド
async function generatePage() {
    const targetInfo = getQueryString();
    const data = await http<CompanyData>(
        `https://yamatoya.github.io/${targetInfo.name}/data.json`
    );
    setPageInformation(targetInfo)
    bindCompanyName(targetInfo.name);
    bindMenu(data, targetInfo);
    bindTable(data);
    const graphData = getGraphData(data, targetInfo);
    bindGraph(graphData);
}

function bindMenu(companyData: CompanyData, targetInfo: CompanyOption) {
    const sideNav = <HTMLTableElement>document.getElementById('sideNav');
    if (sideNav == null) {
        return;
    }
    const sideTop = <HTMLAnchorElement>document.getElementById('sideTop');
    if (sideNav == null) {
        return;
    }
    let sideNavText = "";
    if (companyData.revenue.length != 0) {
        sideNavText += `<li class="nav-item">
                            <a class="nav-link" href="index.html?name=${targetInfo.name}&target=revenue">
                                <span data-feather="bar-chart-2"></span>
                                営業収益
                            </a>
                        </li>`
    }
    if (companyData.profit.length != 0) {
        sideNavText += `<li class="nav-item">
                            <a class="nav-link" href="index.html?name=${targetInfo.name}&target=profit">
                                <span data-feather="activity"></span>
                                税引き前利益
                            </a>
                        </li>`
    }
    if (companyData.ad.length != 0) {
        sideNavText += `<li class="nav-item">
                            <a class="nav-link" href="index.html?name=${targetInfo.name}&target=ad">
                                <span data-feather="tv"></span>
                                広告宣伝費
                            </a>
                        </li>`
    }
    if (companyData.hr.length != 0) {
        sideNavText += `<li class="nav-item">
                            <a class="nav-link" href="index.html?name=${targetInfo.name}&target=hr">
                                <span data-feather="users"></span>
                                人件費
                            </a>
                        </li>`
    }
    if (companyData.system.length != 0) {
        sideNavText += `<li class="nav-item">
                            <a class="nav-link" href="index.html?name=${targetInfo.name}&target=system">
                                <span data-feather="monitor"></span>
                                システム関連費用
                            </a>
                        </li>`
    }
    sideNav.innerHTML = sideNavText;
    sideTop.href = `../${targetInfo.name}/index.html`;
}

// 会社名マッピング
// TASK：会社ページを追加した場合は、ここに追加が必要
function bindCompanyName(companyName: string) {
    const targetCompanyName = <HTMLAnchorElement>document.getElementById('companyName');
    if (targetCompanyName == null) {
        return;
    }
    let name = '';
    switch (companyName) {
        case 'coincheck':
            name = 'コインチェック株式会社';
            break;
        case 'gmocoin':
            name = 'GMOコイン株式会社';
            break;
        default:
            break;
    }
    targetCompanyName.innerText = `${name} / yamaNote`
    targetCompanyName.href = `../${name}/index.html`
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
    let thead: HTMLTableSectionElement = targetTable.createTHead();
    let tr: HTMLTableRowElement = thead.insertRow(0);
    let thdText = '<th>#</th>';
    if (data.revenue.length != 0) {
        thdText += '<th>営業収益</th>';
    }
    if (data.profit.length != 0) {
        thdText += '<th>税引き前利益</th>';
    }
    if (data.ad.length != 0) {
        thdText += '<th>広告宣伝費</th>';
    }
    if (data.hr.length != 0) {
        thdText += '<th>人件費</th>';
    }
    if (data.system.length != 0) {
        thdText += '<th>システム関連費用</th>';
    }
    tr.innerHTML = thdText;
    targetTable.appendChild(tr);

    for (let index = 0; index < data.label.length; index++) {
        let tr: HTMLTableRowElement = targetTable.insertRow(0);
        let trText: string = '';

        if (data.label[index] != null) {
            trText += `<td>${data.label[index]}</td>`
        } else {
            trText += '<td></td>';
        }

        if (data.revenue[index] != null) {
            trText += `<td>${data.revenue[index]}${data.revenue_unit}</td>`
        } else {
            trText += '<td></td>';
        }

        if (data.profit[index] != null) {
            trText += `<td>${data.profit[index]}${data.profit_unit}</td>`
        } else {
            trText += '<td></td>';
        }

        if (data.ad[index] != null) {
            trText += `<td>${data.ad[index]}${data.ad_unit}</td>`
        } else {
            trText += '<td></td>';
        }

        if (data.hr[index] != null) {
            trText += `<td>${data.hr[index]}${data.hr_unit}</td>`
        } else {
            trText += '<td></td>';
        }

        if (data.system[index] != null) {
            trText += `<td>${data.system[index]}${data.system_unit}</td>`;
        } else {
            trText += '<td></td>';
        }
        tr.innerHTML = trText;
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