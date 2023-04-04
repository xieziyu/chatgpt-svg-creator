export type Message = { role: string; content: string };

export type StreamingResult = { content: string; done: boolean };

export const enum GPTModels {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
}
