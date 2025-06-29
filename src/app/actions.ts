'use server';

import { contextualConversation } from '@/ai/flows/contextual-conversation';
import type { Message } from '@/lib/types';

export async function sendMessage(messages: Message[]) {
  const history = messages.slice(0, -1);
  const latestMessage = messages[messages.length - 1];

  if (!latestMessage) {
    return {
      success: false,
      error: 'No message provided.',
    };
  }

  try {
    const result = await contextualConversation({
      message: latestMessage.content,
      conversationHistory: history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    return {
      success: true,
      response: result.response,
    };
  } catch (error) {
    console.error('Error in contextualConversation flow:', error);
    return {
      success: false,
      error: 'An error occurred while processing your message. Please try again.',
    };
  }
}
