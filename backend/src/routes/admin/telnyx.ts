import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Telnyx from 'telnyx';

const router = Router();
const prisma = new PrismaClient();

// Get Telnyx configuration
router.get('/config', async (req, res) => {
  try {
    // Get from system config
    const apiKeyConfig = await prisma.systemConfig.findUnique({
      where: { key: 'TELNYX_API_KEY' }
    });

    const publicKeyConfig = await prisma.systemConfig.findUnique({
      where: { key: 'TELNYX_PUBLIC_KEY' }
    });

    const webhookUrlConfig = await prisma.systemConfig.findUnique({
      where: { key: 'TELNYX_WEBHOOK_URL' }
    });

    const connectionIdConfig = await prisma.systemConfig.findUnique({
      where: { key: 'TELNYX_CONNECTION_ID' }
    });

    const applicationIdConfig = await prisma.systemConfig.findUnique({
      where: { key: 'TELNYX_APPLICATION_ID' }
    });

    res.json({
      config: {
        apiKey: apiKeyConfig?.value ? '***' + apiKeyConfig.value.slice(-4) : undefined,
        publicKey: publicKeyConfig?.value ? '***' + publicKeyConfig.value.slice(-4) : undefined,
        webhookUrl: webhookUrlConfig?.value,
        connectionId: connectionIdConfig?.value,
        applicationId: applicationIdConfig?.value,
      }
    });
  } catch (error) {
    console.error('Error getting Telnyx config:', error);
    res.status(500).json({ message: 'Failed to get configuration' });
  }
});

// Save Telnyx configuration
router.post('/config', async (req, res) => {
  try {
    const { apiKey, publicKey, webhookUrl, connectionId, applicationId } = req.body;

    // Save each config value
    if (apiKey && apiKey !== '***') {
      await prisma.systemConfig.upsert({
        where: { key: 'TELNYX_API_KEY' },
        update: { value: apiKey },
        create: {
          key: 'TELNYX_API_KEY',
          value: apiKey
        },
      });
    }

    if (publicKey && publicKey !== '***') {
      await prisma.systemConfig.upsert({
        where: { key: 'TELNYX_PUBLIC_KEY' },
        update: { value: publicKey },
        create: {
          key: 'TELNYX_PUBLIC_KEY',
          value: publicKey
        },
      });
    }

    if (webhookUrl) {
      await prisma.systemConfig.upsert({
        where: { key: 'TELNYX_WEBHOOK_URL' },
        update: { value: webhookUrl },
        create: {
          key: 'TELNYX_WEBHOOK_URL',
          value: webhookUrl
        },
      });
    }

    if (connectionId) {
      await prisma.systemConfig.upsert({
        where: { key: 'TELNYX_CONNECTION_ID' },
        update: { value: connectionId },
        create: {
          key: 'TELNYX_CONNECTION_ID',
          value: connectionId
        },
      });
    }

    if (applicationId) {
      await prisma.systemConfig.upsert({
        where: { key: 'TELNYX_APPLICATION_ID' },
        update: { value: applicationId },
        create: {
          key: 'TELNYX_APPLICATION_ID',
          value: applicationId
        },
      });
    }

    res.json({ message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Error saving Telnyx config:', error);
    res.status(500).json({ message: 'Failed to save configuration' });
  }
});

// Get Telnyx status
router.get('/status', async (req, res) => {
  try {
    // Get API key from database
    const apiKeyConfig = await prisma.systemConfig.findUnique({
      where: { key: 'TELNYX_API_KEY' }
    });

    if (!apiKeyConfig?.value) {
      return res.json({
        configured: false,
        connected: false
      });
    }

    // Test connection
    try {
      const telnyx = new Telnyx(apiKeyConfig.value);
      
      // Get account balance
      const balance = await telnyx.balance.retrieve();
      
      // Get phone numbers
      const phoneNumbers = await telnyx.phoneNumbers.list({ page: { size: 10 } });

      res.json({
        configured: true,
        connected: true,
        balance: Number.parseFloat(balance.data.balance),
        phoneNumbers: phoneNumbers.data.map((number: any) => ({
          id: number.id,
          phone_number: number.phone_number,
          status: number.status,
          connection_name: number.connection_name,
          features: number.features
        }))
      });
    } catch (error: any) {
      console.error('Telnyx connection error:', error);
      res.json({
        configured: true,
        connected: false,
        lastError: error.message
      });
    }
  } catch (error) {
    console.error('Error checking Telnyx status:', error);
    res.status(500).json({ message: 'Failed to check status' });
  }
});

// Test Telnyx connection
router.post('/test', async (req, res) => {
  try {
    // Get API key from database
    const apiKeyConfig = await prisma.systemConfig.findUnique({
      where: { key: 'TELNYX_API_KEY' }
    });

    if (!apiKeyConfig?.value) {
      return res.status(400).json({ message: 'Telnyx API key not configured' });
    }

    const telnyx = new Telnyx(apiKeyConfig.value);
    
    // Test by retrieving balance
    const balance = await telnyx.balance.retrieve();
    
    res.json({
      message: `Successfully connected! Balance: $${balance.data.balance}`,
      balance: parseFloat(balance.data.balance),
      currency: balance.data.currency
    });
  } catch (error: any) {
    console.error('Telnyx test failed:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to connect to Telnyx' 
    });
  }
});

// Make test call
router.post('/test-call', async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Get API key and connection ID from database
    const apiKeyConfig = await prisma.systemConfig.findUnique({
      where: { key: 'TELNYX_API_KEY' }
    });

    const connectionIdConfig = await prisma.systemConfig.findUnique({
      where: { key: 'TELNYX_CONNECTION_ID' }
    });

    if (!apiKeyConfig?.value) {
      return res.status(400).json({ message: 'Telnyx API key not configured' });
    }

    if (!connectionIdConfig?.value) {
      return res.status(400).json({ message: 'Telnyx Connection ID not configured' });
    }

    const telnyx = new Telnyx(apiKeyConfig.value);
    
    // Get first available phone number
    const phoneNumbers = await telnyx.phoneNumbers.list({ page: { size: 1 } });
    
    if (phoneNumbers.data.length === 0) {
      return res.status(400).json({ message: 'No phone numbers available' });
    }

    const from = phoneNumbers.data[0].phone_number;

    // Make test call using telnyx service
    const telnyxService = require('../services/telnyx').default;
    const call = await telnyxService.initiateCall({
      to,
      from,
      connectionId: connectionIdConfig.value
    });

    res.json({
      message: 'Test call initiated successfully',
      callId: call.call_control_id,
      from,
      to
    });
  } catch (error: any) {
    console.error('Test call failed:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to initiate test call' 
    });
  }
});

export default router;
