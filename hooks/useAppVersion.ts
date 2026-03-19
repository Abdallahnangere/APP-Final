'use client';

import { useState, useEffect } from 'react';

interface AppMetadata {
  latestVersionCode: number;
  latestVersionName: string;
  minimumVersionCode: number;
  forceUpdateBelow: number;
  playStoreUrl: string;
  releaseNotes: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

interface AppVersionState {
  isAndroidWebView: boolean;
  currentVersionCode: number | null;
  currentVersionName: string | null;
  latestVersionName: string;
  needsForceUpdate: boolean;
  playStoreUrl: string;
  isLoading: boolean;
}

declare global {
  interface Window {
    appVersion?: number;
    appVersionName?: string;
  }
}

const DEFAULT_PLAY_STORE = 'https://play.google.com/store/apps/details?id=online.saukimart.twa';

export function useAppVersion(): AppVersionState {
  const [state, setState] = useState<AppVersionState>({
    isAndroidWebView: false,
    currentVersionCode: null,
    currentVersionName: null,
    latestVersionName: '',
    needsForceUpdate: false,
    playStoreUrl: DEFAULT_PLAY_STORE,
    isLoading: false,
  });

  useEffect(() => {
    const isAndroidWebView = navigator.userAgent.includes('SaukiMartAndroid');

    if (!isAndroidWebView) {
      setState(prev => ({ ...prev, isAndroidWebView: false, isLoading: false }));
      return;
    }

    const currentVersionCode = typeof window.appVersion === 'number' ? window.appVersion : 0;
    const currentVersionName = typeof window.appVersionName === 'string' ? window.appVersionName : null;

    setState(prev => ({ ...prev, isAndroidWebView: true, currentVersionCode, currentVersionName, isLoading: true }));

    const controller = new AbortController();

    fetch('/api/app-metadata', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<AppMetadata>;
      })
      .then((meta: AppMetadata) => {
        setState({
          isAndroidWebView: true,
          currentVersionCode,
          currentVersionName,
          latestVersionName: meta.latestVersionName,
          needsForceUpdate: currentVersionCode < meta.forceUpdateBelow,
          playStoreUrl: meta.playStoreUrl,
          isLoading: false,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        // Silently fail — never crash the app over a version check
        setState(prev => ({
          ...prev,
          needsForceUpdate: false,
          isLoading: false,
        }));
      });

    return () => controller.abort();
  }, []);

  return state;
}
