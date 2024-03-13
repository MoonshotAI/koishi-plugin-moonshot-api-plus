export interface Message {
    role: string
    content: string
}

const historyMessageMap: Record<string, Message[]> = {};

export const useHistory = (sessionId: string) => {
  if (!sessionId) {
    throw new Error('Invalid session id for useHistory.');
  }
  if (historyMessageMap[sessionId]) {
    return historyMessageMap[sessionId];
  }
  historyMessageMap[sessionId] = [];
  return historyMessageMap[sessionId];
};

export const setHistory = (sessionId: string, historyMessages: Message[]) => {
  if (Array.isArray(historyMessages)) {
    historyMessageMap[sessionId] = historyMessages;
  }
};

const kimihistoryMessageMap: Record<string, Message[]> = {};

export const kimiuseHistory = (sessionId: string) => {
  if (!sessionId) {
    throw new Error('Invalid session id for useHistory.');
  }
  if (kimihistoryMessageMap[sessionId]) {
    return kimihistoryMessageMap[sessionId];
  }
  kimihistoryMessageMap[sessionId] = [];
  return kimihistoryMessageMap[sessionId];
};

export const kimisetHistory = (sessionId: string, historyMessages: Message[]) => {
  if (Array.isArray(historyMessages)) {
    kimihistoryMessageMap[sessionId] = historyMessages;
  }
};