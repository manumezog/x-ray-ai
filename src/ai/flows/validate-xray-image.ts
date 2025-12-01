'use server';

/**
 * @fileOverview An AI agent to validate if an image is a medical X-ray.
 *
 * - validateXrayImage - A function that handles the validation of an image.
 * - ValidateXrayImageInput - The input type for the validateXrayImage function.
 * - ValidateXrayImageOutput - The return type for the validateXrayImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateXrayImageInputSchema = z.object({
  xrayImageDataUri: z
    .string()
    .describe(
      "An image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ValidateXrayImageInput = z.infer<
  typeof ValidateXrayImageInputSchema
>;

const ValidateXrayImageOutputSchema = z.object({
  isXray: z
    .boolean()
    .describe('Whether or not the image is a medical X-ray.'),
  reason: z
    .string()
    .describe(
      'A brief explanation for the decision, especially if it is not an X-ray.'
    ),
});
export type ValidateXrayImageOutput = z.infer<
  typeof ValidateXrayImageOutputSchema
>;

export async function validateXrayImage(
  input: ValidateXrayImageInput
): Promise<ValidateXrayImageOutput> {
  return validateXrayImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateXrayImagePrompt',
  input: {schema: ValidateXrayImageInputSchema},
  output: {schema: ValidateXrayImageOutputSchema},
  prompt: `You are an image classification expert. Your task is to determine if the provided image is a medical X-ray.

Analyze the image and respond with a JSON object.

- If the image is a medical X-ray, set 'isXray' to true.
- If the image is NOT a medical X-ray, set 'isXray' to false and provide a brief 'reason'.

Image: {{media url=xrayImageDataUri}}
  `,
});

const validateXrayImageFlow = ai.defineFlow(
  {
    name: 'validateXrayImageFlow',
    inputSchema: ValidateXrayImageInputSchema,
    outputSchema: ValidateXrayImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
