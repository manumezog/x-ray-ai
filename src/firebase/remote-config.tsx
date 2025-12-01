'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchAndActivate, getAll, RemoteConfig } from 'firebase/remote-config';
import { useFirebase } from '@/firebase/provider';

// Define the shape of your remote config values
interface RemoteConfigValues {
  daily_report_limit: number;
}

// Define default values
const defaultConfig: RemoteConfigValues = {
  daily_report_limit: 10,
};

// Create the context
const RemoteConfigContext = createContext<RemoteConfigValues>(defaultConfig);

/**
 * Provides remote config values to its children.
 * It fetches the config from Firebase on mount and provides the values.
 */
export const RemoteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { remoteConfig } = useFirebase();
  const [config, setConfig] = useState<RemoteConfigValues>(defaultConfig);

  useEffect(() => {
    if (!remoteConfig) return;

    // Set minimum fetch interval for development to fetch more frequently.
    // In a production app, you might want a higher value.
    remoteConfig.settings.minimumFetchIntervalMillis = process.env.NODE_ENV === 'development' ? 10000 : 3600000;

    const fetchConfig = async () => {
      try {
        await fetchAndActivate(remoteConfig);
        const allValues = getAll(remoteConfig);
        
        const newConfig: RemoteConfigValues = {
          daily_report_limit: Number(allValues.daily_report_limit?.asNumber() || defaultConfig.daily_report_limit),
        };
        
        setConfig(newConfig);

      } catch (error) {
        console.error("Error fetching or activating remote config:", error);
        // Keep using default config in case of an error
        setConfig(defaultConfig);
      }
    };

    fetchConfig();
  }, [remoteConfig]);

  return (
    <RemoteConfigContext.Provider value={config}>
      {children}
    </RemoteConfigContext.Provider>
  );
};

/**
 * Hook to use remote config values.
 */
export const useRemoteConfig = (): RemoteConfigValues => {
  return useContext(RemoteConfigContext);
};
