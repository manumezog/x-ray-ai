'use client';

import { createContext, useContext, useState, ReactNode, FC } from 'react';

export type Language = 'en' | 'es';

type TranslationKeys = {
    xrayInsights: string;
    newDiagnostic: string;
    uploadXray: string;
    clickToUpload: string;
    orDragAndDrop: string;
    xrayImageHint: string;
    clearImage: string;
    generateReport: string;
    generating: string;
    generatingReport: string;
    aiDiagnosticReport: string;
    noReportGenerated: string;
    uploadToGenerate: string;
    startNewDiagnosis: string;
    errorTitle: string;
    user: string;
    profile: string;
    logOut: string;
};

export const translations: Record<Language, TranslationKeys> = {
  en: {
    xrayInsights: "XRay Insights",
    newDiagnostic: "New Diagnostic",
    uploadXray: "Upload an X-ray to generate an AI-powered report.",
    clickToUpload: "Click to upload",
    orDragAndDrop: "or drag and drop",
    xrayImageHint: "X-Ray image (PNG, JPG, etc.)",
    clearImage: "Clear image",
    generateReport: "Generate Report",
    generating: "Generating...",
    generatingReport: "Generating Report",
    aiDiagnosticReport: "AI Diagnostic Report",
    noReportGenerated: "No report generated",
    uploadToGenerate: "Upload an X-ray image to generate a diagnostic report.",
    startNewDiagnosis: "Start New Diagnosis",
    errorTitle: "Error",
    user: "User",
    profile: "Profile",
    logOut: "Log out",
  },
  es: {
    xrayInsights: "Análisis Rayos-X",
    newDiagnostic: "Nuevo Diagnóstico",
    uploadXray: "Sube una radiografía para generar un informe con IA.",
    clickToUpload: "Haz clic para subir",
    orDragAndDrop: "o arrastra y suelta",
    xrayImageHint: "Imagen de Rayos-X (PNG, JPG, etc.)",
    clearImage: "Quitar imagen",
    generateReport: "Generar Informe",
    generating: "Generando...",
    generatingReport: "Generando Informe",
    aiDiagnosticReport: "Informe de Diagnóstico IA",
    noReportGenerated: "No se ha generado ningún informe",
    uploadToGenerate: "Sube una imagen de Rayos-X para generar un informe de diagnóstico.",
    startNewDiagnosis: "Iniciar Nuevo Diagnóstico",
    errorTitle: "Error",
    user: "Usuario",
    profile: "Perfil",
    logOut: "Cerrar sesión",
  },
};


type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
