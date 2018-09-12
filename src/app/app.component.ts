import { Component } from '@angular/core';
import * as AFB from './afb-websocket.service.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  afb;
  ws;

  checkband() {
    let band = 50;
    this.callbinder('radio', 'band_supported', { band: band });
  }

  connect() {
    this.afb = new AFB.AFB('api', 'mysecret');
    this.ws = new this.afb.ws(this.onopen, this.onabort);
  }

  onopen() {
    this.ws.onevent('*', this.gotevent);

    this.callbinder('radio', 'subscribe', { value: 'frequency' });
    this.callbinder('radio', 'subscribe', { value: 'station_found' });
  }

  onabort() {
    this.callbinder('radio', 'unsubscribe', { value: 'frequency' });
    this.callbinder('radio', 'unsubscribe', { value: 'station_found' });
  }

  gotevent(obj) {
    console.log('gotevent:' + JSON.stringify(obj));
  }

  replyok(obj) {
    console.log('replyok:' + JSON.stringify(obj));
  }

  replyerr(obj) {
    console.log('replyerr:' + JSON.stringify(obj));
  }

  callbinder(api, verb, query) {
    console.log('api=' + api + ' verb=' + verb + ' query=' + query);

    this.ws.call(api + '/' + verb, query).then(this.replyok, this.replyerr);
  }

  constructor() {

  }
}
