import { ChatMessage } from '../types/chat';

export interface AIProvider {
  generateReply: (userInput: string, history?: ChatMessage[]) => Promise<string>;
}