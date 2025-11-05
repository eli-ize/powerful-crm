/**
 * Admin Configuration API
 * Allows updating backend configuration without restart
 */

import { Router, Request, Response } from 'express';
import { runtimeConfig } from '../../services/runtimeConfig';
import logger from '../../utils/logger';

const router = Router();

/**
 * GET /api/admin/config
 * Get all configuration (masked sensitive values)
 */
router.get('/config', async (_req: Request, res: Response) => {
  try {
    const configs = await runtimeConfig.getAll();

    res.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    logger.error('Error getting configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve configuration',
    });
  }
});

/**
 * POST /api/admin/config
 * Save API key or configuration
 */
router.post('/config', async (req: Request, res: Response) => {
  try {
    const { service, apiKey, ...additionalConfig } = req.body;

    if (!service || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Service name and API key are required',
      });
    }

    // Map service name to config key
    const configKey = mapServiceToKey(service);
    if (!configKey) {
      return res.status(400).json({
        success: false,
        error: `Unknown service: ${service}`,
      });
    }

    // Save API key
    await runtimeConfig.set(configKey, apiKey, 'api_key');

    // Save additional configuration
    if (service === 'telnyx') {
      if (additionalConfig.publicKey) {
        await runtimeConfig.set('TELNYX_PUBLIC_KEY', additionalConfig.publicKey, 'api_key');
      }
      if (additionalConfig.connectionId) {
        await runtimeConfig.set('TELNYX_CONNECTION_ID', additionalConfig.connectionId, 'setting');
      }
    }

    logger.info(`Configuration updated for service: ${service}`);

    res.json({
      success: true,
      message: `Configuration saved for ${service}`,
    });
  } catch (error) {
    logger.error('Error saving configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save configuration',
    });
  }
});

/**
 * GET /api/admin/config/:key
 * Get specific configuration value
 */
router.get('/config/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const value = runtimeConfig.get(key);

    if (!value) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found',
      });
    }

    res.json({
      success: true,
      data: {
        key,
        hasValue: !!value,
        // Don't return actual value for security
      },
    });
  } catch (error) {
    logger.error(`Error getting configuration ${req.params.key}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve configuration',
    });
  }
});

/**
 * DELETE /api/admin/config/:key
 * Delete configuration value
 */
router.delete('/config/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    await runtimeConfig.delete(key);

    res.json({
      success: true,
      message: `Configuration ${key} deleted`,
    });
  } catch (error) {
    logger.error(`Error deleting configuration ${req.params.key}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete configuration',
    });
  }
});

/**
 * Map service name to configuration key
 */
function mapServiceToKey(service: string): string | null {
  const mapping: Record<string, string> = {
    telnyx: 'TELNYX_API_KEY',
    googlePlaces: 'GOOGLE_PLACES_API_KEY',
    hunter: 'HUNTER_API_KEY',
    apollo: 'APOLLO_API_KEY',
    clearbit: 'CLEARBIT_API_KEY',
    azureOpenAI: 'AZURE_OPENAI_KEY',
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
  };

  return mapping[service] || null;
}

export default router;
