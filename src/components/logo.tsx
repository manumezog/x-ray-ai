'use client';
import { useContext } from 'react';
import { Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageContext, translations } from '@/context/language-context';

export function Logo({ className }: { className?: string }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Stethoscope className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold tracking-tight text-foreground">
        {t.xrayInsights}
      </span>
    </div>
  );
}
