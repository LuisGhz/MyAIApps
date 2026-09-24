import { useChatStore } from "@st/chat/chat-store";

export const PromptFilePreview = () => {
  const promptFile = useChatStore((state) => state.promptFile);
  return (
    <>
      {promptFile && (
        <img
          src={URL.createObjectURL(promptFile)}
          alt="Prompt Preview"
          className="h-16 w-auto mb-2 rounded"
        />
      )}
    </>
  );
};
