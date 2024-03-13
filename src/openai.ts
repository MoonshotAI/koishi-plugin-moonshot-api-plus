import OpenAI from 'openai';
import { config } from './config'

export async function sendChatCompletionsRequest(message, config: config, openai: OpenAI) {
    for(let i = 1; i <= 3; i++) {
        console.log('try attempt ' + i);
        try {
        const completion = await openai.chat.completions.create({
            model: config.model,
            messages: message,
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            top_p: config.topP,
            frequency_penalty: config.frequencyPenalty,
            presence_penalty: config.presencePenalty,
            stop: config.stop,
        });
        return completion;
        } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
        }
    }
  }