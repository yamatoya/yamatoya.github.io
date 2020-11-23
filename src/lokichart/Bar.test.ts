import Bar from "./Bar";

describe("Barクラスのテスト", () => {
    let bar: Bar;
    beforeAll(() => {
        bar = new Bar(10, "1-3", 100, 150, 200);
    });

    it("BarNumberは10", () => {
        expect(bar.BarNumber).toBe(10);
    });

    it("BarLabelは1-3", () => {
        expect(bar.BarLabel).toBe("1-3");
    });

    it("BarCoordinateXは100", () => {
        expect(bar.BarCoordinateX).toBe(100);
    });

    it("BarHeightは150", () => {
        expect(bar.BarHeight).toBe(150);
    });

    it("BarNumberCoordinateYは200", () => {
        expect(bar.BarNumberCoordinateY).toBe(200);
    });
});
