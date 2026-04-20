import { ChatMessage } from '../types/chat';

export function formatConversation(history: ChatMessage[]) {
  if (!history.length) return 'No previous conversation.';

  return history
    .map((message) => {
      const role =
        message.sender === 'user'
          ? 'User'
          : message.sender === 'assistant'
          ? 'Assistant'
          : 'System';

      return `${role}: ${message.text}`;
    })
    .join('\n');
}