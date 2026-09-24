import { useChatStore } from "@/store/chat/chat-store";
import { Select } from "antd";

export const GptOptions = () => {
  const { size, quality } = useChatStore((state) => state.gptOptions);
  const setGptOptions = useChatStore((state) => state.setGptOptions);

  return (
    <div className="flex gap-2">
      <Select
        placeholder="Size"
        style={{
          width: 110,
        }}
        value={size}
        onChange={(value) => setGptOptions({ size: value })}
        options={[
          {
            value: "1024x1024",
            label: "1024x1024",
          },
          {
            value: "1536x1024",
            label: "1536x1024",
          },
          {
            value: "1024x1536",
            label: "1024x1536",
          },
        ]}
      />
      <Select
        placeholder="Quality"
        style={{
          width: 100,
        }}
        value={quality}
        onChange={(value) => setGptOptions({ quality: value })}
        options={[
          {
            value: "auto",
            label: "Auto",
          },
          {
            value: "low",
            label: "Low",
          },
          {
            value: "medium",
            label: "Medium",
          },
          {
            value: "high",
            label: "High",
          },
        ]}
      />
    </div>
  );
};
