import Lokichart from "../lokichart/Lokichart";
import graphData from "../lokichart/GraphData";
import feather from "feather-icons";

window.addEventListener("DOMContentLoaded", function () {
    generatePage();
});

const quarterly = "q";
const monthly = "m";

// ページタイトルを設定する
function bindPageTitle(targetInfo: CompanyOption, data: graphData): void {
    const ctx = document.getElementById("pageTitle");
    let title = "";
    data.dataset
        .filter((v) => v.key === targetInfo.target)
        .map((v) => {
            if (v.key == targetInfo.target) {
                if (v.term == quarterly) {
                    title = `四半期 ${v.name} 推移`;
                } else if (v.term == monthly) {
                    title = `月間 ${v.name} 推移`;
                }
            }
        });
    if (ctx != null) {
        ctx.innerText = title;
    }
}

// メインメソッド
async function generatePage(): Promise<void> {
    // 対象データをクエリストリングから取得して読み込む
    const targetInfo = getQueryString();
    const data = await http<graphData>(
        `https://yamatoya.github.io/${targetInfo.name}/data.json`
    );
    bindPageTitle(targetInfo, data);
    bindCompanyName(data.name);
    bindMenu(data, targetInfo);
    bindTable(data);
    bindGraph(data, targetInfo.target);
}

function bindMenu(companyData: graphData, targetInfo: CompanyOption): void {
    const sideNav = <HTMLTableElement>document.getElementById("sideNav");
    if (sideNav == null) {
        return;
    }
    const sideTop = <HTMLAnchorElement>document.getElementById("sideTop");
    if (sideNav == null) {
        return;
    }
    let sideNavText = "";

    companyData.dataset.forEach((c) => {
        sideNavText += `<li class="nav-item">
                            <a class="nav-link" href="index.html?name=${targetInfo.name}&target=${c.key}">
                                <span data-feather="${c.icon}"></span>
                                ${c.name}
                            </a>
                        </li>`;
    });
    sideNav.innerHTML = sideNavText;
    feather.replace();
    sideTop.href = `../${targetInfo.name}/index.html`;
}

// 会社名マッピング
function bindCompanyName(companyName: string): void {
    const targetCompanyName = <HTMLAnchorElement>(
        document.getElementById("companyName")
    );
    if (targetCompanyName == null) {
        return;
    }

    targetCompanyName.innerText = `${companyName} / yamaNote`;
    targetCompanyName.href = `../${companyName}/index.html`;
    document.title = `${companyName}ダッシュボード: yamaNonte`;
}

function bindGraph(graphData: graphData, target: string): void {
    const targetGraph = document.getElementById("graph");
    if (targetGraph == null) {
        return;
    }
    const loki = new Lokichart({
        container: targetGraph,
        originalData: graphData,
        targetKey: target,
    });
    let resizeTimer: number;
    window.addEventListener('resize', function () {
        if (!resizeTimer) {
            window.clearTimeout(resizeTimer);
        }

        resizeTimer = window.setTimeout(function () {
            loki.resize();
        }, 1e3);
    });
}

function bindTable(data: graphData): void {
    const targetQuarterTable = <HTMLTableElement>(
        document.getElementById("companyQuarterDataTable")
    );
    if (targetQuarterTable == null) {
        return;
    }
    const targetMonthlyTable = <HTMLTableElement>(
        document.getElementById("companyMonthlyDataTable")
    );
    if (targetMonthlyTable == null) {
        return;
    }

    const quarterThead: HTMLTableSectionElement = targetQuarterTable.createTHead();
    const quarterThr: HTMLTableRowElement = quarterThead.insertRow(0);
    let thdQuarterText = "<th>#</th>";
    const monthlyThead: HTMLTableSectionElement = targetMonthlyTable.createTHead();
    const monthlyThr: HTMLTableRowElement = monthlyThead.insertRow(0);
    let thdMonthlyText = "<th>#</th>";
    const monthlyDataSets: Array<string[] | number[]> = [];
    let i = 1;

    thdQuarterText += data.dataset
        .find((v) => v.term == quarterly)
        ?.label.reduce(
            (thdText, element) => (thdText += `<th>${element}</th>`)
        );
    quarterThr.innerHTML = thdQuarterText;
    targetQuarterTable.appendChild(quarterThr);

    data.dataset
        .filter((v) => v.term == quarterly)
        .map((c) => {
            const tr: HTMLTableRowElement = targetQuarterTable.insertRow(0);
            let trText = `<td>${c.name}</td>`;
            const v = (c.value as unknown) as string[];
            trText += v.reduce((text, v) => (text += `<td>${v}</td>`));
            tr.innerHTML = trText;
            targetQuarterTable.appendChild(tr);
        });

    data.dataset
        .filter((v) => v.term == monthly)
        .map((c) => {
            const targetMonthlyTitle = <HTMLTableElement>(
                document.getElementById("monthlyTitle")
            );
            if (targetMonthlyTitle == null) {
                return;
            }
            targetMonthlyTitle.innerText = "月間データ推移";
            thdMonthlyText += `<th>${c.name}</th>`;

            let k = 0;
            c.label.forEach((v) => {
                if (monthlyDataSets[k] == undefined) {
                    monthlyDataSets[k] = [];
                }
                monthlyDataSets[k][0] = v;
                k++;
            });
            let j = 0;
            c.value.forEach((v) => {
                if (monthlyDataSets[j] == undefined) {
                    monthlyDataSets[j] = [];
                }
                monthlyDataSets[j][i] = v;
                j++;
            });
            i++;
        });

    if (monthlyDataSets.length > 0) {
        monthlyThr.innerHTML = thdMonthlyText;
        monthlyThead.appendChild(monthlyThr);

        monthlyDataSets.forEach((v) => {
            const tr: HTMLTableRowElement = targetQuarterTable.insertRow(0);
            let trText = "";
            v.forEach((z: string | number) => {
                trText += `<td>${z}</td>`;
            });
            tr.innerHTML = trText;
            targetMonthlyTable.appendChild(tr);
        });
    }
}

async function http<T>(request: RequestInfo): Promise<T> {
    const response = await fetch(request);
    const body = await response.json();
    return body;
}

function getQueryString(): CompanyOption {
    // クエリストリングを取得する
    const params = new URLSearchParams(window.location.search);
    const option: CompanyOption = { name: "coincheck", target: "revenue" };

    const name = params.get("name");
    if (name != null) {
        option.name = name;
    }

    const target = params.get("target");
    if (target != null) {
        option.target = target;
    }
    return option;
}

interface CompanyOption {
    name: string;
    target: string;
}
