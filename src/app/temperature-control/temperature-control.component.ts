import { Component, OnInit, Input } from '@angular/core';
import AFB from '../afb-websocket.service.js';

@Component({
  selector: 'app-temperature-control',
  templateUrl: './temperature-control.component.html',
  styleUrls: ['./temperature-control.component.css']
})
export class TemperatureControlComponent implements OnInit {
  afb;
  ws;

  @Input()
  zoneId: string;

  temperature: number = 0;
  modalOpened: boolean = false;

  maxTemp: number = 30;
  minTemp: number = 18;

  displayTemp: string = '';

  // docker exec -ti 01ce761ed0a6 bash
  // source /etc/profile.d/AGL-agl-app-framework-binder.sh
  // afb-daemon --port=1111 --name=afb-hvac_mockup --workdir=/tmp/agl-services-hvac-mockup/build/package --ldpaths=lib --roothttp=htdocs --token= -vvv --monitoring
  // https://gerrit.automotivelinux.org/gerrit/gitweb?p=apps/agl-service-radio.git;a=blob;f=conf.d/project/htdocs/index.html;h=4efa887164d3d2e3d2fb1139efd4ecd4aaf3ff7d;hb=HEAD

  callbinder(api, verb, query) {
    console.log('api=' + api + ' verb=' + verb + ' query=' + query);

    this.ws.call(api + '/' + verb, query).then(
      obj => {
        console.log(JSON.stringify(obj));

        if (obj.response) {
          let zoneInfo = obj.response.filter(response => {
            return response['name'] == `zone_${this.zoneId}`;
          });

          if (zoneInfo[0]) {
            this.temperature = zoneInfo[0]['temperature'];
            this.updateDisplayTemp(this.temperature)
          }
        }
      },
      obj => {
        this.modalOpened = true;
        console.log('replyerr:' + JSON.stringify(obj));
      }
    );
  }

  updateDisplayTemp(temperature) {
    if (temperature >= this.maxTemp) {
      this.temperature = this.maxTemp;
      this.displayTemp = 'HI';
    } else if (temperature <= this.minTemp) {
      this.temperature = this.minTemp;
      this.displayTemp = 'LO';
    } else {
      this.displayTemp = `${temperature}°C`;
    }
  }

  temperatureUp() {
    this.temperature++;
    this.updateDisplayTemp(this.temperature)

    this.callbinder('hvac_mockup', `set-temperature-zone${this.zoneId}`, {
      temperature: this.temperature
    });

    //this.modalOpened = true;
  }

  temperatureDown() {
    this.temperature--;
    this.updateDisplayTemp(this.temperature)

    this.callbinder('hvac_mockup', `set-temperature-zone${this.zoneId}`, {
      temperature: this.temperature
    });
  }

  connect() {
    this.afb = new AFB('localhost:32770', 'api', 'mysecret');
    this.ws = new this.afb.ws(
      () => {
        this.callbinder('hvac_mockup', 'auth', '');

        this.ws.onevent('*', obj => {
          console.log('gotevent:' + JSON.stringify(obj));
        });
        this.callbinder('hvac_mockup', 'get-temperature', '');
      },
      () => {
        // Unsubscribe?
      }
    );
  }

  constructor() {}

  ngOnInit() {
    this.connect();
  }
}
