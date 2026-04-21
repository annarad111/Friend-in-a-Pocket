import { geminiProvider } from './providers/geminiProvider';
import { ChatMessage } from '../types/chat';
import { StoredOnboardingProfile } from '../types/shared';

export async function generateAssistantReply(
  userInput: string,
  history: ChatMessage[] = [],
  profile: StoredOnboardingProfile | null = null
) {
  return geminiProvider.generateReply(userInput, history, profile);
}