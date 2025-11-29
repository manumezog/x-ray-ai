'use server';

/**
 * @fileOverview Validates whether an uploaded image is a human X-ray.
 *
 * - validateXrayImage - A function that analyzes an image.
 * - ValidateXrayImageInput - The input type for the validateXrayImage function.
 * - ValidateXrayImageOutput - The return type for the validateXrayImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateXrayImageInputSchema = z.object({
  imageDataUri: z
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
    .describe('Whether or not the image is a human X-ray.'),
  reason: z
    .string()
    .describe('The reason for the determination, especially if it is not a valid X-ray.'),
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
  prompt: `You are a medical imaging expert. Your task is to determine if the provided image is a human X-ray. 
  
  If it is a human X-ray, set isXray to true.
  If it is not a human X-ray (e.g., a photo of a cat, a landscape, a different type of medical scan like an MRI, or not an image at all), set isXray to false and provide a brief reason.

  Image: {{media url=imageDataUri}}`,
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
