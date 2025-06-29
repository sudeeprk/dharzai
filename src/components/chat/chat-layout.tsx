'use client';

import { useChat } from 'ai/react';
import type { Message } from 'ai/react';
import type { User } from 'next-auth';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';

interface ChatLayoutProps {
  initialMessages?: Message[];
  chatId?: string;
  user: User;
}

export function ChatLayout({ initialMessages, chatId: initialChatId, user }: ChatLayoutProps) {
  const [chatId, setChatId] = useState(initialChatId);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      api: '/api/chat',
      initialMessages,
      body: {
        chatId,
      },
      onFinish() {
        if (!chatId) {
          const newChatId = (data as any[])?.find(d => d.chatId)?.chatId;
          if (newChatId) {
            setChatId(newChatId);
          }
        }
      }
    });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-card border-b p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline">Dharz AI</h1>
        <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user.name}</p>
            <Button variant="outline" size="sm" onClick={handleNewChat}>New Chat</Button>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>Logout</Button>
        </div>
      </header>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>
      <div className="p-4 md:p-6 bg-card border-t">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
