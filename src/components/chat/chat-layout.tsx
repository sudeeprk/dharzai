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
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { getPresignedUrl } from "@/actions/r2";
import { v4 as uuidv4 } from "uuid";

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
  append: (
    message: Omit<VercelChatMessage, "id">,
    options?: {
      body?: Record<string, any>;
    }
  ) => void;
}

const EmptyState = ({ append }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4">
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

type InitialMessage = VercelChatMessage & { imageUrl?: string | null };

interface ChatLayoutProps {
  initialMessages?: InitialMessage[];
  chatId?: string;
  user: User | null;
}

export function ChatLayout({
  initialMessages = [],
  chatId: initialChatId,
  user,
}: ChatLayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(initialChatId);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);

  const [imageUrlMap, setImageUrlMap] = useState<Map<string, string | null>>(
    new Map(initialMessages.map((msg) => [msg.id, msg.imageUrl ?? null]))
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    stop,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialMessages: initialMessages.map(({ imageUrl, ...rest }) => rest), // useChat doesn't know about imageUrl
    onResponse: (response) => {
      if (response.status === 401) {
        console.error("Unauthorized");
      }
      const newChatId = response.headers.get("X-Chat-ID");
      if (user) {
        if (!currentChatId && newChatId) {
          window.history.pushState(null, "", `/chat/${newChatId}`);
          setCurrentChatId(newChatId);
          router.refresh(); // This will re-fetch server components and get the new chat in the sidebar
        }
      }
    },
    onFinish: () => {
      if (!currentChatId) {
        router.refresh();
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && !uploadedImageUrl) return;

    const newMessageId = nanoid();

    if (uploadedImageUrl) {
      setImageUrlMap((prev) =>
        new Map(prev).set(newMessageId, uploadedImageUrl)
      );
    }

    append(
      { id: newMessageId, role: "user", content: input },
      {
        body: {
          chatId: currentChatId,
          imageUrl: uploadedImageUrl,
          isWebSearchEnabled,
        },
      }
    );

    setFilePreview(null);
    setUploadedImageUrl(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image size should be less than 5MB",
      });
      return;
    }

    setIsUploading(true);
    setFilePreview(URL.createObjectURL(file));

    try {
      const fileExtension = file.name.split(".").pop();
      const uniqueKey = `${uuidv4()}.${fileExtension}`;

      const { result, error } = await getPresignedUrl(uniqueKey);

      if (error || !result?.presignedUrl || !result?.publicUrl) {
        throw new Error((error as any)?.message || "Failed to get upload URL");
      }

      const response = await fetch(result.presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload file to R2");
      }

      setUploadedImageUrl(result.publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: (error as Error).message || "Could not upload image.",
      });
      setFilePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const onFileRemove = () => {
    setFilePreview(null);
    setUploadedImageUrl(null);
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
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pt-20 md:pt-[150px]"
      >
        {messages.length > 0 ? (
          <>
            {showWebSearchStatus && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground animate-in fade-in duration-500">
                <Search className="h-4 w-4 animate-spin" />
                <span>Searching the web...</span>
              </div>
            )}
            <ChatMessages messages={messages} imageUrlMap={imageUrlMap} />
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
          isUploading={isUploading}
          stop={stop}
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
