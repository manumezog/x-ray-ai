'use client';

import { cn } from '@/lib/utils';

const USFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 48" {...props}>
    <path fill="#0A3161" d="M0 0h72v48H0z" />
    <path
      fill="#fff"
      d="M0 8h72v8H0zm0 16h72v8H0zm0 16h72v8H0zM0 0h32v24H0z"
    />
    <path fill="#B31942" d="M0 4h72v4H0zm0 16h72v4H0zm0 16h72v4H0z" />
    <path fill="#0A3161" d="M0 0h32v24H0z" />
    <path
      fill="#fff"
      d="m6 3-1 2 2-1-2-1 1 2-2 1h2l-1 2 1-2 1 2-1-2h2l-2 1zm8 0-1 2 2-1-2-1 1 2-2 1h2l-1 2 1-2 1 2-1-2h2l-2 1zm8 0-1 2 2-1-2-1 1 2-2 1h2l-1 2 1-2 1 2-1-2h2l-2 1zm-12 6-1 2 2-1-2-1 1 2-2 1h2l-1 2 1-2 1 2-1-2h2l-2 1zm8 0-1 2 2-1-2-1 1 2-2 1h2l-1 2 1-2 1 2-1-2h2l-2 1zm-4 6-1 2 2-1-2-1 1 2-2 1h2l-1 2 1-2 1 2-1-2h2l-2 1zm8 0-1 2 2-1-2-1 1 2-2 1h2l-1 2 1-2 1 2-1-2h2l-2 1zm-12 6-1 2 2-1-2-1 1 2-2 1h2l-1 2 1-2 1 2-1-2h2l-2 1zm8 0-1 2 2-1-2-1 1 2-2 1h2l-1 2 1-2 1 2-1-2h2l-2 1z"
    />
  </svg>
);

const ESFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 48" {...props}>
    <path fill="#C60B1E" d="M0 0h72v48H0z" />
    <path fill="#FFC400" d="M0 12h72v24H0z" />
    <path fill="#AD1519" d="M19 21h2v6h-2zm4 0h2v6h-2z" />
    <path fill="#FFC400" d="M20 21h2v6h-2z" />
    <path
      fill="none"
      stroke="#AD1519"
      strokeWidth="0.5"
      d="M25.75 26.5a2.25 2.25 0 0 1-4.5 0v-3a2.25 2.25 0 0 1 4.5 0v3z"
    />
    <path fill="#C60B1E" d="M22.5 22a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
  </svg>
);

interface FlagProps extends React.SVGProps<SVGSVGElement> {
    lang: 'en' | 'es';
}

export function Flag({ lang, className, ...props }: FlagProps) {
    const FlagComponent = lang === 'en' ? USFlag : ESFlag;
    return <FlagComponent className={cn("h-4 w-6 rounded-sm", className)} {...props} />;
}
