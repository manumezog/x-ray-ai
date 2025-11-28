'use server';

/**
 * @fileOverview Summarizes a pre-existing diagnostic report of an X-ray image.
 *
 * - summarizeExistingReport - A function that summarizes the report.
 * - SummarizeExistingReportInput - The input type for the summarizeExistingReport function.
 * - SummarizeExistingReportOutput - The return type for the summarizeExistingReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeExistingReportInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of an X-ray, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  report: z.string().describe('The pre-existing diagnostic report to summarize.'),
});

export type SummarizeExistingReportInput = z.infer<
  typeof SummarizeExistingReportInputSchema
>;

const SummarizeExistingReportOutputSchema = z.object({
  summary: z.string().describe('The summarized diagnostic report.'),
});

export type SummarizeExistingReportOutput = z.infer<
  typeof SummarizeExistingReportOutputSchema
>;

export async function summarizeExistingReport(
  input: SummarizeExistingReportInput
): Promise<SummarizeExistingReportOutput> {
  return summarizeExistingReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeExistingReportPrompt',
  input: {schema: SummarizeExistingReportInputSchema},
  output: {schema: SummarizeExistingReportOutputSchema},
  prompt: `You are an expert medical summarizer. You will be provided with an X-ray image and a pre-existing diagnostic report. Your task is to summarize the key findings from the report.

  Report: {{{report}}}
  X-ray Image: {{media url=photoDataUri}}
  `,
});

const summarizeExistingReportFlow = ai.defineFlow(
  {
    name: 'summarizeExistingReportFlow',
    inputSchema: SummarizeExistingReportInputSchema,
    outputSchema: SummarizeExistingReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
