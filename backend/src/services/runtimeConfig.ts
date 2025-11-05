/**
 * Runtime Configuration Service
 * Allows updating backend configuration without restart
 */

import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import config from '../config';

const prisma = new PrismaClient();

// Encryption key from environment or generate one
const ENCRYPTION_KEY = process.env.CONFIG_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Runtime configuration store
 * Overrides config from .env file
 */
class RuntimeConfigService {
  private runtimeConfig: Map<string, string> = new Map();

  constructor() {
    this.loadFromDatabase().catch(error => {
      logger.error('Failed to load runtime config from database:', error);
    });
  }

  /**
   * Load all configuration from database
   */
  async loadFromDatabase(): Promise<void> {
    try {
      const configs = await prisma.systemConfig.findMany();
      
      for (const cfg of configs) {
        const decrypted = cfg.encrypted ? this.decrypt(cfg.value) : cfg.value;
        this.runtimeConfig.set(cfg.key, decrypted);
      }

      logger.info(`Loaded ${configs.length} runtime configurations from database`);
    } catch (error) {
      logger.error('Error loading runtime config:', error);
    }
  }

  /**
   * Get configuration value
   * Returns runtime value if exists, otherwise falls back to env config
   */
  get(key: string): string | undefined {
    // Check runtime config first
    if (this.runtimeConfig.has(key)) {
      return this.runtimeConfig.get(key);
    }

    // Fall back to env config
    const configKey = this.mapKeyToConfig(key);
    if (configKey && config[configKey as keyof typeof config]) {
      return config[configKey as keyof typeof config] as string;
    }

    return undefined;
  }

  /**
   * Set configuration value
   * Saves to database and updates runtime config
   */
  async set(key: string, value: string, category: string = 'setting'): Promise<void> {
    try {
      const encrypted = this.encrypt(value);

      await prisma.systemConfig.upsert({
        where: { key },
        update: {
          value: encrypted,
          category,
          updatedAt: new Date(),
        },
        create: {
          key,
          value: encrypted,
          category,
          encrypted: true,
        },
      });

      this.runtimeConfig.set(key, value);
      logger.info(`Updated runtime config: ${key}`);

      // Reinitialize services if needed
      await this.reinitializeServices(key, value);
    } catch (error) {
      logger.error(`Failed to set runtime config ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete configuration value
   */
  async delete(key: string): Promise<void> {
    try {
      await prisma.systemConfig.delete({ where: { key } });
      this.runtimeConfig.delete(key);
      logger.info(`Deleted runtime config: ${key}`);
    } catch (error) {
      logger.error(`Failed to delete runtime config ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get all configuration (masked sensitive values)
   */
  async getAll(): Promise<Record<string, { value?: string; hasValue: boolean; category?: string }>> {
    const result: Record<string, { value?: string; hasValue: boolean; category?: string }> = {};

    const configs = await prisma.systemConfig.findMany();

    for (const cfg of configs) {
      const isSensitive = this.isSensitiveKey(cfg.key);
      const decrypted = cfg.encrypted ? this.decrypt(cfg.value) : cfg.value;

      result[cfg.key] = {
        value: isSensitive ? this.maskValue(decrypted) : decrypted,
        hasValue: !!decrypted,
        category: cfg.category || undefined,
      };
    }

    return result;
  }

  /**
   * Encrypt value using AES-256-GCM
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt value
   */
  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted value format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Check if key contains sensitive data
   */
  private isSensitiveKey(key: string): boolean {
    const sensitivePatterns = ['api_key', 'secret', 'password', 'token', 'key'];
    return sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern));
  }

  /**
   * Mask sensitive value for display
   */
  private maskValue(value: string): string {
    if (value.length <= 8) return '****';
    return `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
  }

  /**
   * Map API key to config property
   */
  private mapKeyToConfig(key: string): string | null {
    const mapping: Record<string, string> = {
      GOOGLE_PLACES_API_KEY: 'googlePlacesApiKey',
      TELNYX_API_KEY: 'telnyxApiKey',
      TELNYX_PUBLIC_KEY: 'telnyxPublicKey',
      TELNYX_CONNECTION_ID: 'telnyxConnectionId',
      AZURE_OPENAI_KEY: 'azureOpenAIKey',
      OPENAI_API_KEY: 'openaiApiKey',
    };

    return mapping[key] || null;
  }

  /**
   * Reinitialize services when config changes
   */
  private async reinitializeServices(key: string, value: string): Promise<void> {
    try {
      if (key === 'TELNYX_API_KEY') {
        // Reinitialize Telnyx service
        const telnyxModule = await import('../services/telnyx');
        const Telnyx = (await import('telnyx')).default;
        if (telnyxModule.default) {
          (telnyxModule.default as any).client = new Telnyx(value);
          logger.info('Reinitialized Telnyx service with new API key');
        }
      }
      // Add more service reinitializations as needed
    } catch (error) {
      logger.error('Failed to reinitialize service:', error);
    }
  }
}

// Singleton instance
export const runtimeConfig = new RuntimeConfigService();

export default runtimeConfig;
