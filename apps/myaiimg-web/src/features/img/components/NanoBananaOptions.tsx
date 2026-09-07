import { useChatStore } from "@/store/chat/chat-store";
import { Select } from "antd";

export const NanoBananaOptions = () => {
  const { size, aspectRatio } = useChatStore((state) => state.nanoBananaOptions);
  const setNanoBananaOptions = useChatStore((state) => state.setNanoBananaOptions);

  return (
    <div className="flex gap-2">
      <Select
        placeholder="Size"
        style={{
          width: 100,
        }}
        value={size}
        onChange={(value) => setNanoBananaOptions({ size: value })}
        options={[
          {
            value: "1K",
            label: "1K",
          },
          {
            value: "2K",
            label: "2K",
          },
          {
            value: "4K",
            label: "4K",
          },
        ]}
      />
      <Select
        placeholder="Aspect Ratio"
        style={{
          width: 100,
        }}
        value={aspectRatio}
        onChange={(value) => setNanoBananaOptions({ aspectRatio: value })}
        options={[
          {
            label: "Landscape",
            options: [
              {
                value: "21:9",
                label: "21:9",
              },
              {
                value: "16:9",
                label: "16:9",
              },
              {
                value: "4:3",
                label: "4:3",
              },
              {
                value: "3:2",
                label: "3:2",
              },
            ],
          },
          {
            label: "Square",
            options: [
              {
                value: "1:1",
                label: "1:1",
              },
            ],
          },
          {
            label: "Portrait",
            options: [
              {
                value: "9:16",
                label: "9:16",
              },
              {
                value: "3:4",
                label: "3:4",
              },
              {
                value: "2:3",
                label: "2:3",
              },
            ],
          },
          {
            label: "Flexible",
            options: [
              {
                value: "5:4",
                label: "5:4",
              },
              {
                value: "4:5",
                label: "4:5",
              },
            ],
          },
        ]}
      />
    </div>
  );
};
