'use client';

import { fetchAndActivate, RemoteConfig } from 'firebase/remote-config';

// --- Standalone initialization for server-side or one-off use ---
export async function initializeRemoteConfig(remoteConfig: RemoteConfig) {
  // Set minimum fetch interval for development
  if (process.env.NODE_ENV === 'development') {
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
  }

  // Set default values
  remoteConfig.defaultConfig = {
    'daily_report_limit': '5',
  };
  
  try {
    await fetchAndActivate(remoteConfig);
  } catch (err) {
    console.error('Remote Config fetch failed:', err);
  }
}

    