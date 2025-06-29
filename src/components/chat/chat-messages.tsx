import type { Message } from 'ai/react';
import { ChatMessage } from './chat-message';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <ChatMessage message={message} />
        </div>
      ))}
      {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <ChatMessage message={{ id: 'loading', role: 'assistant', content: '...' }} />
        </div>
      )}
    </div>
  );
}
