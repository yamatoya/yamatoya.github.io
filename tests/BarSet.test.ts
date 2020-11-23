import BarSet from "../src/lokichart/BarSet";
import GraphData from "../src/lokichart/GraphData";

describe("BarSetクラスのテスト", () => {
    let barSet1: BarSet;
    let barSet2: BarSet;
    const data: GraphData = {
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
                value: [
                    -2.59,
                    -5.88,
                    -3.24,
                    -5.6,
                    1.42,
                    0.09,
                    -1.27,
                    2.69,
                    1.02,
                ],
                unit: "億円",
                name: "税引き前利益",
                icon: "activity",
            },
        ],
    };

    beforeAll(() => {
        barSet1 = new BarSet(data, 450, "profit");
        barSet2 = new BarSet(data, 270, "revenue");
    });

    it("BarSetのGraphWidth360以上はBarWidthは30", () => {
        expect(barSet1.BarWidth).toBe(30);
    });

    it("BarSetのGraphWidth450はBarMagineは20", () => {
        expect(barSet1.BarMagine).toBe(20);
    });

    it("barset1のkeyはprofit", () => {
        expect(barSet1.GraphData.key).toBe("profit");
    });

    it("barset1のnameは税引き前利益", () => {
        expect(barSet1.GraphData.name).toBe("税引き前利益");
    });

    // it("BarSetのGraphWidth450はLastBarStartCoordinateXは20", () => {
    //     expect(barSet1.LastBarStartCoordinateX).toBe(20);
    // });

    it("BarSetのGraphWidth270はBarWidthは20", () => {
        expect(barSet2.BarWidth).toBe(20);
    });

    it("BarSetのGraphWidth270はBarMagineは10", () => {
        expect(barSet2.BarMagine).toBe(10);
    });

    // it("BarSetのGraphWidth270はLastBarStartCoordinateXは20", () => {
    //     expect(barSet2.LastBarStartCoordinateX).toBe(20);
    // });

    it("barset2のkeyはrevenue", () => {
        expect(barSet2.GraphData.key).toBe("revenue");
    });

    it("barset2のnameは営業収益", () => {
        expect(barSet2.GraphData.name).toBe("営業収益");
    });
});
