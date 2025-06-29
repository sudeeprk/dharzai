'use server';

/**
 * @fileOverview An AI agent that maintains context across multiple turns of a conversation.
 *
 * - contextualConversation - A function that maintains context across multiple turns of a conversation.
 * - ContextualConversationInput - The input type for the contextualConversation function.
 * - ContextualConversationOutput - The return type for the contextualConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualConversationInputSchema = z.object({
  message: z.string().describe('The current user message.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The history of the conversation.'),
});
export type ContextualConversationInput = z.infer<typeof ContextualConversationInputSchema>;

const ContextualConversationOutputSchema = z.object({
  response: z.string().describe('The AI response to the user message.'),
});
export type ContextualConversationOutput = z.infer<typeof ContextualConversationOutputSchema>;

export async function contextualConversation(input: ContextualConversationInput): Promise<ContextualConversationOutput> {
  return contextualConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualConversationPrompt',
  input: {schema: ContextualConversationInputSchema},
  output: {schema: ContextualConversationOutputSchema},
  prompt: `You are a helpful AI assistant. Respond to the user message, taking into account the conversation history to provide relevant and personalized responses.\n\n{% if conversationHistory %}\nConversation History:\n{{#each conversationHistory}}\n{{this.role}}: {{this.content}}\n{{/each}}\n{% endif %}\n\nUser Message: {{{message}}}`,
});

const contextualConversationFlow = ai.defineFlow(
  {
    name: 'contextualConversationFlow',
    inputSchema: ContextualConversationInputSchema,
    outputSchema: ContextualConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
