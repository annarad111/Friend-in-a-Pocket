import { ChatMessage } from '../types/chat';
import { StoredOnboardingProfile } from '../types/shared';

export interface AIProvider {
  generateReply: (
    userInput: string,
    history?: ChatMessage[],
    profile?: StoredOnboardingProfile | null
  ) => Promise<string>;
}