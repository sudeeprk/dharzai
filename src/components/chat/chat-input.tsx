import {
  ArrowUp,
  Paperclip,
  X,
  Square,
  Search,
  Globe2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IoIosGlobe } from "react-icons/io";

interface ChatInputProps {
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isUploading: boolean;
  stop: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filePreview: string | null;
  onFileRemove: () => void;
  isWebSearchEnabled: boolean;
  onWebSearchChange: (enabled: boolean) => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isUploading,
  stop,
  onFileChange,
  filePreview,
  onFileRemove,
  isWebSearchEnabled,
  onWebSearchChange,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form && !isLoading && !isUploading) {
        const submitEvent = new Event("submit", {
          bubbles: true,
          cancelable: true,
        });
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
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          {!isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white hover:bg-black/75"
              onClick={onFileRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
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
        <div className="absolute left-2 bottom-1.5 flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isUploading}
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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all duration-200 ease-in-out",
                    isWebSearchEnabled
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  onClick={() => onWebSearchChange(!isWebSearchEnabled)}
                  disabled={isLoading || isUploading}
                  aria-label="Toggle web search"
                >
                  <IoIosGlobe
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isWebSearchEnabled && "scale-110"
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <IoIosGlobe className="h-4 w-4" />
                  <span>
                    {isWebSearchEnabled ? "Disable" : "Enable"} Web Search
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="flex-1 resize-none pl-24 pr-14 text-base rounded-xl py-3 px-4 shadow-sm max-h-48 overflow-y-auto"
          rows={1}
          disabled={isLoading || isUploading}
        />
        {isLoading ? (
          <Button
            type="button"
            onClick={stop}
            size="icon"
            className="absolute right-2 bottom-1.5 h-9 w-9 rounded-lg"
            aria-label="Stop generation"
          >
            <Square className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 bottom-1.5 h-9 w-9 rounded-lg"
            disabled={(!input.trim() && !filePreview) || isUploading}
            aria-label="Send message"
          >
            {isUploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
