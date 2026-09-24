import { create } from "zustand";
import type {
  ChatMessage,
  ChatStoreType,
  GptOptionsType,
  NanoBananaOptionsType,
} from "./chat-store.type";
import { sendPromptAction } from "./actions/send-prompt.action";

export const useChatStore = create<ChatStoreType>((set, get) => ({
  prompt: "",
  promptFile: null,
  model: "gpt-image-1.5",
  gptOptions: {
    size: "1024x1024",
    quality: "medium",
    style: "natural",
  },
  nanoBananaOptions: {
    size: "1K",
    aspectRatio: "1:1",
  },
  messages: [],
  loading: false,
  error: null,
  setPrompt: (prompt: string) => set({ prompt }),
  setPromptFile: (file: File | null) => set({ promptFile: file }),
  setModel: (model: string) => set({ model }),
  setGptOptions: (options: Partial<GptOptionsType>) =>
    set((state) => ({
      gptOptions: { ...state.gptOptions, ...options },
    })),
  setNanoBananaOptions: (options: Partial<NanoBananaOptionsType>) =>
    set((state) => ({
      nanoBananaOptions: { ...state.nanoBananaOptions, ...options },
    })),
  resetModelOptions: () =>
    set({
      gptOptions: {
        size: "1024x1024",
        quality: "medium",
      },
      nanoBananaOptions: {
        size: "1K",
        aspectRatio: "1:1",
      },
    }),
  addMessage: (message: ChatMessage) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  sendPrompt: () => sendPromptAction(get, set),
  setLastAssistantGeneratedImage: (image) => set({ lastAssistantGeneratedImage: image }),
}));
