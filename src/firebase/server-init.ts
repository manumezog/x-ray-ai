// IMPORTANT: This file should ONLY be used on the server.
// It is not marked with 'use client' and will not work in the browser.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getRemoteConfig } from 'firebase/remote-config';
import { firebaseConfig } from '@/firebase/config';

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    remoteConfig: getRemoteConfig(firebaseApp),
  };
}

/**
 * Initializes and returns Firebase SDKs for server-side use.
 * It ensures that Firebase is initialized only once.
 */
export function initializeServerSideFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  const app = initializeApp(firebaseConfig);
  return getSdks(app);
}
