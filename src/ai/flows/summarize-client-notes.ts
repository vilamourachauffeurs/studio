'use server';

/**
 * @fileOverview Summarizes client notes using GenAI to provide a quick understanding of client history and preferences.
 *
 * - summarizeClientNotes - A function that handles the summarization of client notes.
 * - SummarizeClientNotesInput - The input type for the summarizeClientNotes function.
 * - SummarizeClientNotesOutput - The return type for the summarizeClientNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeClientNotesInputSchema = z.object({
  notes: z
    .string()
    .describe('The client notes to summarize.'),
});
export type SummarizeClientNotesInput = z.infer<typeof SummarizeClientNotesInputSchema>;

const SummarizeClientNotesOutputSchema = z.object({
  summary: z.string().describe('The summary of the client notes.'),
});
export type SummarizeClientNotesOutput = z.infer<typeof SummarizeClientNotesOutputSchema>;

export async function summarizeClientNotes(input: SummarizeClientNotesInput): Promise<SummarizeClientNotesOutput> {
  return summarizeClientNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeClientNotesPrompt',
  input: {schema: SummarizeClientNotesInputSchema},
  output: {schema: SummarizeClientNotesOutputSchema},
  prompt: `You are an expert assistant that specializes in summarizing client notes.

  Summarize the following client notes to provide a quick understanding of the client history and preferences:

  Client Notes: {{{notes}}}`,
});

const summarizeClientNotesFlow = ai.defineFlow(
  {
    name: 'summarizeClientNotesFlow',
    inputSchema: SummarizeClientNotesInputSchema,
    outputSchema: SummarizeClientNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
