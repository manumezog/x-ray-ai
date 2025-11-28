'use server';

/**
 * @fileOverview An X-ray diagnostic report generation AI agent.
 *
 * - generateDiagnosticReport - A function that handles the generation of diagnostic reports from X-ray images.
 * - GenerateDiagnosticReportInput - The input type for the generateDiagnosticReport function.
 * - GenerateDiagnosticReportOutput - The return type for the generateDiagnosticReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagnosticReportInputSchema = z.object({
  xrayImageDataUri: z
    .string()
    .describe(
      'An X-ray image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'  
    ),
  patientDetails: z
    .string()
    .optional()
    .describe('Additional details about the patient, if available.'),
});
export type GenerateDiagnosticReportInput = z.infer<typeof GenerateDiagnosticReportInputSchema>;

const GenerateDiagnosticReportOutputSchema = z.object({
  report: z.string().describe('The generated diagnostic report.'),
});
export type GenerateDiagnosticReportOutput = z.infer<typeof GenerateDiagnosticReportOutputSchema>;

export async function generateDiagnosticReport(
  input: GenerateDiagnosticReportInput
): Promise<GenerateDiagnosticReportOutput> {
  return generateDiagnosticReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagnosticReportPrompt',
  input: {schema: GenerateDiagnosticReportInputSchema},
  output: {schema: GenerateDiagnosticReportOutputSchema},
  prompt: `You are an expert radiologist specializing in analyzing X-ray images and generating diagnostic reports.

  Analyze the X-ray image provided and generate a detailed diagnostic report.
  Pay close attention to any anomalies, fractures, or other notable observations.

  Use the following as the primary source of information about the X-ray image.

  Patient Details: {{{patientDetails}}}
X-ray Image: {{media url=xrayImageDataUri}}

  Provide a comprehensive diagnostic report that includes:
  - Overall assessment of the image.
  - Detailed description of any identified issues or abnormalities.
  - Recommendations for further evaluation or treatment.
  `,
});

const generateDiagnosticReportFlow = ai.defineFlow(
  {
    name: 'generateDiagnosticReportFlow',
    inputSchema: GenerateDiagnosticReportInputSchema,
    outputSchema: GenerateDiagnosticReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
