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
import { LanguageContext } from '@/context/language-context';

const USFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 7410 3900">
        <rect width="7410" height="3900" fill="#b22234"/>
        <path d="M0,450H7410M0,1050H7410M0,1650H7410M0,2250H7410M0,2850H7410M0,3450H7410" stroke="#fff" strokeWidth="300"/>
        <rect width="2964" height="2100" fill="#3c3b6e"/>
        <g fill="#fff">
            <g id="s18">
                <g id="s9">
                    <path id="s" d="M247,90 300,270 120,150H372L192,270z"/>
                    <use href="#s" x="494"/>
                    <use href="#s" x="988"/>
                    <use href="#s" x="1482"/>
                    <use href="#s" x="1976"/>
                    <use href="#s" x="2470"/>
                </g>
                <use href="#s9" y="420"/>
            </g>
            <use href="#s18" y="840"/>
            <use href="#s18" y="1680"/>
            <g id="s5">
                <use href="#s" x="247"/>
                <use href="#s" x="741"/>
                <use href="#s" x="1235"/>
                <use href="#s" x="1729"/>
                <use href="#s" x="2223"/>
            </g>
            <use href="#s5" y="210"/>
            <use href="#s5" y="630"/>
            <use href="#s5" y="1050"/>
            <use href="#s5" y="1470"/>
            <use href="#s5" y="1890"/>
        </g>
    </svg>
);

const ESFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 750 500">
        <rect width="750" height="500" fill="#c60b1e"/>
        <rect width="750" height="250" y="125" fill="#ffc400"/>
    </svg>
);


export function Header() {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-8">
      <Logo />
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
              {language === 'en' ? <USFlag /> : <ESFlag />}
              <span className="sr-only">Select language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
                <div className="flex items-center gap-2">
                    <USFlag />
                    <span>English</span>
                </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('es')} disabled={language === 'es'}>
                <div className="flex items-center gap-2">
                    <ESFlag />
                    <span>Español</span>
                </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserNav />
      </div>
    </header>
  );
}
