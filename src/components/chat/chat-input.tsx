import { ArrowUp, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Image from 'next/image';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  filePreview: string | null;
  onFileRemove: () => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onFileChange,
  file,
  filePreview,
  onFileRemove,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full flex-col items-start gap-2"
    >
      {filePreview && (
        <div className="relative w-24 h-24 rounded-md overflow-hidden border">
          <Image
            src={filePreview}
            alt="Image preview"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white hover:bg-black/75"
            onClick={onFileRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="relative flex w-full items-end">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/*"
        />
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 bottom-1.5 h-9 w-9 rounded-lg"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        aria-label="Attach file"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Attach an image</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="flex-1 resize-none pl-14 pr-14 text-base rounded-xl py-3 px-4 shadow-sm max-h-48 overflow-y-auto"
          rows={1}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 bottom-1.5 h-9 w-9 rounded-lg"
          disabled={isLoading || (!input.trim() && !file)}
          aria-label="Send message"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
