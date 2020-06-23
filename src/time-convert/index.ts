import TimeConvertor from './TimeConvertor'

window.addEventListener('DOMContentLoaded', function () {
    const timeConvertor = new TimeConvertor();
    timeConvertor.convert();
    const btnConvert = document.getElementById('btnConvert');
    if (btnConvert != null) {
        btnConvert.addEventListener('click', function () {
            return timeConvertor.convert();
        });
    }
});