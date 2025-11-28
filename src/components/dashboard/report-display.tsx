'use client';

import { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { DownloadReport } from '@/components/dashboard/download-report';
import { AlertTriangle, FileText, Bot, RefreshCcw, Download } from 'lucide-react';
import { LanguageContext, translations } from '@/context/language-context';

interface ReportDisplayProps {
  state: {
    report: string | null;
    error: string | null;
  };
  isPending: boolean;
  onReset: () => void;
  imagePreview: string | null;
}

function ReportSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-6 w-1/3" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    )
}

export function ReportDisplay({ state, isPending, onReset, imagePreview }: ReportDisplayProps) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  if (isPending) {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    <span>{t.generatingReport}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ReportSkeleton />
            </CardContent>
        </Card>
    );
  }

  if (state.error && !state.report) { // Show error only if there's no report
    return (
      <div className="flex flex-1 items-center justify-center">
        <Alert variant="destructive" className="w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t.errorTitle}</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (state.report) {
    return (
        <Card className="flex flex-1 flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-6 w-6" />
                      <span>{t.aiDiagnosticReport}</span>
                    </div>
                    <DownloadReport reportContent={state.report} imagePreview={imagePreview} />
                </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none font-body prose-h2:font-headline prose-h2:text-2xl prose-h2:font-bold prose-h2:text-primary prose-h2:border-b prose-h2:pb-2 prose-h2:mb-4 prose-h2:mt-8 flex-1">
                <ReactMarkdown>{state.report}</ReactMarkdown>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                <div className="w-full flex justify-between items-center gap-4">
                  <div className="space-y-2 text-xs text-muted-foreground">
                      <h4 className="font-bold text-sm text-destructive">{t.disclaimerTitle}</h4>
                      <p>{t.disclaimer}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <DownloadReport reportContent={state.report} imagePreview={imagePreview} asChild>
                     <Button variant="outline" size="lg">
                      <Download className="mr-2" />
                      Download Report
                    </Button>
                  </DownloadReport>
                  <Button onClick={onReset} size="lg">
                      <RefreshCcw className="mr-2" />
                      {t.startNewDiagnosis}
                  </Button>
                </div>
            </CardFooter>
        </Card>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        <FileText className="h-12 w-12" />
        <h3 className="text-lg font-bold tracking-tight">{t.noReportGenerated}</h3>
        <p className="text-sm">{t.uploadToGenerate}</p>
      </div>
    </div>
  );
}
