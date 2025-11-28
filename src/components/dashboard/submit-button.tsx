'use client';

import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { LanguageContext, translations } from '@/context/language-context';

export function SubmitButton({ isPending }: { isPending: boolean }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t.generating}
        </>
      ) : (
        t.generateReport
      )}
    </Button>
  );
}
