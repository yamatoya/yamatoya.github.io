import BarGroup from "../src/lokichart/BarGroup";

describe("BarGroupクラスのテスト", () => {
    let barGroup: BarGroup;
    beforeAll(() => {
        barGroup = new BarGroup("2019", 200);
    });

    it("BarGroupStartCoordinateXは300", () => {
        expect(barGroup.BarGroupStartCoordinateX).toBe(200);
    });

    it("BarGroupLabelは2019", () => {
        expect(barGroup.BarGroupLabel).toBe("2019");
    });

    it("BarGroupLabelCoordinateXは100", () => {
        expect(barGroup.BarGroupLabelCoordinateX).toBe(100);
    });
});
