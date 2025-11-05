/**
 * Unified API Key Management Service
 * Single source of truth for all API keys with validation, testing, and auto-discovery
 */

import { apiClient } from '../utils/api';

// Storage key - single source of truth
const STORAGE_KEY = 'crm_unified_config';

export interface ApiKeyConfig {
  apiKey: string;
  validated: boolean;
  validatedAt?: string;
  resources?: any;
}

export interface UnifiedConfig {
  googlePlaces?: ApiKeyConfig;
  telnyx?: ApiKeyConfig & {
    publicKey?: string;
    connectionId?: string;
    phoneNumbers?: any[];
    connections?: any[];
  };
  hunter?: ApiKeyConfig;
  apollo?: ApiKeyConfig;
  clearbit?: ApiKeyConfig;
  azureOpenAI?: ApiKeyConfig;
  anthropic?: ApiKeyConfig;
}

export class ApiKeyManager {
  private static config: UnifiedConfig | null = null;

  /**
   * Load configuration from localStorage
   */
  static loadConfig(): UnifiedConfig {
    if (this.config) return this.config;

    const stored = localStorage.getItem(STORAGE_KEY);
    this.config = stored ? JSON.parse(stored) : {};
    return this.config!;
  }

  /**
   * Save configuration to localStorage
   */
  private static saveConfig(config: UnifiedConfig): void {
    this.config = config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  /**
   * Get API key for a service
   */
  static getApiKey(service: keyof UnifiedConfig): string | null {
    const config = this.loadConfig();
    return config[service]?.apiKey || null;
  }

  /**
   * Check if service has a valid API key
   */
  static hasApiKey(service: keyof UnifiedConfig): boolean {
    const config = this.loadConfig();
    return !!config[service]?.apiKey;
  }

  /**
   * Check if API key is validated
   */
  static isValidated(service: keyof UnifiedConfig): boolean {
    const config = this.loadConfig();
    return config[service]?.validated || false;
  }

  /**
   * Validate API key format
   */
  static validateKeyFormat(service: string, apiKey: string): boolean {
    const patterns: Record<string, RegExp> = {
      telnyx: /^KEY[0-9A-Za-z_-]+$/,
      googlePlaces: /^AIza[0-9A-Za-z_-]{35}$/,
      hunter: /^[a-f0-9]{40}$/,
      apollo: /^[a-zA-Z0-9_-]+$/,
      clearbit: /^sk_[a-f0-9]{32}$/,
      azureOpenAI: /^[a-f0-9]{32}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9_-]+$/,
    };

    const pattern = patterns[service];
    if (!pattern) return true; // Unknown service, assume valid

    return pattern.test(apiKey);
  }

  /**
   * Test API key by making a test request
   */
  static async testApiKey(service: string, apiKey: string): Promise<boolean> {
    try {
      switch (service) {
        case 'telnyx':
          return await this.testTelnyxKey(apiKey);
        case 'googlePlaces':
          return await this.testGooglePlacesKey(apiKey);
        default:
          return true; // Skip test for unknown services
      }
    } catch (error) {
      console.error(`Failed to test ${service} API key:`, error);
      return false;
    }
  }

  /**
   * Test Telnyx API key
   */
  private static async testTelnyxKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Test Google Places API key
   */
  private static async testGooglePlacesKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=0,0&radius=1000&key=${apiKey}`
      );
      const data = await response.json();
      return data.status !== 'REQUEST_DENIED';
    } catch {
      return false;
    }
  }

  /**
   * Auto-discover resources for a service
   */
  static async discoverResources(service: string, apiKey: string): Promise<any> {
    switch (service) {
      case 'telnyx':
        return await this.discoverTelnyxResources(apiKey);
      default:
        return {};
    }
  }

  /**
   * Discover Telnyx resources (phone numbers, connections, profiles)
   */
  private static async discoverTelnyxResources(apiKey: string): Promise<any> {
    try {
      const [numbersRes, connectionsRes] = await Promise.all([
        fetch('https://api.telnyx.com/v2/phone_numbers', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        }),
        fetch('https://api.telnyx.com/v2/call_control_applications', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        }),
      ]);

      const numbers = numbersRes.ok ? await numbersRes.json() : { data: [] };
      const connections = connectionsRes.ok ? await connectionsRes.json() : { data: [] };

      return {
        phoneNumbers: numbers.data?.map((n: any) => ({
          id: n.id,
          phoneNumber: n.phone_number,
          status: n.status,
          connectionId: n.connection_id,
        })) || [],
        connections: connections.data?.map((c: any) => ({
          id: c.id,
          name: c.application_name,
          webhookUrl: c.webhook_event_url,
        })) || [],
      };
    } catch (error) {
      console.error('Failed to discover Telnyx resources:', error);
      return { phoneNumbers: [], connections: [] };
    }
  }

  /**
   * Save API key with validation and auto-discovery
   */
  static async saveApiKey(
    service: keyof UnifiedConfig,
    apiKey: string,
    additionalConfig?: any
  ): Promise<{ success: boolean; resources?: any; error?: string }> {
    // 1. Validate format
    if (!this.validateKeyFormat(service, apiKey)) {
      return { success: false, error: 'Invalid API key format' };
    }

    // 2. Test the key
    const isValid = await this.testApiKey(service, apiKey);
    if (!isValid) {
      return { success: false, error: 'API key test failed - key may be invalid or expired' };
    }

    // 3. Auto-discover resources
    const resources = await this.discoverResources(service, apiKey);

    // 4. Save to backend (if available)
    try {
      await apiClient.post('/api/admin/config', {
        service,
        apiKey,
        ...additionalConfig,
      });
    } catch (error) {
      console.warn('Failed to save to backend (may not be running):', error);
      // Continue anyway - save to localStorage
    }

    // 5. Save to localStorage
    const config = this.loadConfig();
    config[service] = {
      apiKey,
      validated: true,
      validatedAt: new Date().toISOString(),
      resources,
      ...additionalConfig,
    } as any;

    this.saveConfig(config);

    return { success: true, resources };
  }

  /**
   * Remove API key for a service
   */
  static removeApiKey(service: keyof UnifiedConfig): void {
    const config = this.loadConfig();
    delete config[service];
    this.saveConfig(config);
  }

  /**
   * Get all configured services
   */
  static getConfiguredServices(): string[] {
    const config = this.loadConfig();
    return Object.keys(config).filter(key => config[key as keyof UnifiedConfig]?.apiKey);
  }

  /**
   * Get configuration for a specific service
   */
  static getServiceConfig(service: keyof UnifiedConfig): ApiKeyConfig | null {
    const config = this.loadConfig();
    return config[service] || null;
  }

  /**
   * Migrate old configuration to new unified format
   */
  static async migrateOldConfig(): Promise<void> {
    // Check if already migrated
    const unified = localStorage.getItem(STORAGE_KEY);
    if (unified) return;

    console.log('Migrating to unified configuration...');

    const newConfig: UnifiedConfig = {};

    // Migrate from old crm_api_keys
    const oldKeys = localStorage.getItem('crm_api_keys');
    if (oldKeys) {
      try {
        const parsed = JSON.parse(oldKeys);
        if (parsed.googlePlaces) {
          newConfig.googlePlaces = { apiKey: parsed.googlePlaces, validated: false };
        }
        if (parsed.hunter) {
          newConfig.hunter = { apiKey: parsed.hunter, validated: false };
        }
        if (parsed.apollo) {
          newConfig.apollo = { apiKey: parsed.apollo, validated: false };
        }
        if (parsed.clearbit) {
          newConfig.clearbit = { apiKey: parsed.clearbit, validated: false };
        }
      } catch (error) {
        console.error('Failed to migrate crm_api_keys:', error);
      }
    }

    // Migrate from old telnyx_config
    const oldTelnyx = localStorage.getItem('telnyx_config');
    if (oldTelnyx) {
      try {
        const parsed = JSON.parse(oldTelnyx);
        if (parsed.apiKey) {
          newConfig.telnyx = {
            apiKey: parsed.apiKey,
            publicKey: parsed.publicKey,
            connectionId: parsed.connectionId,
            validated: false,
          };
        }
      } catch (error) {
        console.error('Failed to migrate telnyx_config:', error);
      }
    }

    // Save unified config
    if (Object.keys(newConfig).length > 0) {
      this.saveConfig(newConfig);
      console.log('Migration complete!', newConfig);
    }
  }

  /**
   * Clear all configuration
   */
  static clearAll(): void {
    this.config = null;
    localStorage.removeItem(STORAGE_KEY);
    // Also remove old keys
    localStorage.removeItem('crm_api_keys');
    localStorage.removeItem('telnyx_config');
  }
}

// Auto-migrate on load
if (typeof window !== 'undefined') {
  ApiKeyManager.migrateOldConfig().catch(console.error);
}
