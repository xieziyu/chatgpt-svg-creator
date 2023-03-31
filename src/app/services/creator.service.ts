import { Injectable } from '@angular/core';
import { Message } from '../types';
import { ChatGPTAPIService } from './chatgpt-api.service';

const SVG_REG_EXP: RegExp = /<svg[\s\S]*?<\/svg>/gi;

@Injectable({
  providedIn: 'root',
})
export class CreatorService {
  readonly systemPrompts: Message[] = [
    {
      role: 'user',
      content:
        'Please summarize and generate SVG code based on the description, and only return the SVG code itself. Reply "ok" to confirm.',
    },
    {
      role: 'assistant',
      content: 'ok',
    },
  ];

  constructor(private api: ChatGPTAPIService) {}

  async analyzeInput(msg: string, originalSVGCode: string) {
    let headMsg = '';
    if (originalSVGCode) {
      headMsg += `Given the original SVG: ${originalSVGCode}\n`;
    }
    const res = await this.api.doChat([
      ...this.systemPrompts,
      {
        role: 'user',
        content: headMsg + msg,
      },
    ]);
    return res;
  }

  // 提取 SVG 代码
  extractSVGCode(str: string) {
    const svgMatches: string[] = str.match(SVG_REG_EXP) || [];
    return svgMatches;
  }

  // 提取非 SVG 内容
  extractNonSVGCode(str: string) {
    return str.replace(SVG_REG_EXP, '').trim();
  }
}
