import type { ChatMessage } from "@st/chat/chat-store.type";
import "./AssistantMessage.css";
import { DownloadOutlined } from "@ant-design/icons";

type UserMessageProps = {
  msg: ChatMessage;
};

export const AssistantMessage = ({ msg }: UserMessageProps) => {
  const handleDownload = () => {
    if (!msg.file || !msg.key) return;

    const url = msg.file instanceof File ? URL.createObjectURL(msg.file) : msg.file;
    const link = document.createElement("a");
    link.href = url;
    link.download = `${msg.key}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (msg.file instanceof File) {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`p-2 flex flex-col items-start`}>
      {msg.file === undefined && (
        <div className={`rotatingText p-2 rounded text-app`}>
          <p className="textItem">Image generation in progress...</p>
          <p className="textItem">I'm working on it!</p>
          <p className="textItem">Be patient while we create your image!</p>
        </div>
      )}
      {msg.file && (
        <div className="relative inline-block group overflow-hidden rounded shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
          <img
            className="max-h-80 w-auto rounded"
            src={msg.file instanceof File ? URL.createObjectURL(msg.file) : msg.file}
            alt="Message Attachment"
          />
          <button
            className="absolute bottom-2 right-2 py-1 px-2 bg-black/25 hocusvi:bg-black/45 transition-colors duration-200 cursor-pointer text-sm font-medium rounded"
            type="button"
            onClick={handleDownload}
          >
            <DownloadOutlined className="text-white! text-xl" />
          </button>
        </div>
      )}
    </div>
  );
};
