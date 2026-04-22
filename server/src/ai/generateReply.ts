import { generateReplyWithOpenRouter } from './providers/openRouterProvider';

export async function generateAssistantReply(
  userInput: string,
  history: any[] = [],
  profile: any = null
) {
  return generateReplyWithOpenRouter(userInput, history, profile);
}