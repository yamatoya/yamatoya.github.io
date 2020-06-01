import Chart, { plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import feather from 'feather-icons';

Chart.plugins.unregister(ChartDataLabels);

window.addEventListener('DOMContentLoaded', function () {
    generatePage();
});

function bindPageTitle(targetInfo: CompanyOption, data: CompanyData) {
    const ctx = document.getElementById('pageTitle');
    data.dataset.forEach(v => {
        if (v.key == targetInfo.target) {
            if (ctx != null) {
                if (v.term == 'q') {
                    ctx.innerText = `四半期 ${v.name} 推移`
                } else if (v.term == 'm') {
                    ctx.innerText = `月間 ${v.name} 推移`
                }
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
                                <span data-feather="${c.icon}"></span>
                                ${c.name}
                            </a>
                        </li>`
    });
    sideNav.innerHTML = sideNavText;
    feather.replace();
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
                        "labels": v.label,
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
    const targetQuarterTable = <HTMLTableElement>document.getElementById('companyQuarterDataTable');
    if (targetQuarterTable == null) {
        return;
    }
    const targetMonthlyTable = <HTMLTableElement>document.getElementById('companyMonthlyDataTable');
    if (targetMonthlyTable == null) {
        return;
    }

    let quarterThead: HTMLTableSectionElement = targetQuarterTable.createTHead();
    let quarterThr: HTMLTableRowElement = quarterThead.insertRow(0);
    let thdQuarterText = '<th>#</th>';
    let monthlyThead: HTMLTableSectionElement = targetMonthlyTable.createTHead();
    let monthlyThr: HTMLTableRowElement = monthlyThead.insertRow(0);
    let thdMonthlyText = '<th>#</th>';

    data.dataset.forEach(c => {
        if (c.term == 'q') {

            if (quarterThr.innerHTML == '') {
                c.label.forEach(element => {
                    thdQuarterText += `<th>${element}</th>`
                });
                quarterThr.innerHTML = thdQuarterText;
                targetQuarterTable.appendChild(quarterThr);
            }


            let tr: HTMLTableRowElement = targetQuarterTable.insertRow(0);
            let trText: string = `<td>${c.name}</td>`;
            c.value.forEach(v => {
                trText += `<td>${v}</td>`;
            });
            tr.innerHTML = trText;
            targetQuarterTable.appendChild(tr);
        } else if (c.term == 'm') {
            if (monthlyThr.innerHTML == '') {
                c.label.forEach(element => {
                    thdMonthlyText += `<th>${element}</th>`
                });
                monthlyThr.innerHTML = thdMonthlyText;
                targetQuarterTable.appendChild(monthlyThr);
            }
            let tr: HTMLTableRowElement = targetMonthlyTable.insertRow(0);
            let trText: string = `<td>${c.name}</td>`;
            c.value.forEach(v => {
                trText += `<td>${v}</td>`;
            });
            tr.innerHTML = trText;
            targetMonthlyTable.appendChild(tr);
        }
    });
    if (monthlyThr.innerHTML == '') {
        const targetMonthlyTitle = <HTMLTableElement>document.getElementById('monthlyTitle');
        if (targetMonthlyTitle == null) {
            return;
        }
        targetMonthlyTitle.remove();
    }
}

function createTable() {

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
    name: string;
    dataset: CompanyDetailData[];
}

interface CompanyDetailData {
    key: string;
    term: string;
    label: string[];
    value: number[];
    unit: string;
    name: string;
    icon: string;
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