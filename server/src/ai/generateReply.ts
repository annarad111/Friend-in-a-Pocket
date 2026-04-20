import { geminiProvider } from './providers/geminiProvider';
import { ChatMessage } from '../types/chat';

export async function generateAssistantReply(userInput: string, history: ChatMessage[] = []) {
  return geminiProvider.generateReply(userInput, history);
}