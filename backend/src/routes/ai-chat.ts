import express, { Request, Response } from 'express';
import logger from '../utils/logger';
import { VoiceCallHandler } from '../services/voiceCallHandler';

const router = express.Router();

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface ChatSession {
  sessionId: string;
  purpose: string;
  context?: string;
  messages: ChatMessage[];
  startedAt: string;
}

// In-memory sessions (replace with database later)
const chatSessions = new Map<string, ChatSession>();

/**
 * POST /api/ai-chat/start
 * Start a new AI chat session
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { purpose, context, customerName } = req.body;

    if (!purpose) {
      return res.status(400).json({ error: 'Purpose is required' });
    }

    const sessionId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Initialize call session for greeting generation
    const callSession = VoiceCallHandler.initSession(
      sessionId,
      '+27637250867', // Your number
      'chat' // Destination
    );
    
    // Add purpose and context to session
    callSession.purpose = purpose;
    callSession.context = { name: customerName, details: context };

    // Generate AI greeting
    const greeting = await VoiceCallHandler.generateGreeting(callSession);

    const session: ChatSession = {
      sessionId,
      purpose,
      context: context || customerName,
      messages: [
        {
          role: 'assistant',
          content: greeting,
          timestamp: new Date().toISOString()
        }
      ],
      startedAt: new Date().toISOString()
    };

    chatSessions.set(sessionId, session);

    logger.info(`💬 Chat session started: ${sessionId}, purpose: ${purpose}`);

    res.json({
      sessionId,
      greeting,
      purpose,
      context: session.context
    });
  } catch (error) {
    logger.error('Failed to start chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

/**
 * POST /api/ai-chat/message
 * Send a message and get AI response
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Add user message to history
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Get call session for context
    const callSession = VoiceCallHandler.getSession(sessionId);
    if (!callSession) {
      return res.status(404).json({ error: 'Call session not found' });
    }

    // Generate AI response (processCallerInput handles adding to history)
    logger.info(`💬 Processing message for session ${sessionId}: "${message}"`);
    const aiResponse = await VoiceCallHandler.processCallerInput(sessionId, message);

    // Add AI response to chat history
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });

    logger.info(`🤖 AI response (${aiResponse.length} chars): ${aiResponse.substring(0, 100)}...`);

    res.json({
      response: aiResponse,
      messageCount: session.messages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to process chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * GET /api/ai-chat/session/:sessionId
 * Get chat session history
 */
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    logger.error('Failed to get session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * DELETE /api/ai-chat/session/:sessionId
 * End a chat session
 */
router.delete('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (chatSessions.delete(sessionId)) {
      logger.info(`💬 Chat session ended: ${sessionId}`);
      res.json({ message: 'Session ended successfully' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    logger.error('Failed to end session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

/**
 * GET /api/ai-chat/status
 * Get AI services status and configuration
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const config = require('../config').default;
    
    // Check service availability
    const status = {
      azureOpenAI: {
        configured: !!config.azureOpenAIKey && !!config.azureOpenAIEndpoint,
        endpoint: config.azureOpenAIEndpoint ? config.azureOpenAIEndpoint.replace(config.azureOpenAIKey || '', '***') : null,
        model: 'Phi-4-mini-instruct',
        region: 'South Africa North (Johannesburg)'
      },
      azureSpeech: {
        configured: !!config.azureSpeechKey && !!config.azureSpeechRegion,
        region: config.azureSpeechRegion,
        services: ['speech-to-text', 'text-to-speech']
      },
      telnyx: {
        configured: !!config.telnyxApiKey,
        services: ['voice-calling', 'webhooks']
      },
      activeSessions: chatSessions.size,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get AI status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get AI services status' 
    });
  }
});

/**
 * GET /api/ai-chat/sessions
 * List all active chat sessions
 */
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const sessions = Array.from(chatSessions.values()).map(session => ({
      sessionId: session.sessionId,
      purpose: session.purpose,
      context: session.context,
      messageCount: session.messages.length,
      startedAt: session.startedAt,
      lastMessage: session.messages.at(-1)
    }));

    res.json({ sessions, count: sessions.length });
  } catch (error) {
    logger.error('Failed to list sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

export default router;
