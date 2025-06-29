'use client';

import { useChat } from 'ai/react';
import type { Message as VercelChatMessage } from 'ai/react';
import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Sparkles, Bot } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import Link from 'next/link';

interface ChatLayoutProps {
  initialMessages?: VercelChatMessage[];
  chatId?: string;
  user: User | null;
}

const GuestHeader = () => (
  <div className="flex items-center justify-between p-4 border-b">
      <div className="flex justify-center items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Dharz AI</h1>
      </div>
      <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
              <Link href="/signup">Sign Up</Link>
          </Button>
      </div>
  </div>
);

const promptSuggestions = [
    { title: 'Explain quantum computing', subtitle: 'in simple terms' },
    { title: 'Got any creative ideas', subtitle: 'for a 10 year old’s birthday?' },
    { title: 'Write a thank you note', subtitle: 'to my interviewer' },
    { title: 'Help me debug a python script', subtitle: 'that\'s not working' },
];

interface EmptyStateProps {
    append: (message: Omit<VercelChatMessage, 'id'>) => void;
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
            className="h-auto text-left py-3"
            onClick={() => append({ role: 'user', content: `${prompt.title} ${prompt.subtitle}`.trim() })}
        >
            <p className="font-semibold">{prompt.title}</p>
            <p className="text-sm text-muted-foreground">{prompt.subtitle}</p>
        </Button>
    ))}
    </div>
  </div>
);

export function ChatLayout({
  initialMessages = [],
  chatId: initialChatId,
  user,
}: ChatLayoutProps) {
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, data, append } =
    useChat({
      api: '/api/chat',
      initialMessages,
      onResponse: (response) => {
        if (response.status === 401) {
          // Handle unauthorized access
          console.error('Unauthorized');
        }
      },
      onFinish: () => {
        setFile(null);
        setFilePreview(null);
        // If a user is logged in, we may need to update the UI
        if (user) {
          // If it was a brand new chat, we need to navigate to the new chat's URL
          if (!initialChatId) {
            const newChatId = (data as any[])?.find(d => d.chatId)?.chatId;
            if (newChatId) {
              router.push(`/chat/${newChatId}`);
            }
          }
          // In either case (new or existing chat), we refresh to update the sidebar
          router.refresh();
        }
      },
    });
    
  // Wrapper to explicitly pass chatId and filePreview on each submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    originalHandleSubmit(e, {
      options: {
        body: {
          chatId: initialChatId,
          file: filePreview,
        },
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
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative flex flex-col h-full">
       {!user && <GuestHeader />}
       <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length > 0 ? (
          <ChatMessages messages={messages} />
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
          file={file}
          filePreview={filePreview}
          onFileChange={handleFileChange}
          onFileRemove={onFileRemove}
        />
        <p className="text-center text-xs text-muted-foreground mt-2">
            Dharz AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
