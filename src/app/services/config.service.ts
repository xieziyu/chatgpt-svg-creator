import { Injectable } from '@angular/core';
import { Observable, of, from, map, lastValueFrom } from 'rxjs';
import * as Browser from 'webextension-polyfill';
import { GPTModels } from '../types';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  modelList = [GPTModels.GPT_3_5_TURBO, GPTModels.GPT_4, GPTModels.GPT_4_32K];

  private configs: Record<string, any> = {
    openAPIKey: '',
    openAPIHost: 'https://api.openai.com',
    currentModel: GPTModels.GPT_3_5_TURBO,
    temperature: 0.5,
  };
  private init$?: Observable<void>;

  constructor() {}

  private async init() {
    this.configs = await Browser.storage.sync.get(this.configs);
    return;
  }

  async get(key: string) {
    if (!this.init$) {
      this.init$ = from(this.init());
    }
    return lastValueFrom(this.init$.pipe(map(() => this.configs[key])));
  }

  async set(key: string, value: any) {
    this.configs[key] = value;
    await Browser.storage.sync.set(this.configs);
  }
}
