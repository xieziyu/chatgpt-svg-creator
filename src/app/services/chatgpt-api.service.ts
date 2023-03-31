import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { Message } from '../types';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ChatGPTAPIService {
  constructor(
    private config: ConfigService,
    private http: HttpClient,
    private messageSvc: MessageService
  ) {}

  async doChat(messages: Message[]): Promise<string> {
    const apiKey = await this.config.get('openAPIKey');
    if (!apiKey) {
      this.messageSvc.add({
        severity: 'warn',
        summary: 'Missing API Key',
        detail: 'Please update your openAPIKey in Settings.',
      });
      return '';
    }
    const apiHost = await this.config.get('openAPIHost');
    const currentModel = await this.config.get('currentModel');
    const apiURL = `${apiHost}/v1/chat/completions`;
    const data = {
      model: currentModel,
      messages: messages,
      max_tokens: 2048,
      temperature: 0.5,
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
    try {
      const rsp$ = this.http.post<any>(apiURL, data, { headers });
      const rsp = await lastValueFrom(rsp$);
      return rsp.choices[0].message.content.trim();
    } catch (err) {
      console.error(err);
      this.messageSvc.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed call openai api',
      });
      return '';
    }
  }
}
