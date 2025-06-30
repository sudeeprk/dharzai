import type { Message } from 'ai/react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../ui/button';
import { useState } from 'react';

export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === 'assistant';
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex items-start gap-4 group/message', !isAssistant && 'justify-end')}>
      {isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/20 text-primary">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col max-w-[85%]', isAssistant ? 'items-start' : 'items-end')}>
        <div
          className={cn(
            'space-y-2 rounded-lg p-3 shadow-sm',
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

        {isAssistant && (
            <div className="flex items-center pt-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                <Button
                    onClick={onCopy}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                >
                    {hasCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </Button>
            </div>
        )}
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
