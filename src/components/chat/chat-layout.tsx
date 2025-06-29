'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import type { Message } from '@/lib/types';
import { sendMessage } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendMessage(newMessages);

      if (result.success && result.response) {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: result.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        setMessages((prev) => prev.slice(0, -1));
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "Error",
          description: 'An unexpected error occurred.',
        });
        setMessages((prev) => prev.slice(0, -1));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-card border-b p-4 shadow-sm">
        <h1 className="text-2xl font-bold font-headline text-center">Dharz AI</h1>
      </header>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>
      <div className="p-4 md:p-6 bg-card border-t">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
