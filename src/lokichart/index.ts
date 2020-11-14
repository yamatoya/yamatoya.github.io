import Lokichart from "./Lokichart";
import graphData from "./GraphData";

const data: graphData = {
    name: "コインチェック株式会社",
    dataset: [
        {
            key: "revenue",
            term: "q",
            label: [
                "2018/4-6",
                "2018/7-9",
                "2018/10-12",
                "2019/1-3",
                "2019/4-6",
                "2019/7-9",
                "2019/10-12",
                "2020/1-3",
                "2020/4-6",
            ],
            value: [9.42, 3.15, 5.5, 3.1, 12.75, 8.02, 4.81, 12.57, 8.2],
            unit: "億円",
            name: "営業収益",
            icon: "bar-chart-2",
        },
        {
            key: "profit",
            term: "q",
            label: [
                "2018/4-6",
                "2018/7-9",
                "2018/10-12",
                "2019/1-3",
                "2019/4-6",
                "2019/7-9",
                "2019/10-12",
                "2020/1-3",
                "2020/4-6",
            ],
            value: [-2.59, -5.88, -3.24, -5.6, 1.42, 0.09, -1.27, 2.69, 1.02],
            unit: "億円",
            name: "税引き前利益",
            icon: "activity",
        },
        {
            key: "hr",
            term: "q",
            label: [
                "2018/4-6",
                "2018/7-9",
                "2018/10-12",
                "2019/1-3",
                "2019/4-6",
                "2019/7-9",
                "2019/10-12",
                "2020/1-3",
                "2020/4-6",
            ],
            value: [4.06, 3.73, 4.32, 5.36, 3.99, 3.08, 2.58, 3.21, 2.94],
            unit: "億円",
            name: "人件費",
            icon: "users",
        },
        {
            key: "system",
            term: "q",
            label: [
                "2018/4-6",
                "2018/7-9",
                "2018/10-12",
                "2019/1-3",
                "2019/4-6",
                "2019/7-9",
                "2019/10-12",
                "2020/1-3",
                "2020/4-6",
            ],
            value: [2.92, 2.71, 3.43, 4.19, 3.39, 2.59, 1.51, 1.55, 1.39],
            unit: "億円",
            name: "システム関連費用",
            icon: "monitor",
        },
        {
            key: "ad",
            term: "q",
            label: [
                "2018/4-6",
                "2018/7-9",
                "2018/10-12",
                "2019/1-3",
                "2019/4-6",
                "2019/7-9",
                "2019/10-12",
                "2020/1-3",
                "2020/4-6",
            ],
            value: [700, 1000, 1100, 5600, 4200, 8700, 5900, 7500, 5900],
            unit: "万円",
            name: "広告宣伝費",
            icon: "tv",
        },
    ],
};

window.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("graph");
    const targetKey = "revenue";
    if (container == null) {
        return;
    }
    new Lokichart({
        container: container,
        originalData: data,
        targetKey: targetKey,
    });
});
