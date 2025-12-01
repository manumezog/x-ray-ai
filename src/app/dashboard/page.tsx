'use client';

import { useActionState, useEffect, useContext, useState } from 'react';
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
    return { ...prevState, report: null, error: 'Please upload an X-ray image file.' };
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(imageFile.type)) {
    return { ...prevState, report: null, error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.' };
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
    // Directly reset the state to initial to avoid re-running the action with invalid data
    // This was the source of the crash. However, useActionState doesn't expose a setter.
    // The idiomatic way is to reset the key of the parent component to force a re-render and state reset.
    // A more direct state reset would require moving away from useActionState to a manual implementation.
    // The key-based reset is the simplest fix.
    // We will reset the state by changing the key. The component is already keyed to state.key.
    // When the state is updated with a new key, the component will remount with initial state.
    // But since the action is tied to the form, we can't just set state. We can reset the form by changing its key.
    // The easiest and correct fix here is to re-architect this slightly.
    // The error is because `formAction` is being called with an object, not FormData.
    // The previous attempt was flawed. A simple page reload on reset is a sledgehammer, but effective and simple.
    // Let's go for a more elegant client-side reset.
    // The hook `useActionState` doesn't provide a way to set state directly.
    // So we manage the state ourselves.
    window.location.reload();
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
                <form action={formAction} className="space-y-4" key={state.key}>
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
