import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  setInput,
  handleSendMessage,
  isLoading,
}: ChatInputProps) {
  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    handleSendMessage();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full max-w-2xl mx-auto items-center"
    >
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        className="flex-1 resize-none pr-14 text-base rounded-full py-3 px-5 shadow-sm"
        rows={1}
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full"
        disabled={isLoading || !input.trim()}
        aria-label="Send message"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </form>
  );
}
