import Chart, { plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import feather from 'feather-icons';

Chart.plugins.unregister(ChartDataLabels);

window.addEventListener('DOMContentLoaded', function () {
    generatePage();
});

const quarterly = 'q';
const monthly = 'm';

// ページタイトルを設定する
function bindPageTitle(targetInfo: CompanyOption, data: CompanyData) {
    const ctx = document.getElementById('pageTitle');
    let title = "";
    data.dataset.filter(v => v.key === targetInfo.target)
        .map(v => {
            if (v.key == targetInfo.target) {
                if (v.term == quarterly) {
                    title = `四半期 ${v.name} 推移`
                } else if (v.term == monthly) {
                    title = `月間 ${v.name} 推移`
                }
            }
        });
    if (ctx != null) {
        ctx.innerText = title;
    }
}

// メインメソッド
async function generatePage() {

    // 対象データをクエリストリングから取得して読み込む
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
                                display: function () { if (v.term == 'q') { return true } else { return false } },
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
    let trMonthlyText = "";
    let monthlyDataSets: Array<String[] | number[]> = []
    let i = 1;

    thdQuarterText += data.dataset
        .find(v => v.term == quarterly)?.label
        .reduce((thdText, element) => thdText += `<th>${element}</th>`);
    quarterThr.innerHTML = thdQuarterText;
    targetQuarterTable.appendChild(quarterThr);

    data.dataset.filter(v => v.term == quarterly)
        .map(c => {
            let tr: HTMLTableRowElement = targetQuarterTable.insertRow(0);
            let trText: string = `<td>${c.name}</td>`;
            const v = c.value as unknown as string[]
            trText += v.reduce((text, v) => text += `<td>${v}</td>`);
            tr.innerHTML = trText;
            targetQuarterTable.appendChild(tr);
        });

    data.dataset.filter(v => v.term == monthly)
        .map(c => {
            const targetMonthlyTitle = <HTMLTableElement>document.getElementById('monthlyTitle');
            if (targetMonthlyTitle == null) {
                return;
            }
            targetMonthlyTitle.innerText = '月間データ推移';
            thdMonthlyText += `<th>${c.name}</th>`;

            let k = 0
            c.label.forEach(v => {
                if (monthlyDataSets[k] == undefined) {
                    monthlyDataSets[k] = [];
                }
                monthlyDataSets[k][0] = v;
                console.log(`k:${k}:${v}`);
                k++;
            });
            let j = 0;
            c.value.forEach(v => {
                if (monthlyDataSets[j] == undefined) {
                    monthlyDataSets[j] = [];
                }
                monthlyDataSets[j][i] = v;
                j++;
            });
            i++;
        });


    if (monthlyDataSets.length > 0) {
        console.log(monthlyDataSets)
        monthlyThr.innerHTML = thdMonthlyText;
        monthlyThead.appendChild(monthlyThr);

        monthlyDataSets.forEach(v => {
            let tr: HTMLTableRowElement = targetQuarterTable.insertRow(0);
            let trText = "";
            v.forEach((z: any) => {
                trText += `<td>${z}</td>`;
            })
            tr.innerHTML = trText;
            targetMonthlyTable.appendChild(tr);
        })
    }
}

function bindMonthlyDataToTable() {

}

async function http<T>(request: RequestInfo): Promise<T> {
    const response = await fetch(request);
    const body = await response.json();
    return body;
}

function getQueryString() {
    // クエリストリングを取得する
    const params = new URLSearchParams(window.location.search)
    const option: CompanyOption = { name: "coincheck", target: "revenue" };

    const name = params.get('name');
    if (name != null) {
        option.name = name
    }

    const target = params.get('target');
    if (target != null) {
        option.target = target
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
    target: string;
}