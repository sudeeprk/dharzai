import type { Message } from "ai/react";
import { ChatMessage } from "./chat-message";

interface ChatMessagesProps {
  messages: Message[];
  imageUrlMap: Map<string, string | null>;
}

export function ChatMessages({ messages, imageUrlMap }: ChatMessagesProps) {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
        >
          <ChatMessage
            message={message}
            imageUrl={
              message.role === "user" ? imageUrlMap.get(message.id) : null
            }
          />
        </div>
      ))}
    </div>
  );
}
