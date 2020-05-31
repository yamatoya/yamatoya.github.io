import Chart, { plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.plugins.unregister(ChartDataLabels);

window.addEventListener('DOMContentLoaded', function () {
    generatePage();
});

function bindPageTitle(targetInfo: CompanyOption, data: CompanyData) {
    const ctx = document.getElementById('pageTitle');
    data.dataset.forEach(v => {
        if (v.key == targetInfo.target) {
            if (ctx != null) {
                ctx.innerText = `四半期 ${v.name} 推移`
            }
        }
    });
}

// メインメソッド
async function generatePage() {
    const targetInfo = getQueryString();
    const data = await http<CompanyData>(
        `https://yamatoya.github.io/${targetInfo.name}/data.json`
    );
    bindPageTitle(targetInfo, data)
    bindCompanyName(data.name);
    bindMenu(data, targetInfo);
    bindTable(data);
    bindGraph(data, targetInfo.target);
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

    companyData.dataset.forEach(c => {
        sideNavText += `<li class="nav-item">
                            <a class="nav-link" href="index.html?name=${targetInfo.name}&target=${c.key}">
                                <span data-feather="bar-chart-2"></span>
                                ${c.name}
                            </a>
                        </li>`
    });
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

    targetCompanyName.innerText = `${companyName} / yamaNote`
    targetCompanyName.href = `../${companyName}/index.html`
    document.title = `${companyName}ダッシュボード: yamaNonte`
}

function bindGraph(graphData: CompanyData, target: string) {
    const targetGraph = document.getElementById('myChart');
    if (targetGraph == null) {
        return;
    }

    graphData.dataset.forEach(v => {
        if (v.key == target) {
            if (targetGraph instanceof HTMLCanvasElement) {
                var myChart = new Chart(targetGraph, {
                    type: 'bar',
                    data: {
                        "labels": graphData.label,
                        datasets: [{
                            data: v.value,
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
                                    return `${value}${v.unit}`
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
    });
}

function bindTable(data: CompanyData) {
    const targetTable = <HTMLTableElement>document.getElementById('companyDataTable');
    if (targetTable == null) {
        return;
    }
    let thead: HTMLTableSectionElement = targetTable.createTHead();
    let tr: HTMLTableRowElement = thead.insertRow(0);
    let thdText = '<th>#</th>';

    data.label.forEach(element => {
        thdText += `<th>${element}</th>`
    });

    tr.innerHTML = thdText;
    targetTable.appendChild(tr);

    data.dataset.forEach(c => {
        let tr: HTMLTableRowElement = targetTable.insertRow(0);
        let trText: string = `<td>${c.name}</td>`;
        c.value.forEach(v => {
            trText += `<td>${v}</td>`;
        });
        tr.innerHTML = trText;
        targetTable.appendChild(tr);
    });
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
    name: string;
    dataset: CompanyDetailData[];
}

interface CompanyDetailData {
    key: string;
    value: number[];
    unit: string;
    name: string;
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