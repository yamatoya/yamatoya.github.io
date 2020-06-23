import 'moment/locale/ja'
import 'moment/locale/lb'
import moment from 'moment';
import 'moment-timezone';

class TimeConvertor {

    private startDateInput: HTMLInputElement;
    private endDateInput: HTMLInputElement;

    constructor() {
        // fromとtoに初期値として現在時刻を設定する
        this.startDateInput = <HTMLInputElement>document.getElementById('fromDate');
        this.startDateInput.value = moment().format(moment.HTML5_FMT.DATETIME_LOCAL);
        this.endDateInput = <HTMLInputElement>document.getElementById('toDate');
        this.endDateInput.value = moment().format(moment.HTML5_FMT.DATETIME_LOCAL);
        this.initial();
    }

    initial() {
        // クエリストリングのstartかendが設定されていれば画面に反映する
        const params = new URLSearchParams(window.location.search)
        const fromDate = params.get('start')
        if (fromDate != null) {
            this.startDateInput.value = moment.unix(parseInt(fromDate)).format(moment.HTML5_FMT.DATETIME_LOCAL);
        }
        const toDate = params.get('end')
        if (toDate != null) {
            this.endDateInput.value = moment.unix(parseInt(toDate)).format(moment.HTML5_FMT.DATETIME_LOCAL);
        }
    }

    convert() {

        const fromLocalTime = this.startDateInput.value;
        const toLocalTime = this.endDateInput.value;

        this.updateURLQueryString(fromLocalTime, toLocalTime);
        this.updateConvertDataOnView(fromLocalTime, toLocalTime);
    }

    updateURLQueryString(fromLocalTime: string, toLocalTime: string) {

        const params = new URLSearchParams(location.search);
        params.set('start', moment(fromLocalTime).unix().toString());
        params.set('end', moment(toLocalTime).unix().toString());

        // 現在のURL欄を画面と合わせる
        history.pushState({}, '', `${location.pathname}?${params.toString()}`);
    }

    updateConvertDataOnView(fromLocalTime: string, toLocalTIme: string) {

        // 指定された時間の日本時間を表示する
        moment.locale('ja');
        const jp = document.getElementById('jp');
        if (jp != null) { jp.innerHTML = `<th scope="row">Asia/Tokyo +9</th><td>${moment(fromLocalTime).tz("Asia/Tokyo").format('llll')}</td><td>${moment(toLocalTIme).tz("Asia/Tokyo").format('llll')}</td>`; }

        // 指定された時間のルクセンブルク時間を表示する
        moment.locale('lb');
        const eu = document.getElementById('eu');
        if (eu != null) { eu.innerHTML = `<th scope="row">Europe/Luxembourg +2</th><td>${moment(fromLocalTime).tz("Europe/Luxembourg").format('llll')}</td><td>${moment(toLocalTIme).tz("Europe/Luxembourg").format('llll')}</td>`; }

        moment.locale('en');
        const us = document.getElementById('us');
        if (us != null) { us.innerHTML = `<th scope="row">America/Los_Angeles -7</th><td>${moment(fromLocalTime).tz("America/Los_Angeles").format('llll')}</td><td>${moment(toLocalTIme).tz("America/Los_Angeles").format('llll')}</td>`; }
        const utc = document.getElementById('utc');
        if (utc != null) { utc.innerHTML = `<th scope="row">UTC ±0</th><td>${moment(fromLocalTime).tz("UTC").format('llll')}</td><td>${moment(toLocalTIme).tz("UTC").format('llll')}</td>`; }
    }
}

export default TimeConvertor;