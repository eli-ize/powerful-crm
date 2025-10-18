import { Router, Request, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

// Save Telnyx configuration
router.post('/config', async (req: Request, res: Response) => {
  try {
    const { apiKey, publicKey, connectionId } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required',
      });
    }

    logger.info('Saving Telnyx configuration', {
      hasApiKey: !!apiKey,
      hasPublicKey: !!publicKey,
      hasConnectionId: !!connectionId,
    });

    // TODO: Save to database (Prisma)
    // For now, just acknowledge receipt
    // In production, you would save this to a database table
    // Example:
    // await prisma.telnyxConfig.upsert({
    //   where: { userId: req.user.id },
    //   update: { apiKey, publicKey, connectionId },
    //   create: { userId: req.user.id, apiKey, publicKey, connectionId }
    // });

    res.json({
      success: true,
      message: 'Telnyx configuration saved successfully',
      data: {
        connectionId: connectionId || null,
        hasApiKey: !!apiKey,
        hasPublicKey: !!publicKey,
      },
    });
  } catch (error) {
    logger.error('Error saving Telnyx configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save Telnyx configuration',
    });
  }
});

// Get Telnyx configuration
router.get('/config', async (_req: Request, res: Response) => {
  try {
    // TODO: Retrieve from database
    // For now, return info about env config
    const config = await import('../config');
    const apiKey = config.default.telnyxApiKey;
    const connectionId = config.default.telnyxConnectionId;
    
    res.json({
      success: true,
      data: {
        hasApiKey: !!apiKey,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : null,
        hasPublicKey: !!config.default.telnyxPublicKey,
        connectionId: connectionId || null,
      },
    });
  } catch (error) {
    logger.error('Error retrieving Telnyx configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve Telnyx configuration',
    });
  }
});

// Save phone numbers configuration
router.post('/numbers', async (req: Request, res: Response) => {
  try {
    const { numbers } = req.body;

    if (!Array.isArray(numbers)) {
      return res.status(400).json({
        success: false,
        error: 'Numbers must be an array',
      });
    }

    logger.info('Saving phone numbers', { count: numbers.length });

    // TODO: Save to database
    // await prisma.telnyxNumber.createMany({ data: numbers });

    res.json({
      success: true,
      message: 'Phone numbers saved successfully',
      data: { count: numbers.length },
    });
  } catch (error) {
    logger.error('Error saving phone numbers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save phone numbers',
    });
  }
});

// Get phone numbers
router.get('/numbers', async (_req: Request, res: Response) => {
  try {
    // TODO: Retrieve from database
    // const numbers = await prisma.telnyxNumber.findMany();

    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    logger.error('Error retrieving phone numbers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve phone numbers',
    });
  }
});

// Fetch phone numbers from Telnyx API
router.get('/numbers/fetch', async (_req: Request, res: Response) => {
  try {
    const config = await import('../config');
    const apiKey = config.default.telnyxApiKey;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Telnyx API key not configured',
      });
    }

    logger.info('Fetching phone numbers from Telnyx API');

    // Fetch numbers from Telnyx
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Telnyx API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Telnyx data to our format
    const numbers = data.data.map((num: any) => ({
      id: num.id,
      phoneNumber: num.phone_number,
      displayName: num.phone_number,
      status: num.status,
      connectionId: num.connection_id || null,
      connectionName: num.connection_name || null,
      recordingEnabled: num.call_recording?.enabled || false,
    }));

    logger.info(`Fetched ${numbers.length} phone numbers from Telnyx`);

    res.json({
      success: true,
      data: numbers,
      count: numbers.length,
    });
  } catch (error: any) {
    logger.error('Error fetching phone numbers from Telnyx:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch phone numbers from Telnyx',
    });
  }
});

// Fetch SIP connections (trunks) from Telnyx
router.get('/sip-connections', async (_req: Request, res: Response) => {
  try {
    const config = await import('../config');
    const apiKey = config.default.telnyxApiKey;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Telnyx API key not configured',
      });
    }

    logger.info('Fetching SIP connections from Telnyx API');

    // Fetch SIP connections
    const response = await fetch('https://api.telnyx.com/v2/texml_applications', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Telnyx API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const connections = data.data.map((conn: any) => ({
      id: conn.id,
      connectionId: conn.connection_id,
      name: conn.friendly_name,
      status: conn.active ? 'active' : 'inactive',
      voice_url: conn.voice_url,
      voice_method: conn.voice_method,
      created_at: conn.created_at,
      updated_at: conn.updated_at,
    }));

    logger.info(`Fetched ${connections.length} SIP connections from Telnyx`);

    res.json({
      success: true,
      data: connections,
      count: connections.length,
    });
  } catch (error: any) {
    logger.error('Error fetching SIP connections:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch SIP connections',
    });
  }
});

// Create a new SIP connection (trunk)
router.post('/sip-connections', async (req: Request, res: Response) => {
  try {
    const config = await import('../config');
    const apiKey = config.default.telnyxApiKey;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Telnyx API key not configured',
      });
    }

    const { name, voice_url, voice_method = 'POST' } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Connection name is required',
      });
    }

    logger.info(`Creating new SIP connection: ${name}`);

    // Create SIP connection
    const response = await fetch('https://api.telnyx.com/v2/texml_applications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        friendly_name: name,
        voice_url: voice_url || `${config.default.backendUrl}/api/telnyx/voice-webhook`,
        voice_method: voice_method,
        active: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.detail || 'Failed to create SIP connection');
    }

    const data = await response.json();

    logger.info(`Created SIP connection with ID: ${data.data.connection_id}`);

    res.status(201).json({
      success: true,
      data: {
        id: data.data.id,
        connectionId: data.data.connection_id,
        name: data.data.friendly_name,
        status: 'active',
      },
    });
  } catch (error: any) {
    logger.error('Error creating SIP connection:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create SIP connection',
    });
  }
});

// Fetch credential-based SIP connections
router.get('/sip-credentials', async (_req: Request, res: Response) => {
  try {
    const config = await import('../config');
    const apiKey = config.default.telnyxApiKey;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Telnyx API key not configured',
      });
    }

    logger.info('Fetching credential-based SIP connections');

    // Fetch credential connections
    const response = await fetch('https://api.telnyx.com/v2/credential_connections', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Telnyx API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const connections = data.data.map((conn: any) => ({
      id: conn.id,
      connectionId: conn.id,
      name: conn.connection_name,
      status: conn.active ? 'active' : 'inactive',
      userName: conn.user_name,
      sipUri: conn.sip_uri_calling_preference,
      created_at: conn.created_at,
      updated_at: conn.updated_at,
    }));

    logger.info(`Fetched ${connections.length} credential-based connections`);

    res.json({
      success: true,
      data: connections,
      count: connections.length,
    });
  } catch (error: any) {
    logger.error('Error fetching credential connections:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch credential connections',
    });
  }
});

// Auto-setup Telnyx - Creates Call Control App with Outbound Profile
router.post('/auto-setup', async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required',
      });
    }

    logger.info('Starting Telnyx auto-setup');

    const config = await import('../config');
    const backendUrl = config.default.backendUrl;

    // Step 1: Get outbound voice profiles
    const profilesResponse = await fetch('https://api.telnyx.com/v2/outbound_voice_profiles', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!profilesResponse.ok) {
      throw new Error('Failed to fetch outbound voice profiles');
    }

    const profilesData: any = await profilesResponse.json();
    
    let outboundProfileId = null;
    if (profilesData.data && profilesData.data.length > 0) {
      outboundProfileId = profilesData.data[0].id;
      logger.info(`Using existing outbound profile: ${outboundProfileId}`);
    }

    // Step 2: Check if app already exists, otherwise create it
    const existingAppsResponse = await fetch('https://api.telnyx.com/v2/call_control_applications', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const existingAppsData: any = await existingAppsResponse.json();
    let connectionId = null;
    let appData: any = null;

    // Look for existing "Powerful CRM" app
    const existingApp = existingAppsData.data?.find((app: any) => 
      app.application_name.includes('Powerful CRM')
    );

    if (existingApp) {
      connectionId = existingApp.id;
      appData = { data: existingApp };
      logger.info(`Using existing Call Control Application: ${connectionId}`);

      // Update it with the outbound profile if missing
      if (outboundProfileId && !existingApp.outbound_voice_profile_id) {
        await fetch(`https://api.telnyx.com/v2/call_control_applications/${connectionId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            outbound_voice_profile_id: outboundProfileId,
          }),
        });
        logger.info(`Updated existing app with outbound profile`);
      }
    } else {
      // Create new app
      const appPayload: any = {
        application_name: `Powerful CRM Call Control ${Date.now()}`,
        webhook_event_url: `${backendUrl}/api/telnyx/webhook`,
        webhook_event_failover_url: '',
        webhook_timeout_secs: 25,
        active: true,
      };

      if (outboundProfileId) {
        appPayload.outbound_voice_profile_id = outboundProfileId;
      }

      const appResponse = await fetch('https://api.telnyx.com/v2/call_control_applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appPayload),
      });

      appData = await appResponse.json();

      if (!appResponse.ok) {
        throw new Error(appData.errors?.[0]?.detail || 'Failed to create Call Control Application');
      }

      connectionId = appData.data.id;
      logger.info(`Created new Call Control Application: ${connectionId}`);
    }

    // Step 3: If no outbound profile was assigned, try to update it
    if (!outboundProfileId && profilesData.data && profilesData.data.length > 0) {
      outboundProfileId = profilesData.data[0].id;
      
      const updateResponse = await fetch(`https://api.telnyx.com/v2/call_control_applications/${connectionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outbound_voice_profile_id: outboundProfileId,
        }),
      });

      if (updateResponse.ok) {
        logger.info(`Updated app with outbound profile: ${outboundProfileId}`);
      }
    }

    // Step 4: Fetch phone numbers
    const numbersResponse = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const numbersData: any = await numbersResponse.json();
    const phoneNumbers = numbersData.data?.map((num: any) => ({
      phoneNumber: num.phone_number,
      status: num.status,
      connectionId: num.connection_id,
      connectionName: num.connection_name,
    })) || [];

    res.json({
      success: true,
      message: 'Telnyx setup completed successfully',
      data: {
        connectionId,
        applicationName: appData.data.application_name,
        webhookUrl: appData.data.webhook_event_url,
        outboundProfileId,
        phoneNumbers,
        phoneNumbersCount: phoneNumbers.length,
      },
    });
  } catch (error: any) {
    logger.error('Error in auto-setup:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete auto-setup',
    });
  }
});

// Webhook handler for incoming calls and call events
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    logger.info('Telnyx webhook received', {
      eventType: event.data?.event_type,
      callControlId: event.data?.payload?.call_control_id,
    });

    const eventType = event.data?.event_type;
    const payload = event.data?.payload;

    // Respond immediately to Telnyx
    res.sendStatus(200);

    // Handle different call events
    switch (eventType) {
      case 'call.initiated':
        logger.info('Incoming call initiated', {
          from: payload?.from,
          to: payload?.to,
          callControlId: payload?.call_control_id,
        });
        
        // Answer the call
        if (payload?.call_control_id) {
          await fetch(`https://api.telnyx.com/v2/calls/${payload.call_control_id}/actions/answer`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${(await import('../config')).default.telnyxApiKey}`,
              'Content-Type': 'application/json',
            },
          });
        }
        break;

      case 'call.answered':
        logger.info('Call answered', {
          callControlId: payload?.call_control_id,
        });
        
        // Speak a message when call is answered
        if (payload?.call_control_id) {
          await fetch(`https://api.telnyx.com/v2/calls/${payload.call_control_id}/actions/speak`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${(await import('../config')).default.telnyxApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payload: 'Hello! This is Powerful CRM. Your call has been received.',
              voice: 'female',
              language: 'en-US',
            }),
          });
        }
        break;

      case 'call.hangup':
        logger.info('Call ended', {
          callControlId: payload?.call_control_id,
          hangupCause: payload?.hangup_cause,
        });
        break;

      case 'call.speak.ended':
        logger.info('Speech ended', {
          callControlId: payload?.call_control_id,
        });
        
        // Hang up after speaking
        if (payload?.call_control_id) {
          await fetch(`https://api.telnyx.com/v2/calls/${payload.call_control_id}/actions/hangup`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${(await import('../config')).default.telnyxApiKey}`,
              'Content-Type': 'application/json',
            },
          });
        }
        break;

      default:
        logger.debug('Unhandled webhook event', { eventType });
    }
  } catch (error) {
    logger.error('Error processing webhook:', error);
    // Still return 200 to prevent retries
    res.sendStatus(200);
  }
});

export default router;
