import { Input } from "antd";
import { PaperClipOutlined, ReloadOutlined, SendOutlined } from "@ant-design/icons";
import { useChatStore } from "@st/chat/chat-store";
import { PromptFilePreview } from "./PromptFilePreview";
import { useChat } from "@img/hooks";
import { useRef } from "react";
import { ModelConfig } from "./ModelConfig";

const { TextArea } = Input;

export const InputSection = () => {
  const inputFile = useRef<HTMLInputElement>(null);
  const prompt = useChatStore((state) => state.prompt);
  const messages = useChatStore((state) => state.messages);
  const setPrompt = useChatStore((state) => state.setPrompt);
  const setPromptFile = useChatStore((state) => state.setPromptFile);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const { onSendPrompt, loading } = useChat();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setPromptFile(e.target.files[0]);
  };

  const hasAssistantResponse = messages.length >= 2 && messages.some((msg) => msg.role === "assistant");
  const shouldShowReload = !prompt && hasAssistantResponse;

  return (
    <section className="mt-1.5">
      <PromptFilePreview />
      <ModelConfig />
      <div className="p-2 flex gap-4 items-center">
        <input className="hidden" ref={inputFile} type="file" onChange={handleFileSelect} />
        <button
          className="flex items-center justify-center cursor-pointer wcag-outline hocusvi:bg-gray-950 transc200 w-12 h-12 rounded-full"
          type="button"
          onClick={() => inputFile.current?.click()}
        >
          <PaperClipOutlined className="text-2xl text-white!" />
        </button>
        <TextArea
          autoSize={{ minRows: 3, maxRows: 5 }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          className="flex items-center justify-center cursor-pointer wcag-outline-vi hocusvi:bg-gray-950 transc200 w-12 h-12 rounded-full"
          type="button"
          onClick={shouldShowReload ? clearMessages : onSendPrompt}
          disabled={loading}
        >
          {shouldShowReload ? (
            <ReloadOutlined className="text-2xl text-white!" />
          ) : (
            <SendOutlined className="text-2xl text-white!" />
          )}
        </button>
      </div>
    </section>
  );
};
