import { chatApi, type GenerateImageRequest } from "@/services";
import type { ChatStoreType, ChatMessage } from "../chat-store.type";

export const sendPromptAction = async (
  get: () => ChatStoreType,
  set: (state: Partial<ChatStoreType> | ((state: ChatStoreType) => Partial<ChatStoreType>)) => void
) => {
  console.log("init action");
  const state = get();
  const prompt = state.prompt;
  const file = state.promptFile || undefined;
  const model = state.model;
  const options = model.startsWith("gpt") ? state.gptOptions : state.nanoBananaOptions;

  const promptToSend = `${prompt}`;

  set({ loading: true, error: null, prompt: "" });
  try {
    const req: GenerateImageRequest = {
      prompt: promptToSend,
      file: file || undefined,
      model,
      options,
    };
    const lastAssistantGeneratedImage = state.lastAssistantGeneratedImage;
    if (lastAssistantGeneratedImage) req.lastAssistantGeneratedImage = lastAssistantGeneratedImage;

    const response = await chatApi.generateImage(req);

    const assistantMessage = state.messages[state.messages.length - 1];
    assistantMessage.file = response.file || undefined;
    assistantMessage.key = response.key;

    if (response.file && response.key)
      set({
        lastAssistantGeneratedImage: {
          file: response.file,
          key: response.key,
        },
      });

    set((state) => ({
      messages: [...state.messages.slice(0, -1), assistantMessage],
      loading: false,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
    set({
      error: errorMessage,
      loading: false,
    });

    const errorChatMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      prompt: `Error: ${errorMessage}`,
    };

    set((state) => ({
      messages: [...state.messages.slice(0, -1), errorChatMessage],
    }));
  }
};
