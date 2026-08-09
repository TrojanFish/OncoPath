import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
// The SDK automatically picks up GEMINI_API_KEY from process.env
const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI(apiKey ? { apiKey } : {});
