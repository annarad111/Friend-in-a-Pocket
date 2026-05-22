import { StoredOnboardingProfile } from '@/types/onboarding';

export type Sender = 'user' | 'assistant' | 'system';

export type SocketStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  createdAt: string;
};

export type BirthChartPayload = {
  sunSign: string;
  moonSign?: string;
  ascendant?: string;
};

export type ClientEvent =
  | { type: 'session:start' }
  | {
      type: 'chat:send';
      payload: {
        text: string;
        history: ChatMessage[];
        profile: StoredOnboardingProfile | null;
        birthChart?: BirthChartPayload | null;
      };
    };

export type ServerEvent =
  | { type: 'chat:message'; payload: ChatMessage }
  | { type: 'chat:typing'; payload: { value: boolean } }
  | { type: 'system:error'; payload: { message: string } };