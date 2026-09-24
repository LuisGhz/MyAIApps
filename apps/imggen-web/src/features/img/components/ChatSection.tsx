import { useChatStore } from "@st/chat/chat-store";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { Alert } from "antd";
import { useEffect, useRef } from "react";

export const ChatSection = () => {
  const messages = useChatStore((state) => state.messages);
  const error = useChatStore((state) => state.error);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth p-4"
    >
      {messages.map((msg, index) =>
        msg.role === "user" ? (
          <UserMessage key={index} msg={msg} />
        ) : (
          <AssistantMessage key={index} msg={msg} />
        )
      )}
      {error && (
        <div className="p-4">
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            onClose={() => useChatStore.setState({ error: null })}
          />
        </div>
      )}
    </section>
  );
};
