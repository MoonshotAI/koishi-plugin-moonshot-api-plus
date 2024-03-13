export interface config {
    apiKey: string;
    apiAddress: string;
    model: "moonshot-v1-8k" | "moonshot-v1-32k" | "moonshot-v1-128k";
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    stop: string[];
    errorMessage: string;
    triggerWordChat: string;
    triggerWordGame: string;
    stableDiffusionMode: boolean;
    stableDiffusionAPI: string;
}
