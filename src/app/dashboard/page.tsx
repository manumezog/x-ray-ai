'use client';

import { useFormState } from 'react-dom';
import { generateDiagnosticReport } from '@/ai/flows/generate-diagnostic-report';
import { ImageUploader } from '@/components/dashboard/image-uploader';
import { ReportDisplay } from '@/components/dashboard/report-display';
import { SubmitButton } from '@/components/dashboard/submit-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type FormState = {
  report: string | null;
  error: string | null;
};

async function generateReportAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const imageFile = formData.get('xrayImage') as File;

  if (!imageFile || imageFile.size === 0) {
    return { report: null, error: 'Please upload an X-ray image file.' };
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(imageFile.type)) {
    return { report: null, error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.' };
  }

  try {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const xrayImageDataUri = `data:${imageFile.type};base64,${base64}`;

    const result = await generateDiagnosticReport({ xrayImageDataUri });
    return { report: result.report, error: null };
  } catch (e: any) {
    console.error(e);
    return { report: null, error: e.message || 'An unexpected error occurred while generating the report.' };
  }
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(generateReportAction, {
    report: null,
    error: null,
  });

  useEffect(() => {
    if (state.error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: state.error,
        });
    }
  }, [state.error, toast]);


  return (
    <div className="grid flex-1 gap-8 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-5">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">New Diagnostic</CardTitle>
                <CardDescription>Upload an X-ray to generate an AI-powered report.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <ImageUploader />
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <ReportDisplay state={state} />
      </div>
    </div>
  );
}