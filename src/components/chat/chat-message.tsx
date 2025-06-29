import type { Message } from 'ai/react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  // The Vercel AI SDK's useChat hook provides streaming content.
  // The loading state is implicitly handled by the text streaming in.
  // We no longer need the explicit "loading dots" indicator.

  return (
    <div
      className={cn('flex items-start gap-4', {
        'flex-row-reverse': !isAssistant,
      })}
    >
      <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={cn(isAssistant && "bg-primary/20 text-primary")}>
             {isAssistant ? <Sparkles className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'max-w-[85%] rounded-lg p-3 text-sm shadow-sm',
          isAssistant
            ? 'bg-card text-card-foreground'
            : 'bg-primary/95 text-primary-foreground'
        )}
      >
        <div 
          className="prose prose-sm max-w-none text-inherit prose-p:my-0" 
          dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} 
        />
      </div>
    </div>
  );
}
