import {
  ArrowUp,
  Paperclip,
  X,
  Square,
  Search,
  Globe2,
  Loader2,
  Plus,
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
      const scrollHeight = textareaRef.current.scrollHeight;
      // Limit the height to max 6 lines (approximately 144px)
      const maxHeight = Math.min(scrollHeight, 144);
      textareaRef.current.style.height = `${maxHeight}px`;
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

      <div className="relative flex w-full flex-col border shadow-sm rounded-xl bg-background">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/*"
        />

        {/* Input field - First row */}
        <div className="px-4 pt-3 pb-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="w-full resize-none text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[24px] leading-6"
            rows={1}
            disabled={isLoading || isUploading}
          />
        </div>

        {/* Action buttons - Second row */}
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    aria-label="Attach file"
                  >
                    <Plus className="h-4 w-4" />
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
                      "h-8 w-8 rounded-lg transition-all duration-200 ease-in-out",
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
                        "h-4 w-4 transition-transform duration-200",
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

          {/* Submit/Stop button on the right */}
          {isLoading ? (
            <Button
              type="button"
              onClick={stop}
              size="icon"
              className="h-8 w-8 rounded-lg"
              aria-label="Stop generation"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={(!input.trim() && !filePreview) || isUploading}
              aria-label="Send message"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
