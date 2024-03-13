"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kimisetHistory = exports.kimiuseHistory = exports.setHistory = exports.useHistory = void 0;
const historyMessageMap = {};
const useHistory = (sessionId) => {
    if (!sessionId) {
        throw new Error('Invalid session id for useHistory.');
    }
    if (historyMessageMap[sessionId]) {
        return historyMessageMap[sessionId];
    }
    historyMessageMap[sessionId] = [];
    return historyMessageMap[sessionId];
};
exports.useHistory = useHistory;
const setHistory = (sessionId, historyMessages) => {
    if (Array.isArray(historyMessages)) {
        historyMessageMap[sessionId] = historyMessages;
    }
};
exports.setHistory = setHistory;
const kimihistoryMessageMap = {};
const kimiuseHistory = (sessionId) => {
    if (!sessionId) {
        throw new Error('Invalid session id for useHistory.');
    }
    if (kimihistoryMessageMap[sessionId]) {
        return kimihistoryMessageMap[sessionId];
    }
    kimihistoryMessageMap[sessionId] = [];
    return kimihistoryMessageMap[sessionId];
};
exports.kimiuseHistory = kimiuseHistory;
const kimisetHistory = (sessionId, historyMessages) => {
    if (Array.isArray(historyMessages)) {
        kimihistoryMessageMap[sessionId] = historyMessages;
    }
};
exports.kimisetHistory = kimisetHistory;
