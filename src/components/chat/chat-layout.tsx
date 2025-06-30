"use client";

import { useChat } from "@ai-sdk/react";
import type { Message as VercelChatMessage } from "@ai-sdk/react";
import type { User } from "next-auth";
import { useRouter } from "next/navigation";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Bot, Search } from "lucide-react";

const promptSuggestions = [
  { title: "Explain quantum computing", subtitle: "in simple terms" },
  {
    title: "Got any creative ideas",
    subtitle: "for a 10 year old's birthday?",
  },
  { title: "Write a thank you note", subtitle: "to my interviewer" },
  { title: "Help me debug a python script", subtitle: "that's not working" },
];

interface EmptyStateProps {
  append: (message: Omit<VercelChatMessage, "id">) => void;
}

const EmptyState = ({ append }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4">
    <Bot className="w-16 h-16 mb-4 text-primary" />
    <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
    <p className="text-muted-foreground mb-8">
      Ask me anything! I can help you with a variety of tasks.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
      {promptSuggestions.map((prompt, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto flex flex-col items-start text-left p-3"
          onClick={() =>
            append({
              role: "user",
              content: `${prompt.title} ${prompt.subtitle}`.trim(),
            })
          }
        >
          <p className="font-semibold">{prompt.title}</p>
          <p className="text-sm text-muted-foreground">{prompt.subtitle}</p>
        </Button>
      ))}
    </div>
  </div>
);

interface ChatLayoutProps {
  initialMessages?: VercelChatMessage[];
  chatId?: string;
  user: User | null;
}

export function ChatLayout({
  initialMessages = [],
  chatId: initialChatId,
  user,
}: ChatLayoutProps) {
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState(initialChatId);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    stop,
    data,
    append,
  } = useChat({
    api: "/api/chat",
    initialMessages,
    onResponse: (response) => {
      if (response.status === 401) {
        console.error("Unauthorized");
      }
      const newChatId = response.headers.get("X-Chat-ID");
      if (user) {
        if (!currentChatId && newChatId) {
          window.history.pushState(null, "", `/chat/${newChatId}`);
          setCurrentChatId(newChatId);
          router.refresh();
        }
      }
    },
    onFinish: (fin) => {
      setFile(null);
      setFilePreview(null);
      if (!currentChatId) {
        router.refresh();
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    originalHandleSubmit(e, {
      body: {
        chatId: currentChatId,
        file: filePreview,
        isWebSearchEnabled,
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFileRemove = () => {
    setFile(null);
    setFilePreview(null);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const showWebSearchStatus =
    isLoading &&
    isWebSearchEnabled &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "user";

  return (
    <div className="relative flex flex-col h-full">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
      >
        {messages.length > 0 ? (
          <>
            {showWebSearchStatus && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground animate-in fade-in duration-500">
                <Search className="h-4 w-4 animate-spin" />
                <span>Searching the web...</span>
              </div>
            )}
            <ChatMessages messages={messages} />
          </>
        ) : (
          <EmptyState append={append} />
        )}
      </div>
      <div className="p-4 md:p-6 bg-background border-t w-full max-w-2xl mx-auto">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          file={file}
          filePreview={filePreview}
          onFileChange={handleFileChange}
          onFileRemove={onFileRemove}
          isWebSearchEnabled={isWebSearchEnabled}
          onWebSearchChange={setIsWebSearchEnabled}
        />
        <p className="hidden md:block text-center text-xs text-muted-foreground pt-2">
          Dharz AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
