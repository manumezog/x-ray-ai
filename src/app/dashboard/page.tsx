'use client';

import { useActionState, useEffect, useContext, useState, startTransition } from 'react';
import { generateDiagnosticReport } from '@/ai/flows/generate-diagnostic-report';
import { ImageUploader } from '@/components/dashboard/image-uploader';
import { ReportDisplay } from '@/components/dashboard/report-display';
import { SubmitButton } from '@/components/dashboard/submit-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LanguageContext, translations } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';


type FormState = {
  report: string | null;
  error: string | null;
  key: number;
};

const initialState: FormState = {
    report: null,
    error: null,
    key: 0,
};

async function generateReportAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const imageFile = formData.get('xrayImage') as File;
  const language = formData.get('language') as string;

  if (!imageFile || imageFile.size === 0) {
    // This state should ideally not be user-visible on a clean reset
    return { ...initialState, error: 'Please upload an X-ray image file.', key: prevState.key };
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(imageFile.type)) {
    return { ...initialState, error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.', key: prevState.key };
  }

  try {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const xrayImageDataUri = `data:${imageFile.type};base64,${base64}`;

    const result = await generateDiagnosticReport({ xrayImageDataUri, language });
    return { report: result.report, error: null, key: prevState.key + 1 };
  } catch (e: any) {
    console.error(e);
    return { report: null, error: e.message || 'An unexpected error occurred while generating the report.', key: prevState.key };
  }
}

export default function DashboardPage() {
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [state, formAction, isPending] = useActionState(generateReportAction, initialState);

  const resetAction = () => {
    startTransition(() => {
        // A special form action invocation that resets the state to initial.
        // This is a conventional way to handle resets with useActionState
        (formAction as any)(initialState);
    });
  };

  useEffect(() => {
    if (state.error) {
        toast({
            variant: "destructive",
            title: t.errorTitle,
            description: state.error,
        });
    }
  }, [state.error, state.key, toast, t.errorTitle]);

  const handleReset = () => {
    setImagePreview(null);
    resetAction();
  }


  return (
    <div className="grid flex-1 gap-8 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-5" key={state.key}>
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
                    {state.report ? (
                      <Button onClick={handleReset} size="lg" className="w-full">
                        <RefreshCcw className="mr-2" />
                        {t.startNewDiagnosis}
                      </Button>
                    ) : (
                      <SubmitButton isPending={isPending} isDisabled={!imagePreview || !!state.report} />
                    )}
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
