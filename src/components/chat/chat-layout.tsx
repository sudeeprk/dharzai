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
  {
    title: "Got any creative ideas",
    subtitle: "for a 10 year old's birthday?",
  },
  { title: "Write a thank you note", subtitle: "to my interviewer" },
];

interface EmptyStateProps {
  append: (message: Omit<VercelChatMessage, "id">) => void;
}

const EmptyState = ({ append }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-between h-full max-h-full overflow-hidden">
    {/* Main content area - centered */}
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
      <p className="text-muted-foreground">
        Ask me anything! I can help you with a variety of tasks.
      </p>
    </div>

    {/* Prompt suggestions positioned at bottom */}
    <div className="w-full px-4 pb-4 flex-shrink-0">
      {/* Desktop: Grid layout */}
      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-md mx-auto">
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
            <p className="font-semibold text-sm">{prompt.title}</p>
            <p className="text-xs text-muted-foreground">{prompt.subtitle}</p>
          </Button>
        ))}
      </div>
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
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    stop,
    data,
    append,
    error,
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
      setFileError(null);
      if (!currentChatId) {
        router.refresh();
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setFileError("Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFileError(null);

    // Debug logging
    console.log("Submitting with:", {
      hasFile: !!filePreview,
      filePreview: filePreview?.substring(0, 50) + "...",
      chatId: currentChatId,
      isWebSearchEnabled,
    });

    originalHandleSubmit(e, {
      body: {
        chatId: currentChatId,
        file: filePreview,
        isWebSearchEnabled,
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);

    if (selectedFile) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(selectedFile.type)) {
        setFileError(
          "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
        );
        return;
      }

      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;
        console.log("File loaded:", {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          dataUrlLength: result.length,
          dataUrlStart: result.substring(0, 50),
        });
        setFilePreview(result);
      };

      reader.onerror = () => {
        setFileError("Failed to read file. Please try again.");
        setFile(null);
        setFilePreview(null);
      };

      reader.readAsDataURL(selectedFile);
    }
  };

  const onFileRemove = () => {
    setFile(null);
    setFilePreview(null);
    setFileError(null);
    // Reset the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
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
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pt-20 md:pt-[100px]"
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
        {/* Show file error */}
        {fileError && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {fileError}
          </div>
        )}

        {/* Show general error */}
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            Error: {error.message}
          </div>
        )}

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
