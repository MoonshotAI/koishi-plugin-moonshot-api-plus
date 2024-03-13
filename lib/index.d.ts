import { Context, Schema } from 'koishi';
import { config } from './config';
export declare const name = "openai-chatgpt";
export declare const Config: Schema<config>;
export declare function apply(ctx: Context, config: config): Promise<void>;
