import type { Message } from '@/lib/types';
import { ChatMessage } from './chat-message';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <ChatMessage message={message} />
        </div>
      ))}
      {isLoading && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <ChatMessage
            message={{ id: 'loading', role: 'assistant', content: '' }}
            isLoading={true}
          />
        </div>
      )}
    </div>
  );
}
