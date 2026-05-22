import { generateReplyWithOpenRouter } from './providers/openrouterProvider';

export async function generateAssistantReply(
  userInput: string,
  history: any[] = [],
  profile: any = null,
  birthChart: any = null,
) {
  return generateReplyWithOpenRouter(userInput, history, profile, birthChart);
}
