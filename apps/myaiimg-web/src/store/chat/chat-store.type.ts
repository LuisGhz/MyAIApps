export type ChatMessage = {
  id?: string;
  prompt: string;
  role: "user" | "assistant";
  file?: string | File;
  key?: string;
};

export type GptOptionsType = {
  size: "1024x1024" | "1536x1024" | "1024x1536";
  quality: "auto" | "low" | "medium" | "high";
};

export type NanoBananaOptionsType = {
  size: "1K" | "2K" | "4K";
  aspectRatio: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "9:16" | "3:4" | "2:3" | "5:4" | "4:5";
};

export type LastAssistantGeneratedImageType = {
  file: File;
  key: string;
};

export type ChatStoreType = {
  prompt: string;
  promptFile: File | null;
  model: string;
  gptOptions: GptOptionsType;
  nanoBananaOptions: NanoBananaOptionsType;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  lastAssistantGeneratedImage?: LastAssistantGeneratedImageType;
  setPrompt: (prompt: string) => void;
  setPromptFile: (file: File | null) => void;
  setModel: (model: string) => void;
  setGptOptions: (options: Partial<GptOptionsType>) => void;
  setNanoBananaOptions: (options: Partial<NanoBananaOptionsType>) => void;
  resetModelOptions: () => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  sendPrompt: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastAssistantGeneratedImage: (image: LastAssistantGeneratedImageType | undefined) => void;
};
