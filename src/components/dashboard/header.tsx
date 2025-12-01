'use client';

import { useContext } from 'react';
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/dashboard/user-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { LanguageContext } from '@/context/language-context';
import { Flag } from './flag';

export function Header() {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-8">
      <Logo />
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <span className="font-bold uppercase">{language}</span>
              <Flag lang={language} />
              <span className="sr-only">Select language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
              <div className="flex items-center gap-2">
                <span>English</span>
                <Flag lang="en" />
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('es')} disabled={language === 'es'}>
              <div className="flex items-center gap-2">
                <span>Español</span>
                <Flag lang="es" />
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserNav />
      </div>
    </header>
  );
}
