'use client';

import { useActionState, useEffect, useContext, useState } from 'react';
import { generateDiagnosticReport } from '@/ai/flows/generate-diagnostic-report';
import { ImageUploader } from '@/components/dashboard/image-uploader';
import { ReportDisplay } from '@/components/dashboard/report-display';
import { SubmitButton } from '@/components/dashboard/submit-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LanguageContext, translations } from '@/context/language-context';


type FormState = {
  report: string | null;
  error: string | null;
};

const initialState: FormState = {
    report: null,
    error: null,
};

async function generateReportAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const imageFile = formData.get('xrayImage') as File;
  const language = formData.get('language') as string;

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

    const result = await generateDiagnosticReport({ xrayImageDataUri, language });
    return { report: result.report, error: null };
  } catch (e: any) {
    console.error(e);
    return { report: null, error: e.message || 'An unexpected error occurred while generating the report.' };
  }
}

export default function DashboardPage() {
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [state, formAction, isPending] = useActionState(generateReportAction, initialState);

  useEffect(() => {
    if (state.error) {
        toast({
            variant: "destructive",
            title: t.errorTitle,
            description: state.error,
        });
    }
  }, [state.error, toast, t.errorTitle]);

  const handleReset = () => {
    setImagePreview(null);
    // This is a way to reset the useActionState
    (formAction as any)(new FormData());
  }


  return (
    <div className="grid flex-1 gap-8 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-5">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">{t.newDiagnostic}</CardTitle>
                <CardDescription>{t.uploadXray}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="language" value={language} />
                    <ImageUploader imagePreview={imagePreview} setImagePreview={setImagePreview} disabled={isPending || !!state.report} />
                    <SubmitButton isPending={isPending} isDisabled={!imagePreview || !!state.report} />
                </form>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <ReportDisplay state={state} isPending={isPending} onReset={handleReset} imagePreview={imagePreview} />
      </div>
    </div>
  );
}
