import Lokichart from './Lokichart'

window.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById("graph");
    if (container == null) {
        return;
    }
    const timeConvertor = new Lokichart(container);
});
