import { useChatStore } from "@st/chat/chat-store";

export const useChat = () => {
  const prompt = useChatStore((state) => state.prompt);
  const promptFile = useChatStore((state) => state.promptFile);
  const loading = useChatStore((state) => state.loading);
  const error = useChatStore((state) => state.error);
  const addMessage = useChatStore((state) => state.addMessage);
  const setPromptFile = useChatStore((state) => state.setPromptFile);
  const sendPrompt = useChatStore((state) => state.sendPrompt);

  const onSendPrompt = async () => {
    if (!prompt.trim() || loading) return;
    addMessage({
      id: crypto.randomUUID(),
      prompt,
      role: "user",
      file: promptFile || undefined,
    });
    addMessage({
      id: crypto.randomUUID(),
      prompt: "",
      role: "assistant",
    });
    await sendPrompt();
    setPromptFile(null);
  };

  return {
    prompt,
    promptFile,
    loading,
    error,
    onSendPrompt,
  };
};
