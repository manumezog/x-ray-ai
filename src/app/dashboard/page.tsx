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
import { RefreshCcw, Loader2 } from 'lucide-react';
import { useFirestore, useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking, useRemoteConfig } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getValue } from 'firebase/remote-config';


type FormState = {
  report: string | null;
  error: string | null;
};

const initialState: FormState = {
    report: null,
    error: null,
};


export default function DashboardPage() {
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; error: string | null }>({ isValid: false, error: null });
  const [isValidationPending, setIsValidationPending] = useState(false);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const remoteConfig = useRemoteConfig();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc(userDocRef);

  const generateReportWithRateLimit = async (prevState: FormState, formData: FormData): Promise<FormState> => {
    const imageFile = formData.get('xrayImage') as File;
    const language = formData.get('language') as string;
    
    if (!user || !userDocRef) {
      return { report: null, error: 'You must be logged in to generate a report.' };
    }
  
    if (!imageFile || imageFile.size === 0) {
      // This is a reset call, not an error
      return initialState;
    }
    
    // --- Rate Limiting Logic ---
    const dailyLimit = remoteConfig ? parseInt(getValue(remoteConfig, 'daily_report_limit').asString(), 10) : 5;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
    const currentCount = userData?.lastReportDate === today ? userData.dailyReportCount || 0 : 0;

    if (currentCount >= dailyLimit) {
      return { report: null, error: `You have reached your daily limit of ${dailyLimit} reports.` };
    }
    // --- End Rate Limiting Logic ---
  
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return { report: null, error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.' };
    }
  
    try {
      const buffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const xrayImageDataUri = `data:${imageFile.type};base64,${base64}`;
  
      const result = await generateDiagnosticReport({ xrayImageDataUri, language });
      
      // --- Update User's Count ---
      await updateDoc(userDocRef, {
        dailyReportCount: currentCount + 1,
        lastReportDate: today,
      });
      // --- End Update ---
      
      return { report: result.report, error: null };
    } catch (e: any) {
      console.error(e);
      return { report: null, error: e.message || 'An unexpected error occurred while generating the report.' };
    }
  }

  const [state, formAction, isPending] = useActionState(generateReportWithRateLimit, initialState);


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
    setImageFile(null);
    setValidation({ isValid: false, error: null });
    // This is a way to reset the useActionState by passing an empty FormData
    formAction(new FormData());
  }

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      handleReset();
      return;
    }
    
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setValidation({ isValid: false, error: null });
    setIsValidationPending(true);

    // 1. File size validation
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = 'Image size must be less than 10MB.';
      setValidation({ isValid: false, error: errorMsg });
      toast({ variant: 'destructive', title: t.errorTitle, description: errorMsg });
      setIsValidationPending(false);
      return;
    }

    // 2. Image content validation
    try {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const imageDataUri = `data:${file.type};base64,${base64}`;

      const validationResult = await validateXrayImage({ imageDataUri });
      if (!validationResult.isXray) {
        const errorMsg = `Invalid image: ${validationResult.reason}`;
        setValidation({ isValid: false, error: errorMsg });
        toast({ variant: 'destructive', title: 'Invalid Image', description: errorMsg });
      } else {
        setValidation({ isValid: true, error: null });
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = 'An error occurred during image validation.';
      setValidation({ isValid: false, error: errorMsg });
      toast({ variant: 'destructive', title: t.errorTitle, description: errorMsg });
    } finally {
      setIsValidationPending(false);
    }
  };


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
                    <ImageUploader 
                      imagePreview={imagePreview} 
                      onImageChange={handleImageChange}
                      disabled={isPending || !!state.report || isValidationPending}
                    />
                     {isValidationPending && (
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Validating image...
                        </div>
                    )}
                    {state.report ? (
                      <Button onClick={handleReset} size="lg" className="w-full">
                        <RefreshCcw className="mr-2" />
                        {t.startNewDiagnosis}
                      </Button>
                    ) : (
                      <SubmitButton isPending={isPending} isDisabled={!imagePreview || !validation.isValid || isValidationPending || !!state.report} />
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
