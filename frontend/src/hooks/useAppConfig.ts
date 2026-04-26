/**
 * Institutional Configuration Provider
 * Standardizes access to environment-driven platform settings.
 */
export const useAppConfig = () => {
  return {
    appName: import.meta.env.VITE_APP_NAME || 'MyLMS',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
    version: '4.0.1',
    isProduction: import.meta.env.PROD,
  };
};

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MyLMS';
