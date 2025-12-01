import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from '@/context/language-context';
import { FirebaseClientProvider, RemoteConfigProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'XRay Insights',
  description: 'Upload an x-ray medical image and the app responds with a diagnostic report based on the observations on the image',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <RemoteConfigProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </RemoteConfigProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
