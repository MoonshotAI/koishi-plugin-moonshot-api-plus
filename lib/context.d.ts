export interface Message {
    role: string;
    content: string;
}
export declare const useHistory: (sessionId: string) => Message[];
export declare const setHistory: (sessionId: string, historyMessages: Message[]) => void;
export declare const kimiuseHistory: (sessionId: string) => Message[];
export declare const kimisetHistory: (sessionId: string, historyMessages: Message[]) => void;
