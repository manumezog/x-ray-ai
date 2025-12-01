'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchAndActivate, getAll, RemoteConfig } from 'firebase/remote-config';
import { useFirebase } from '@/firebase/provider';

// Define the shape of your remote config values
interface RemoteConfigValues {
  daily_report_limit: number;
}

// Define the shape of the context state
interface RemoteConfigState extends RemoteConfigValues {
  isLoading: boolean;
}

// Define default values
const defaultConfig: RemoteConfigValues = {
  daily_report_limit: 10,
};

const defaultState: RemoteConfigState = {
  ...defaultConfig,
  isLoading: true,
};

// Create the context
const RemoteConfigContext = createContext<RemoteConfigState>(defaultState);

/**
 * Provides remote config values to its children.
 * It fetches the config from Firebase on mount and provides the values.
 */
export const RemoteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { remoteConfig } = useFirebase();
  const [config, setConfig] = useState<RemoteConfigState>(defaultState);

  useEffect(() => {
    if (!remoteConfig) {
        // If remoteConfig is not available yet, we are in a loading state.
        // This can happen on initial app load.
        setConfig(prevState => ({ ...prevState, isLoading: true }));
        return;
    }

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
        
        setConfig({ ...newConfig, isLoading: false });

      } catch (error) {
        console.error("Error fetching or activating remote config:", error);
        // Keep using default config in case of an error, but stop loading.
        setConfig({ ...defaultConfig, isLoading: false });
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
export const useRemoteConfig = (): RemoteConfigState => {
  return useContext(RemoteConfigContext);
};
