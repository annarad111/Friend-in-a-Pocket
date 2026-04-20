export type Sender = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  createdAt: string;
};

export type IncomingEvent =
  | { type: 'session:start' }
  | {
      type: 'chat:send';
      payload: {
        text: string;
        history: ChatMessage[];
      };
    };