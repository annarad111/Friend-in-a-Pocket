import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from './systemPrompt';
import { sanitizeInput } from '../utils/sanitizeInput';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export async function generateAssistantReply(userInput: string) {
  const cleanedInput = sanitizeInput(userInput);

  if (!cleanedInput) {
    return 'I did not receive a valid message. Please try again with a little more detail.';
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: cleanedInput,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  });

  return response.text?.trim() || 'I’m sorry, I could not generate a response right now.';
}