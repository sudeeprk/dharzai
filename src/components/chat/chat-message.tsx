"use client";

import type { Message } from "ai/react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../ui/button";
import { useState } from "react";
import Image from "next/image";

interface ChatMessageProps {
  message: Message;
  imageUrl?: string | null;
}

export function ChatMessage({ message, imageUrl }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 group/message",
        !isAssistant && "justify-end"
      )}
    >
      <div
        className={cn(
          "flex flex-col",
          isAssistant ? "items-start" : "items-end"
        )}
      >
        <div
          className={cn(
            "space-y-2 rounded-lg p-3",
            isAssistant
              ? ""
              : "dark:bg-[#242628] bg-gray-100 dark:text-white text-black"
          )}
        >
          {imageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden border">
              <Image
                src={imageUrl}
                alt="User upload"
                width={300}
                height={300}
                className="object-contain"
                unoptimized
              />
            </div>
          )}
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
    </div>
  );
}

ChatMessage.displayName = "ChatMessage";
