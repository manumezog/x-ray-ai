'use client';

import { useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, FileText, Bot } from 'lucide-react';
import { LanguageContext, translations } from '@/context/language-context';

interface ReportDisplayProps {
  state: {
    report: string | null;
    error: string | null;
  };
  isPending: boolean;
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

export function ReportDisplay({ state, isPending }: ReportDisplayProps) {
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

  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t.errorTitle}</AlertTitle>
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }

  if (state.report) {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    <span>{t.aiDiagnosticReport}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-body">
                {state.report}
            </CardContent>
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
