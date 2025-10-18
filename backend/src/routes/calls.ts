import { Router, Request, Response } from 'express';
import logger from '../utils/logger';
import telnyxService, { TelnyxService } from '../services/telnyx';

const router = Router();

// Get call logs
router.get('/', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching call logs');

    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    logger.error('Error fetching call logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch call logs',
    });
  }
});

// Create call (initiate outbound call)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { to, from, connectionId, message } = req.body;

    if (!to || !from) {
      return res.status(400).json({
        success: false,
        error: 'Phone numbers (to and from) are required',
      });
    }

    // Validate and format phone numbers
    const formattedTo = TelnyxService.formatPhoneNumber(to);
    const formattedFrom = TelnyxService.formatPhoneNumber(from);

    if (!TelnyxService.validatePhoneNumber(formattedTo)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid "to" phone number. Use E.164 format (e.g., +1234567890)',
      });
    }

    if (!TelnyxService.validatePhoneNumber(formattedFrom)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid "from" phone number. Use E.164 format (e.g., +1234567890)',
      });
    }

    logger.info(`Initiating call from ${formattedFrom} to ${formattedTo}`);

    // Initiate the call using Telnyx
    const callResult = await telnyxService.initiateCall({
      to: formattedTo,
      from: formattedFrom,
      connectionId,
    });

    // If there's a message, send it as speech after answering
    if (message) {
      logger.info(`Will send message to call: ${callResult.call_control_id}`);
    }

    res.status(201).json({
      success: true,
      data: {
        id: callResult.call_control_id,
        callLegId: callResult.call_leg_id,
        callSessionId: callResult.call_session_id,
        status: callResult.is_alive ? 'initiated' : 'failed',
        to: formattedTo,
        from: formattedFrom,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error initiating call:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate call',
    });
  }
});

// Hangup call
router.post('/:callControlId/hangup', async (req: Request, res: Response) => {
  try {
    const { callControlId } = req.params;

    await telnyxService.hangupCall(callControlId);

    res.json({
      success: true,
      message: 'Call terminated successfully',
    });
  } catch (error) {
    logger.error('Error hanging up call:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to hangup call',
    });
  }
});

// Send speech to active call
router.post('/:callControlId/speak', async (req: Request, res: Response) => {
  try {
    const { callControlId } = req.params;
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }

    await telnyxService.sendSpeech(callControlId, text, voice);

    res.json({
      success: true,
      message: 'Speech sent successfully',
    });
  } catch (error) {
    logger.error('Error sending speech:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send speech',
    });
  }
});

// Webhook endpoint for Telnyx events
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    logger.info('Received Telnyx webhook', { body: req.body });

    // Handle the webhook event
    telnyxService.handleWebhook(req.body);

    // Respond immediately to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
    });
  }
});

export default router;