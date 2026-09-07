import { Select } from "antd";
import { GptOptions } from "./GptOptions";
import { NanoBananaOptions } from "./NanoBananaOptions";
import { useChatStore } from "@/store/chat/chat-store";
import { useEffect } from "react";

export const ModelConfig = () => {
  const model = useChatStore((state) => state.model);
  const setModel = useChatStore((state) => state.setModel);
  const resetModelOptions = useChatStore((state) => state.resetModelOptions);

  useEffect(() => {
    resetModelOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);
  return (
    <section className="flex gap-3 overflow-x-auto py-1 md:py-0">
      <Select
        style={{ minWidth: 150 }}
        placeholder="Model"
        value={model}
        onChange={(value) => setModel(value)}
        popupMatchSelectWidth={false}
        options={[
          {
            value: "gpt-image-1.5",
            label: "GPT Image 1.5",
          },
          {
            value: "gpt-image-1-mini",
            label: "GPT Image 1 mini",
          },
          {
            value: "gemini-2.5-flash-image",
            label: "Nano Banana",
          },
          {
            value: "gemini-3.1-flash-image-preview",
            label: "Nano Banana 2",
          },
          {
            value: "gemini-3-pro-image-preview",
            label: "Nano Banana Pro",
          },
        ]}
      />
      {model && (model.startsWith("gpt") ? <GptOptions /> : <NanoBananaOptions />)}
    </section>
  );
};
