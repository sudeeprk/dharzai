import type { Message } from 'ai/react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex items-start gap-4', !isAssistant && 'justify-end')}>
      {isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/20 text-primary">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3 shadow-sm',
          isAssistant
            ? 'bg-secondary'
            : 'bg-primary text-primary-foreground'
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none text-inherit prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-table:my-2 prose-table:w-full prose-th:p-2 prose-td:p-2 prose-th:border prose-td:border">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
      
      {!isAssistant && (
         <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-secondary">
              <User className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

ChatMessage.displayName = 'ChatMessage';
