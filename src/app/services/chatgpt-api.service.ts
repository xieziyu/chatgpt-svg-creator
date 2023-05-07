import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfigService } from './config.service';
import { Message, StreamingResult } from '../types';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ChatGPTAPIService {
  constructor(private config: ConfigService, private messageSvc: MessageService) {}

  async doChatStream(
    messages: Message[],
    sub: Subject<StreamingResult>,
    signal: AbortSignal
  ): Promise<boolean> {
    const apiKey = await this.config.get('openAPIKey');
    if (!apiKey) {
      this.messageSvc.add({
        severity: 'warn',
        summary: 'Missing API Key',
        detail: 'Please update your openAPIKey in Settings.',
      });
      return false;
    }
    const apiHost = await this.config.get('openAPIHost');
    const currentModel = await this.config.get('currentModel');
    const temperature = await this.config.get('temperature');
    const apiURL = `${apiHost}/v1/chat/completions`;
    const data = {
      model: currentModel,
      messages,
      max_tokens: 2048,
      temperature,
      stream: true,
    };
    try {
      const rsp = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
        signal,
      });
      if (!rsp.ok) {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed call openai api',
        });
        return false;
      }
      if (!rsp.body) {
        return true;
      }
      await this.parseSSE(rsp.body, sub);
    } catch (err: any) {
      this.messageSvc.add({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Failed call openai api',
      });
      return false;
    }
    return true;
  }

  async parseSSE(rs: ReadableStream, sub: Subject<StreamingResult>): Promise<void> {
    let readData;
    let partialMessage = '';
    let resultContent = '';
    const reader = rs.getReader();
    const decoder = new TextDecoder('utf-8');
    do {
      readData = await reader.read();
      if (!readData.done) {
        partialMessage += decoder.decode(readData.value, { stream: true });
        // Split the message by new lines
        const lines = partialMessage.split('\n');
        // If the last line is not empty, it means that it's an incomplete message
        if (lines[lines.length - 1] !== '') {
          partialMessage = lines.pop() ?? '';
        } else {
          partialMessage = '';
        }
        // Process each line
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonString = line.slice('data: '.length);
            // Check if the jsonString is not "[DONE]"
            if (jsonString !== '[DONE]') {
              const payload = JSON.parse(jsonString);
              resultContent += payload?.choices[0]?.delta?.content ?? '';
              sub.next({ content: resultContent, done: false });
            } else {
              sub.next({ content: resultContent, done: true });
              return;
            }
          }
        }
      }
    } while (!readData.done);
  }
}
