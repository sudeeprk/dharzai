'use server';

/**
 * @fileOverview Generates a detailed initial prompt from a high-level topic.
 *
 * - generateInitialPrompt - A function that generates an initial prompt for a conversation.
 * - GenerateInitialPromptInput - The input type for the generateInitialPrompt function.
 * - GenerateInitialPromptOutput - The return type for the generateInitialPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialPromptInputSchema = z.object({
  topic: z.string().describe('The high-level topic to generate a prompt for.'),
});
export type GenerateInitialPromptInput = z.infer<typeof GenerateInitialPromptInputSchema>;

const GenerateInitialPromptOutputSchema = z.object({
  initialPrompt: z.string().describe('The detailed initial prompt to start a conversation.'),
});
export type GenerateInitialPromptOutput = z.infer<typeof GenerateInitialPromptOutputSchema>;

export async function generateInitialPrompt(input: GenerateInitialPromptInput): Promise<GenerateInitialPromptOutput> {
  return generateInitialPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialPromptPrompt',
  input: {schema: GenerateInitialPromptInputSchema},
  output: {schema: GenerateInitialPromptOutputSchema},
  prompt: `You are an AI assistant that helps users start conversations on a given topic.

  Based on the following topic, generate a detailed and engaging initial prompt that encourages conversation and exploration.

  Topic: {{{topic}}}

  Initial Prompt:`, // Removed unnecessary newlines here
});

const generateInitialPromptFlow = ai.defineFlow(
  {
    name: 'generateInitialPromptFlow',
    inputSchema: GenerateInitialPromptInputSchema,
    outputSchema: GenerateInitialPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
