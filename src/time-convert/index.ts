import 'moment/locale/ja'
import 'moment/locale/lb'
import moment from 'moment';
import 'moment-timezone';

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

class TimeConvertor {

    private startDateInput: HTMLInputElement;
    private endDateInput: HTMLInputElement;
    constructor() {
        this.startDateInput = <HTMLInputElement>document.getElementById('startDate');
        this.endDateInput = <HTMLInputElement>document.getElementById('endDate');
        this.initial();
    }

    initial() {
        const params = new URLSearchParams(window.location.search)
        if (params.has('start')) {
            const start = params.get('start')
            if (start != null) {
                this.startDateInput.value = moment.unix(parseInt(start)).format(moment.HTML5_FMT.DATETIME_LOCAL);
            }
        } else {
            this.startDateInput.value = moment().format(moment.HTML5_FMT.DATETIME_LOCAL);
        }
        if (params.has('end')) {
            const end = params.get('end')
            if (end != null) {
                this.endDateInput.value = moment.unix(parseInt(end)).format(moment.HTML5_FMT.DATETIME_LOCAL);
            }
        } else {
            this.endDateInput.value = moment().format(moment.HTML5_FMT.DATETIME_LOCAL);
        }
    }
    convert() {

        const startLocalTime = this.startDateInput.value;
        const endLocalTime = this.endDateInput.value;

        this.setQueryString(startLocalTime, endLocalTime);
        this.updateConverData(startLocalTime, endLocalTime);
    }

    setQueryString(startLocalTime: string, endLocalTime: string) {
        const params = new URLSearchParams(location.search);
        params.set('start', moment(startLocalTime).unix().toString());
        params.set('end', moment(endLocalTime).unix().toString());
        console.log(params.toString());
        history.pushState({}, '', `${location.pathname}?${params.toString()}`);
    }

    updateConverData(startLocalTime: string, endLocalTIme: string) {
        moment.locale('ja');
        const jp = document.getElementById('jp');
        if (jp != null) { jp.innerHTML = `<th scope="row">Asia/Tokyo +9</th><td>${moment(startLocalTime).tz("Asia/Tokyo").format('llll')}</td><td>${moment(endLocalTIme).tz("Asia/Tokyo").format('llll')}</td>`; }

        moment.locale('lb');
        const eu = document.getElementById('eu');
        if (eu != null) { eu.innerHTML = `<th scope="row">Europe/Luxembourg +2</th><td>${moment(startLocalTime).tz("Europe/Luxembourg").format('llll')}</td><td>${moment(endLocalTIme).tz("Europe/Luxembourg").format('llll')}</td>`; }

        moment.locale('en');
        const us = document.getElementById('us');
        if (us != null) { us.innerHTML = `<th scope="row">America/Los_Angeles -7</th><td>${moment(startLocalTime).tz("America/Los_Angeles").format('llll')}</td><td>${moment(endLocalTIme).tz("America/Los_Angeles").format('llll')}</td>`; }
        const utc = document.getElementById('utc');
        if (utc != null) { utc.innerHTML = `<th scope="row">UTC ±0</th><td>${moment(startLocalTime).tz("UTC").format('llll')}</td><td>${moment(endLocalTIme).tz("UTC").format('llll')}</td>`; }
    }
}