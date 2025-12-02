'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';

// This function should only ever be used on the client.
function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
  }

  const app = initializeApp(Object.keys(firebaseConfig).length > 0 ? firebaseConfig : {});
  return getSdks(app);
}

function getSdks(firebaseApp: FirebaseApp) {
  const isBrowser = typeof window !== 'undefined';
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    remoteConfig: isBrowser ? getRemoteConfig(firebaseApp) : null,
  };
}

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
      {children}
    </FirebaseProvider>
  );
}
