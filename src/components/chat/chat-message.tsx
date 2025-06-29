import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

function LoadingDots() {
    return (
        <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
        </div>
    );
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

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
        {isLoading 
            ? <LoadingDots /> 
            : <div className="prose prose-sm max-w-none text-inherit prose-p:my-0" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
        }
      </div>
    </div>
  );
}
