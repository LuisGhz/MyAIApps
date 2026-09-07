import type { ChatMessage } from "@st/chat/chat-store.type";

type UserMessageProps = {
  msg: ChatMessage;
};

export const UserMessage = ({ msg }: UserMessageProps) => {
  return (
    <div className={`p-2 flex flex-col items-end`}>
      {msg.file && (
        <img
          className="max-h-48 w-auto mb-2 rounded"
          src={msg.file instanceof File ? URL.createObjectURL(msg.file) : msg.file}
          alt="Message Attachment"
        />
      )}
      <p className="inline-block p-2 rounded text-white bg-blue-500 dark:bg-gray-950 mb-1">
        {msg.prompt}
      </p>
    </div>
  );
};
