import { create } from "zustand";
import { ChatMessage, SocketStatus } from "@/types/chat";

type ChatStore = {
  messages: ChatMessage[];
  input: string;
  socketStatus: SocketStatus;
  isTyping: boolean;
  errorMessage: string | null;
  friendName: string;

  setInput: (value: string) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setSocketStatus: (status: SocketStatus) => void;
  setFriendName: (friendName: string) => void;
  setTyping: (value: boolean) => void;
  setErrorMessage: (value: string | null) => void;
  resetChat: () => void;
};

const createInitialMessage = (): ChatMessage => ({
  id: crypto.randomUUID(),
  sender: "assistant",
  text: `Hi, I'm here to help you reflect on emotional patterns, attachment dynamics, and self-understanding. This is a reflective space, not a diagnosis tool.`,
  createdAt: new Date().toISOString(),
});

export const useChatStore = create<ChatStore>((set) => ({
  messages: [createInitialMessage()],
  input: "",
  socketStatus: "idle",
  isTyping: false,
  errorMessage: null,
  friendName: "Friend in a Pocket",

  setInput: (value) => set({ input: value }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  setSocketStatus: (status) => set({ socketStatus: status }),

  setTyping: (value) => set({ isTyping: value }),

  setErrorMessage: (value) => set({ errorMessage: value }),

  setFriendName: (friendName) => {
    console.log('Setting friend name:', friendName);
    set({ friendName });
  },

  resetChat: () =>
    set((state) => ({
      messages: [createInitialMessage()],
      input: "",
      socketStatus: state.socketStatus,
      isTyping: false,
      errorMessage: null,
    })),
}));
