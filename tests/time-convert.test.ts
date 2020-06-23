import TimeConvertor from "../src/time-convert/TimeConvertor";

describe('TimeConvertor', () => {
    it('initial', () => {
        jest.spyOn(URLSearchParams.prototype, 'has').mockImplementation(v => {
            if (v == "start") {
                return true;
            } else if (v == "end") {
                return true;
            } else {
                return false;
            }
        });
        jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation(v => {
            if (v == "start") {
                return "1592094720";
            } else if (v == "end") {
                return "1592094720";
            } else {
                return "0";
            }
        });
        const params = new URLSearchParams(window.location.search)
        document.body.innerHTML = '<input type="datetime-local" class="form-control" id="startDate" required><input type="datetime-local" class="form-control" id="endDate" required>'
        const timeConvertor = new TimeConvertor();
        timeConvertor.initial();
        const a = <HTMLInputElement>document.getElementById('startDate');
        expect(a.value).toBe("2020-06-14T09:32")
    })
})

