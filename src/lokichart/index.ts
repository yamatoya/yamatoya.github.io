import Lokichart from "./Lokichart";
import graphData from "./graphData";

const data: graphData = {
    term: "m",
    label: [
        "2018/04",
        "2018/05",
        "2018/06",
        "2018/07",
        "2018/08",
        "2018/09",
        "2018/10",
        "2018/11",
        "2018/12",
        "2019/01",
        "2019/02",
        "2019/03",
        "2019/04",
        "2019/05",
        "2019/06",
        "2019/07",
        "2019/08",
        "2019/09",
        "2019/10",
        "2019/11",
        "2019/12",
        "2020/01",
        "2020/02",
        "2020/03",
        "2020/04",
        "2020/05",
    ],
    value: [
        10138,
        8675,
        6699,
        7971,
        9589,
        9867,
        11360,
        8589,
        8162,
        7345,
        6319,
        6549,
        7026,
        8314,
        10143,
        -9143,
        -5259,
        -4446,
        -3857,
        -3100,
        -2406,
        2320,
        6578,
        3322,
        2625,
        845,
    ],
    unit: "億円",
    name: "営業収益",
};

window.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("graph");
    if (container == null) {
        return;
    }
    const timeConvertor = new Lokichart(container, data);
});
