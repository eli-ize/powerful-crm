/**
 * Custom React hooks for configuration management
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiKeyManager, UnifiedConfig } from '../services/apiKeyManager';

/**
 * Hook to manage API keys with auto-save and validation
 */
export function useApiKeys() {
  const [config, setConfig] = useState<UnifiedConfig>(() => ApiKeyManager.loadConfig());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reload config from storage
  const reloadConfig = useCallback(() => {
    setConfig(ApiKeyManager.loadConfig());
  }, []);

  // Check if service has API key
  const hasApiKey = useCallback((service: keyof UnifiedConfig): boolean => {
    return ApiKeyManager.hasApiKey(service);
  }, []);

  // Get API key for service
  const getApiKey = useCallback((service: keyof UnifiedConfig): string | null => {
    return ApiKeyManager.getApiKey(service);
  }, []);

  // Check if API key is validated
  const isValidated = useCallback((service: keyof UnifiedConfig): boolean => {
    return ApiKeyManager.isValidated(service);
  }, []);

  // Save API key with validation
  const saveApiKey = useCallback(
    async (service: keyof UnifiedConfig, apiKey: string, additionalConfig?: any) => {
      setLoading(true);
      setError(null);

      try {
        const result = await ApiKeyManager.saveApiKey(service, apiKey, additionalConfig);
        
        if (result.success) {
          reloadConfig();
          return { success: true, resources: result.resources };
        } else {
          setError(result.error || 'Failed to save API key');
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [reloadConfig]
  );

  // Remove API key
  const removeApiKey = useCallback(
    (service: keyof UnifiedConfig) => {
      ApiKeyManager.removeApiKey(service);
      reloadConfig();
    },
    [reloadConfig]
  );

  // Get service configuration
  const getServiceConfig = useCallback((service: keyof UnifiedConfig) => {
    return ApiKeyManager.getServiceConfig(service);
  }, []);

  return {
    config,
    loading,
    error,
    hasApiKey,
    getApiKey,
    isValidated,
    saveApiKey,
    removeApiKey,
    getServiceConfig,
    reloadConfig,
  };
}

/**
 * Hook for a specific service's API key
 */
export function useServiceApiKey(service: keyof UnifiedConfig) {
  const {
    hasApiKey: hasKey,
    getApiKey: getKey,
    isValidated: validated,
    saveApiKey: save,
    removeApiKey: remove,
    getServiceConfig,
    loading,
    error,
  } = useApiKeys();

  const [apiKey, setApiKey] = useState<string>(() => getKey(service) || '');
  const [hasApiKey, setHasApiKey] = useState(() => hasKey(service));
  const [isValidated, setIsValidated] = useState(() => validated(service));
  const [serviceConfig, setServiceConfig] = useState(() => getServiceConfig(service));

  // Update state when config changes
  useEffect(() => {
    setApiKey(getKey(service) || '');
    setHasApiKey(hasKey(service));
    setIsValidated(validated(service));
    setServiceConfig(getServiceConfig(service));
  }, [service, getKey, hasKey, validated, getServiceConfig]);

  const saveKey = useCallback(
    async (key: string, additionalConfig?: any) => {
      const result = await save(service, key, additionalConfig);
      if (result.success) {
        setApiKey(key);
        setHasApiKey(true);
        setIsValidated(true);
      }
      return result;
    },
    [save, service]
  );

  const removeKey = useCallback(() => {
    remove(service);
    setApiKey('');
    setHasApiKey(false);
    setIsValidated(false);
  }, [remove, service]);

  return {
    apiKey,
    hasApiKey,
    isValidated,
    serviceConfig,
    loading,
    error,
    saveApiKey: saveKey,
    removeApiKey: removeKey,
  };
}
