'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setDoc, doc, Firestore, SetOptions } from 'firebase/firestore'
import { getRemoteConfig } from 'firebase/remote-config';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
  }

  // In a deployed App Hosting environment, the config is automatically provided.
  // In a local development environment, we use the config from src/firebase/config.ts.
  const app = initializeApp(Object.keys(firebaseConfig).length > 0 ? firebaseConfig : {});
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const isBrowser = typeof window !== 'undefined';
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    remoteConfig: isBrowser ? getRemoteConfig(firebaseApp) : null,
  };
}

export function setDocumentNonBlocking(db: Firestore, collection: string, docId: string, data: any, options: SetOptions) {
  const docRef = doc(db, collection, docId);
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: data,
      })
    )
  })
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';