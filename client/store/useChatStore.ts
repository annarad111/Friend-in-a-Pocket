import { create } from 'zustand';
import { ChatMessage, SocketStatus } from '@/types/chat';

type ChatStore = {
  messages: ChatMessage[];
  input: string;
  socketStatus: SocketStatus;
  isTyping: boolean;
  errorMessage: string | null;

  setInput: (value: string) => void;
  addMessage: (message: ChatMessage) => void;
  setSocketStatus: (status: SocketStatus) => void;
  setTyping: (value: boolean) => void;
  setErrorMessage: (value: string | null) => void;
  resetChat: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  input: '',
  socketStatus: 'idle',
  isTyping: false,
  errorMessage: null,

  setInput: (value) => set({ input: value }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setSocketStatus: (status) => set({ socketStatus: status }),

  setTyping: (value) => set({ isTyping: value }),

  setErrorMessage: (value) => set({ errorMessage: value }),

  resetChat: () =>
    set({
      messages: [],
      input: '',
      socketStatus: 'idle',
      isTyping: false,
      errorMessage: null,
    }),
}));