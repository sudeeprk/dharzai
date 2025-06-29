import type { Message } from 'ai/react';
import { ChatMessage } from './chat-message';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <ChatMessage message={message} />
        </div>
      ))}
    </div>
  );
}
