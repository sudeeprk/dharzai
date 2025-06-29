import type { Message } from 'ai/react';
import { ChatMessage } from './chat-message';
import { Separator } from '../ui/separator';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      {messages.map((message, index) => (
        <div key={message.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <ChatMessage message={message} />
          {index < messages.length - 1 && <Separator />}
        </div>
      ))}
      {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <ChatMessage message={{ id: 'loading', role: 'assistant', content: '...' }} />
          <Separator />
        </div>
      )}
    </div>
  );
}
