import type { Message } from 'ai/react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { memo } from 'react';

// Using memo to prevent re-renders of messages that haven't changed
export const ChatMessage = memo(({ message }: { message: Message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className="flex items-start gap-4 py-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(isAssistant ? "bg-primary/20 text-primary" : "bg-secondary")}>
          {isAssistant ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="font-semibold">
          {isAssistant ? 'Dharz AI' : 'You'}
        </div>
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-inherit prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0"
          dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }}
        />
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
