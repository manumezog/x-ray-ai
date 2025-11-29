'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { RemoteConfig, getAll, fetchAndActivate } from 'firebase/remote-config';

// --- Context for Remote Config Values ---
const RemoteConfigContext = React.createContext<Record<string, string> | null>(null);

export const RemoteConfigProvider = ({ children, remoteConfig }: { children: ReactNode, remoteConfig: RemoteConfig | null }) => {
    const [values, setValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!remoteConfig) return;

        // Set default values
        remoteConfig.defaultConfig = {
            'daily_report_limit': '5', // Default to 5 if not set in console
        };
        
        // Fetch and activate
        fetchAndActivate(remoteConfig)
            .then(() => {
                const allValues = getAll(remoteConfig);
                const newValues: Record<string, string> = {};
                for (const key in allValues) {
                    newValues[key] = allValues[key].asString();
                }
                setValues(newValues);
            })
            .catch((err) => {
                console.error('Remote Config fetch failed:', err);
            });

    }, [remoteConfig]);

    return (
        <RemoteConfigContext.Provider value={values}>
            {children}
        </RemoteConfigContext.Provider>
    );
};

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      remoteConfig={firebaseServices.remoteConfig}
    >
      <RemoteConfigProvider remoteConfig={firebaseServices.remoteConfig}>
        {children}
      </RemoteConfigProvider>
    </FirebaseProvider>
  );
}
