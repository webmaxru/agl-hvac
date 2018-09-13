import { Component } from '@angular/core';
import AFB from './afb-websocket.service.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  afb;
  ws;

  // docker exec -ti 01ce761ed0a6 bash
  // source /etc/profile.d/AGL-agl-app-framework-binder.sh
  // afb-daemon --port=1111 --name=afb-hvac_mockup --workdir=/tmp/agl-services-hvac-mockup/build/package --ldpaths=lib --roothttp=htdocs --token= -vvv --monitoring
  // https://gerrit.automotivelinux.org/gerrit/gitweb?p=apps/agl-service-radio.git;a=blob;f=conf.d/project/htdocs/index.html;h=4efa887164d3d2e3d2fb1139efd4ecd4aaf3ff7d;hb=HEAD

  callbinder(api, verb, query) {
    console.log('api=' + api + ' verb=' + verb + ' query=' + query);

    this.ws.call(api + '/' + verb, query).then(this.replyok, this.replyerr);
  }

  checkband() {
    this.callbinder('hvac_mockup', 'set-temperature-zone1', {
      temperature: 10
    });
  }

  connect() {
    this.afb = new AFB('46560ff6.ngrok.io', 'api', 'mysecret');
    this.ws = new this.afb.ws(
      () => {
        this.callbinder('hvac_mockup', 'auth', '');

        this.ws.onevent('*', this.gotevent);
        this.callbinder('hvac_mockup', 'get-temperature', '');
      },
      () => {
        // Unsubscribe?
      }
    );
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

  constructor() {}
}
