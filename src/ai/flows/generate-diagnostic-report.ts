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
      "An X-ray image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  patientDetails: z
    .string()
    .optional()
    .describe('Additional details about the patient, if available.'),
  language: z
    .string()
    .optional()
    .describe('The language for the report (e.g., "en" or "es").'),
});
export type GenerateDiagnosticReportInput = z.infer<
  typeof GenerateDiagnosticReportInputSchema
>;

const GenerateDiagnosticReportOutputSchema = z.object({
  report: z.string().describe('The generated diagnostic report.'),
});
export type GenerateDiagnosticReportOutput = z.infer<
  typeof GenerateDiagnosticReportOutputSchema
>;

export async function generateDiagnosticReport(
  input: GenerateDiagnosticReportInput
): Promise<GenerateDiagnosticReportOutput> {
  return generateDiagnosticReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagnosticReportPrompt',
  input: {schema: GenerateDiagnosticReportInputSchema},
  output: {schema: GenerateDiagnosticReportOutputSchema},
  prompt: `You are a highly skilled medical imaging expert with extensive knowledge in radiology and diagnostic imaging. Analyze the patient's medical image and structure your response as follows:

## 1. Image Type & Region
- Specify imaging modality (X-ray/MRI/CT/Ultrasound/etc.)
- Identify the patient's anatomical region and positioning
- Comment on image quality and technical adequacy

## 2. Key Findings
- List primary observations systematically
- Note any abnormalities in the patient's imaging with precise descriptions
- Include measurements and densities where relevant
- Describe location, size, shape, and characteristics
- Rate severity: Normal/Mild/Moderate/Severe

## 3. Diagnostic Assessment
- Provide primary diagnosis with confidence level
- List differential diagnoses in order of likelihood
- Support each diagnosis with observed evidence from the patient's imaging
- Note any critical or urgent findings

## 4. Patient-Friendly Explanation
- Explain the findings in simple, clear language that the patient can understand
- Avoid medical jargon or provide clear definitions
- Include visual analogies if helpful
- Address common patient concerns related to these findings

Format your response using clear markdown headers and bullet points. Be concise yet thorough.

Generate the report in the specified language ({{language}}).

Patient Details: {{{patientDetails}}}
X-ray Image: {{media url=xrayImageDataUri}}
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
