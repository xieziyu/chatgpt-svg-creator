import { Component, OnInit, OnDestroy } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { LayoutService } from 'src/app/services/layout.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  apiKey = '';
  apiKeyUpdate$ = new Subject<string>();
  apiHost = '';
  apiHostUpdate$ = new Subject<string>();
  modelOptions: { label: string; value: string }[] = [];
  currentModel = '';
  currentModel$ = new Subject<string>();
  temperature = 0.5;
  temperatureUpdate$ = new Subject<number>();

  constructor(public layoutService: LayoutService, private config: ConfigService) {}

  get visible(): boolean {
    return this.layoutService.state.configSidebarVisible;
  }

  set visible(_val: boolean) {
    this.layoutService.state.configSidebarVisible = _val;
  }

  ngOnInit() {
    this.apiKeyUpdate$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(key => this.onAPIKeyChange(key));
    this.currentModel$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(m => this.onCurrentModelChange(m));
    this.apiHostUpdate$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(m => this.onAPIHostChange(m));
    this.temperatureUpdate$
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(m => this.onTemperatureChange(m));
    this.config.get('openAPIKey').then(key => {
      this.apiKey = key;
    });
    this.config.get('currentModel').then(model => {
      this.currentModel = model;
    });
    this.config.get('openAPIHost').then(host => {
      this.apiHost = host;
    });
    this.config.get('temperature').then(t => {
      this.temperature = t;
    });
    this.modelOptions = this.config.modelList.map(m => ({
      label: m,
      value: m,
    }));
  }

  ngOnDestroy() {
    this.apiKeyUpdate$.unsubscribe();
    this.currentModel$.unsubscribe();
    this.apiHostUpdate$.unsubscribe();
  }

  onConfigButtonClick() {
    this.layoutService.showConfigSidebar();
  }

  private onAPIKeyChange(key: string) {
    this.apiKey = key;
    this.config.set('openAPIKey', key);
  }

  private onCurrentModelChange(m: string) {
    this.currentModel = m;
    this.config.set('currentModel', m);
  }

  private onAPIHostChange(h: string) {
    this.apiHost = h;
    this.config.set('openAPIHost', h);
  }

  private onTemperatureChange(t: number) {
    this.temperature = t;
    this.config.set('temperature', t);
  }
}
