'use client';

import { useActionState, useEffect, useContext, useState } from 'react';
import { generateDiagnosticReport } from '@/ai/flows/generate-diagnostic-report';
import { validateXrayImage } from '@/ai/flows/validate-xray-image';
import { ImageUploader } from '@/components/dashboard/image-uploader';
import { ReportDisplay } from '@/components/dashboard/report-display';
import { SubmitButton } from '@/components/dashboard/submit-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LanguageContext, translations } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useUser } from '@/firebase';


type FormState = {
  report: string | null;
  error: string | null;
};

const initialState: FormState = {
    report: null,
    error: null,
};

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

async function generateReportAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const imageFile = formData.get('xrayImage') as File;
  const language = formData.get('language') as string;
  const userId = formData.get('userId') as string;

  if (!userId) {
    return { ...initialState, error: 'User not authenticated.' };
  }

  if (!imageFile || imageFile.size === 0) {
    return { ...initialState, error: 'Please upload an X-ray image file.' };
  }
  
  if (imageFile.size > MAX_FILE_SIZE_BYTES) {
    return { ...initialState, error: `File size must be less than ${MAX_FILE_SIZE_MB} MB.` };
  }

  try {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const xrayImageDataUri = `data:${imageFile.type};base64,${base64}`;

    // Validate if the image is an X-ray
    const validationResult = await validateXrayImage({ xrayImageDataUri });
    if (!validationResult.isXray) {
        return { report: null, error: `Image validation failed: ${validationResult.reason}` };
    }

    // Generate the report
    const result = await generateDiagnosticReport({ xrayImageDataUri, language });
    return { report: result.report, error: null };
  } catch (e: any) {
    console.error(e);
    return { report: null, error: e.message || 'An unexpected error occurred while generating the report.', };
  }
}

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null);
  
  const [state, formAction, isPending] = useActionState(generateReportAction, initialState);
  
  useEffect(() => {
    if (state.error && !isPending) {
        setDisplayError(state.error);
        toast({
            variant: "destructive",
            title: t.errorTitle,
            description: state.error,
        });
    }
    if (state.report && !isPending) {
        setDisplayError(null);
    }
  }, [state, isPending, toast, t.errorTitle]);

  const handleReset = () => {
    // This is a client-side only reset. We are not re-submitting the form.
    // We need to manually reset the form fields and our React state.
    const form = document.querySelector('form');
    if (form) {
        form.reset();
    }
    setImagePreview(null);
    setDisplayError(null); // Clear the displayed error
    
    // We can't directly reset the useActionState, but by clearing the things
    // that depend on it (like displayError and the report itself), we effectively
    // reset the view. A "new" initial state will be created on the next form submission.
    // To clear the report, we can just reset our component's view state.
    state.report = null;
    state.error = null;
  };

  const onImageSelect = () => {
    if (displayError) {
        setDisplayError(null);
    }
  };

  const showReport = state.report && !isPending;
  const showError = displayError && !isPending && !showReport;
  const isSubmitDisabled = !imagePreview || !user || isPending;

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
                    <input type="hidden" name="userId" value={user?.uid} />
                    <ImageUploader 
                      imagePreview={imagePreview} 
                      setImagePreview={setImagePreview} 
                      disabled={isPending || showReport}
                      onImageSelect={onImageSelect}
                    />
                    {showReport ? (
                      <Button onClick={handleReset} size="lg" className="w-full" type="button">
                        <RefreshCcw className="mr-2" />
                        {t.startNewDiagnosis}
                      </Button>
                    ) : showError ? (
                      <Button onClick={handleReset} size="lg" className="w-full" type="button">
                          <RefreshCcw className="mr-2" />
                          Try Again
                      </Button>
                    ) : (
                      <SubmitButton isPending={isPending} isDisabled={isSubmitDisabled} />
                    )}
                </form>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <ReportDisplay state={{...state, error: displayError}} isPending={isPending} onReset={handleReset} imagePreview={imagePreview} />
      </div>
    </div>
  );
}
