'use client';

import { useChat } from 'ai/react';
import type { Message } from 'ai/react';
import type { User } from 'next-auth';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { LogOut, User as UserIcon } from 'lucide-react';

interface ChatLayoutProps {
  initialMessages?: Message[];
  chatId?: string;
  user: User | null;
}

export function ChatLayout({ initialMessages, chatId: initialChatId, user }: ChatLayoutProps) {
  const [chatId, setChatId] = useState(initialChatId);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, data, setMessages } =
    useChat({
      api: '/api/chat',
      initialMessages,
      body: {
        chatId,
      },
      onFinish() {
        if (!chatId && user) {
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
    if (user) {
        window.location.href = '/';
    } else {
        setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-card border-b p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline">Dharz AI</h1>
        <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleNewChat}>New Chat</Button>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                                <AvatarFallback>
                                    <UserIcon />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                            </p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            )}
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
