import OpenAI from 'openai';
import { config } from './config';
export declare function sendChatCompletionsRequest(message: any, config: config, openai: OpenAI): Promise<OpenAI.Chat.Completions.ChatCompletion>;
