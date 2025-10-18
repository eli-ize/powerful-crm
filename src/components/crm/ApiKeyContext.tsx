import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiKeys {
  googlePlaces: string;
  hunter: string;
  apollo: string;
  clearbit: string;
}

interface ApiKeyContextType {
  apiKeys: ApiKeys;
  setApiKey: (key: keyof ApiKeys, value: string) => void;
  hasApiKey: (key: keyof ApiKeys) => boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem('crm_api_keys');
    return saved ? JSON.parse(saved) : {
      googlePlaces: '',
      hunter: '',
      apollo: '',
      clearbit: '',
    };
  });

  const setApiKey = (key: keyof ApiKeys, value: string) => {
    const updated = { ...apiKeys, [key]: value };
    setApiKeys(updated);
    localStorage.setItem('crm_api_keys', JSON.stringify(updated));
  };

  const hasApiKey = (key: keyof ApiKeys) => {
    return !!apiKeys[key];
  };

  return (
    <ApiKeyContext.Provider value={{ apiKeys, setApiKey, hasApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeys() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within ApiKeyProvider');
  }
  return context;
}
