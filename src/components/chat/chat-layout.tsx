'use client';

import { useChat } from 'ai/react';
import type { Message } from 'ai/react';
import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Sparkles, Bot } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import Link from 'next/link';

interface ChatLayoutProps {
  initialMessages?: Message[];
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

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <Bot className="w-16 h-16 mb-4 text-primary" />
    <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
    <p className="text-muted-foreground mb-8">
      Ask me anything! I can help you with a variety of tasks.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
      <Button variant="outline" className="h-auto text-left py-3">
        <p className="font-semibold">Explain quantum computing</p>
        <p className="text-sm text-muted-foreground">in simple terms</p>
      </Button>
      <Button variant="outline" className="h-auto text-left py-3">
        <p className="font-semibold">Got any creative ideas</p>
        <p className="text-sm text-muted-foreground">for a 10 year old’s birthday?</p>
      </Button>
      <Button variant="outline" className="h-auto text-left py-3">
        <p className="font-semibold">Write a thank you note</p>
        <p className="text-sm text-muted-foreground">to my interviewer</p>
      </Button>
      <Button variant="outline" className="h-auto text-left py-3">
        <p className="font-semibold">Help me debug a python script</p>
        <p className="text-sm text-muted-foreground">that's not working</p>
      </Button>
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

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      api: '/api/chat',
      initialMessages,
      body: {
        chatId: initialChatId,
      },
      onResponse: (response) => {
        if (response.status === 401) {
          // Handle unauthorized access
          console.error('Unauthorized');
        }
      },
      onFinish: () => {
        if (!initialChatId && user) {
          const newChatId = (data as any[])?.find(d => d.chatId)?.chatId;
          if (newChatId) {
            router.push(`/chat/${newChatId}`);
            router.refresh();
          }
        }
      },
    });
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  return (
    <div className="relative flex flex-col h-full">
       {!user && <GuestHeader />}
       <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        {messages.length > 0 ? (
          <ChatMessages messages={messages} isLoading={isLoading} />
        ) : (
          <EmptyState />
        )}
      </div>
      <div className="p-4 md:p-6 bg-background border-t w-full max-w-2xl mx-auto">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
        <p className="text-center text-xs text-muted-foreground mt-2">
            Dharz AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
