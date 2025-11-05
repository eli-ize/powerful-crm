import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';

import config from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { timeoutConfigs } from './middleware/requestTimeout';
import { healthMonitor } from './middleware/healthMonitor';

// Import routes
import authRoutes from './routes/auth';
import contactRoutes from './routes/contacts';
import dealRoutes from './routes/deals';
import campaignRoutes from './routes/campaigns';
import virtualAgentRoutes from './routes/virtualAgents';
import callRoutes from './routes/calls';
import activityRoutes from './routes/activities';
import emailRoutes from './routes/emails';
import placesRoutes from './routes/places';
import taskRoutes from './routes/tasks';
import noteRoutes from './routes/notes';
import analyticsRoutes from './routes/analytics';
import healthRoutes from './routes/health';
import telnyxRoutes from './routes/telnyx';
import telnyxAdminRoutes from './routes/admin/telnyx';
import configAdminRoutes from './routes/admin/config';
import costAdminRoutes from './routes/admin/costs';
import speechRoutes from './routes/speech';
import aiChatRoutes from './routes/ai-chat';
import customerCommunicationsRoutes from './routes/customerCommunications';
import autopilotRoutes from './routes/autopilot-hybrid';
import azureOpenAIService from './services/azureOpenAI';
import { AudioStreamingWebSocket } from './routes/websocket';

// 🎭 Sentiment Analysis Function
interface SentimentResult {
  emotion: 'excited' | 'happy' | 'neutral' | 'concerned' | 'frustrated' | 'angry' | 'sad';
  score: number; // -1 to +1 (negative to positive)
  confidence: number;
}

function analyzeSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  
  // Emotion keywords with weights
  const emotionPatterns = {
    excited: { keywords: ['amazing', 'excited', 'awesome', 'fantastic', 'love it', 'perfect', 'incredible', '!'], weight: 0.9 },
    happy: { keywords: ['happy', 'great', 'good', 'nice', 'thanks', 'appreciate', 'glad', 'pleased'], weight: 0.7 },
    frustrated: { keywords: ['frustrated', 'annoying', 'terrible', 'awful', 'hate', 'worst', 'useless'], weight: -0.8 },
    angry: { keywords: ['angry', 'furious', 'outraged', 'unacceptable', 'ridiculous'], weight: -0.9 },
    sad: { keywords: ['sad', 'disappointed', 'unhappy', 'unfortunate', 'sorry'], weight: -0.6 },
    concerned: { keywords: ['worried', 'concerned', 'not sure', 'confused', 'unsure', 'hesitant'], weight: -0.4 }
  };
  
  let totalScore = 0;
  let matchCount = 0;
  let detectedEmotion: SentimentResult['emotion'] = 'neutral';
  let maxWeight = 0;
  
  // Check for emotion keywords
  for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
    for (const keyword of pattern.keywords) {
      if (lowerText.includes(keyword)) {
        totalScore += pattern.weight;
        matchCount++;
        
        // Track strongest emotion
        if (Math.abs(pattern.weight) > Math.abs(maxWeight)) {
          maxWeight = pattern.weight;
          detectedEmotion = emotion as SentimentResult['emotion'];
        }
      }
    }
  }
  
  // Normalize score
  const normalizedScore = matchCount > 0 ? totalScore / matchCount : 0;
  const confidence = Math.min(matchCount / 3, 1); // More keywords = higher confidence
  
  return {
    emotion: detectedEmotion,
    score: normalizedScore,
    confidence
  };
}

// 🎭 Adjust voice settings based on detected emotion
function getVoiceSettingsForEmotion(emotion: string) {
  const settings = {
    voice: 'en-ZA-LeahNeural',
    language: 'en-ZA' as const,
    rate: '+10%',
    pitch: '+5%'
  };
  
  switch (emotion) {
    case 'excited':
      settings.rate = '+15%'; // Faster, energetic
      settings.pitch = '+8%'; // Higher, enthusiastic
      break;
    case 'happy':
      settings.rate = '+12%';
      settings.pitch = '+6%';
      break;
    case 'frustrated':
    case 'angry':
      settings.rate = '+5%'; // Slower, calmer
      settings.pitch = '0%'; // Normal pitch
      break;
    case 'sad':
    case 'concerned':
      settings.rate = '+8%'; // Gentle pace
      settings.pitch = '+3%'; // Slightly warm
      break;
    default: // neutral
      settings.rate = '+10%';
      settings.pitch = '+5%';
  }
  
  return settings;
}

const app = express();
const server = createServer(app);

// Initialize WebSocket server for real-time audio streaming
const audioStreamingWs = new AudioStreamingWebSocket(server);

// Socket.IO setup for real-time features
const io = new Server(server, {
  cors: {
    origin: true,  // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST']
  },
});

// Trust proxy if configured
if (config.trustProxy) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: true,  // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Emergency test endpoint (before all routes)
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Serve static frontend files in production
// Serve static files in both dev and production
const frontendPath = path.join(__dirname, '..', 'public');
app.use(express.static(frontendPath));
logger.info(`📦 Serving static files from: ${frontendPath}`);

// Global request timeout (with exceptions for WebSockets)
app.use(timeoutConfigs.normal);

// Health check endpoint (before authentication) - use fast timeout
app.use('/api/health', timeoutConfigs.fast, healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/virtual-agents', virtualAgentRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customer-communications', customerCommunicationsRoutes); // Professional email communications
app.use('/api/telnyx', telnyxRoutes);
app.use('/api/admin/telnyx', telnyxAdminRoutes);
app.use('/api/admin/config', configAdminRoutes);
app.use('/api/admin/costs', costAdminRoutes);
app.use('/api/speech', timeoutConfigs.ai, speechRoutes); // AI timeout for speech
app.use('/api/ai-chat', timeoutConfigs.ai, aiChatRoutes); // AI timeout for chat
app.use('/api/autopilot', autopilotRoutes); // AI Autopilot system

// AI status endpoint (simple status check)
app.get('/api/ai/status', (req, res) => {
  try {
    const status = {
      azureOpenAI: !!config.azureOpenAIKey && !!config.azureOpenAIEndpoint,
      azureSpeech: !!config.azureSpeechKey && !!config.azureSpeechRegion,
      telnyx: !!config.telnyxApiKey,
      timestamp: new Date().toISOString(),
      serverStatus: 'healthy'
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('AI status check failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'AI status check failed' 
    });
  }
});

// Import voice services for real-time streaming
import { VoiceCallHandler } from './services/voiceCallHandler';
import azureSpeechService from './services/azureSpeech';

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`🔌 User connected: ${socket.id}`);
  
  let currentSessionId: string | null = null;
  let audioChunks: Buffer[] = [];
  let isProcessing = false;
  
  // Join user-specific room for notifications
  socket.on('join', (userId: string) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their room`);
  });
  
  // Handle real-time call updates
  socket.on('call_update', (data) => {
    socket.broadcast.emit('call_status_changed', data);
  });
  
  // Start voice conversation session
  socket.on('start_voice_session', async (data: { purpose: string; customerName: string; context?: string }) => {
    try {
      const sessionId = `voice-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      // Set session ID IMMEDIATELY so audio chunks can be processed
      currentSessionId = sessionId;
      logger.info(`🎤 Voice session ID set: ${sessionId}`);
      
      // Initialize call session
      const session = VoiceCallHandler.initSession(sessionId, socket.id, 'live-chat');
      session.purpose = data.purpose;
      session.context = { name: data.customerName, details: data.context };
      
      // Notify client session is ready (before greeting)
      socket.emit('session_ready', { sessionId });
      
      // Generate greeting (this takes time)
      const greeting = await VoiceCallHandler.generateGreeting(session);
      logger.info(`✅ Greeting generated: ${greeting.substring(0, 50)}...`);
      
      // Convert greeting to speech
      const audioBuffer = await azureSpeechService.textToSpeech(greeting, {
        voice: 'en-ZA-LeahNeural',
        language: 'en-ZA'
      });
      
      socket.emit('session_started', {
        sessionId,
        greeting,
        audio: audioBuffer.toString('base64')
      });
      
      logger.info(`🎤 Voice session fully started: ${sessionId}`);
    } catch (error) {
      logger.error('❌ Failed to start voice session:', error);
      socket.emit('error', { message: 'Failed to start voice session' });
      currentSessionId = null;
    }
  });
  
  // 🎤 Handle audio streaming for Azure Speech STT (advanced emotion detection)
  socket.on('audio_chunk_azure', async (data: { audio: string; format: string; sessionId?: string }) => {
    // Debug logging
    logger.info(`📥 Audio chunk: ${data.audio?.length || 0} bytes, format: ${data.format}, sessionId: ${data.sessionId || 'MISSING'}`);
    
    // Use the sessionId from the frontend (from /api/ai-chat/start)
    const sessionId = data.sessionId || currentSessionId;
    
    if (!sessionId) {
      logger.warn('⚠️ Audio chunk received but no session ID provided');
      socket.emit('error', { message: 'No session ID. Please start a session first.' });
      return;
    }
    
    // Sync the session with this socket connection
    if (!currentSessionId) {
      currentSessionId = sessionId;
      logger.info(`✅ Session synced from audio chunk: ${sessionId}`);
    }
    
    if (isProcessing) {
      logger.warn('⚠️ Already processing, skipping chunk');
      return;
    }
    
    try {
      // Accumulate audio chunks
      const chunk = Buffer.from(data.audio, 'base64');
      audioChunks.push(chunk);
      
      logger.info(`🎙️ Audio chunk received (${chunk.length} bytes), format: ${data.format}`);
      
      // Process every 3 chunks (~9 seconds of audio for better accuracy)
      if (audioChunks.length >= 3) {
        isProcessing = true;
        const fullAudio = Buffer.concat(audioChunks);
        audioChunks = [];
        
        logger.info(`🎤 Processing ${fullAudio.length} bytes with Azure Speech (advanced STT)...`);
        
        try {
          // 🎭 AZURE SPEECH with emotion detection
          const transcription = await azureSpeechService.speechToText(fullAudio, 'en-ZA', data.format);
          
          if (transcription.text && transcription.text.trim().length > 0) {
            logger.info(`📝 Azure STT: "${transcription.text}" (confidence: ${transcription.confidence})`);
            
            // Analyze sentiment from transcription
            const sentiment = analyzeSentiment(transcription.text);
            logger.info(`🎭 Detected: ${sentiment.emotion} (score: ${sentiment.score.toFixed(2)})`);
            
            socket.emit('transcription', { 
              text: transcription.text,
              emotion: sentiment.emotion,
              score: sentiment.score,
              confidence: transcription.confidence
            });
            
            // Generate AI response with emotion context (simple mode without DB)
            let aiResponse: string;
            try {
              logger.info(`🔍 Looking up session: ${sessionId}`);
              aiResponse = await VoiceCallHandler.processCallerInputWithEmotion(
                sessionId, 
                transcription.text, 
                sentiment
              );
              
              logger.info(`📤 AI response received: "${aiResponse.substring(0, 50)}..."`);
              
              // Check if it's the error fallback message
              if (aiResponse.includes('I apologize, there was an issue')) {
                logger.warn('⚠️ VoiceCallHandler returned error message, using fallback');
                throw new Error('Session not found');
              }
            } catch (error) {
              // Fallback: Generate response directly without session
              logger.warn(`⚠️ Using fallback AI response (error: ${error instanceof Error ? error.message : 'unknown'})`);
              const prompt = `You are a friendly AI assistant. The user said: "${transcription.text}". They sound ${sentiment.emotion}. Respond warmly and helpfully in 1-2 sentences.`;
              const fallbackResponse = await azureOpenAIService.generateChatCompletion({
                messages: [
                  { role: 'system', content: 'You are a friendly, helpful AI assistant for a CRM system.' },
                  { role: 'user', content: prompt }
                ]
              });
              aiResponse = fallbackResponse.content || 'I apologize, I am having technical difficulties. Please try again.';
            }
            
            logger.info(`✅ AI response: "${aiResponse.substring(0, 50)}..."`);
            
            // Convert to speech with emotion-aware voice settings
            const voiceSettings = getVoiceSettingsForEmotion(sentiment.emotion);
            const responseAudio = await azureSpeechService.textToSpeech(aiResponse, voiceSettings);
            
            socket.emit('ai_response', {
              text: aiResponse,
              emotion: sentiment.emotion,
              audio: responseAudio.toString('base64')
            });
            
            logger.info(`🔊 Response sent (${responseAudio.length} bytes)`);
          } else {
            logger.warn('⚠️ No speech detected');
            socket.emit('error', { message: 'No speech detected. Please speak louder.' });
          }
        } catch (sttError) {
          logger.error('❌ Azure STT error:', sttError);
          socket.emit('error', { message: 'Speech recognition failed. Please try again.' });
        }
        
        isProcessing = false;
      }
    } catch (error) {
      logger.error('❌ Error processing audio:', error);
      socket.emit('error', { message: 'Failed to process audio' });
      isProcessing = false;
      audioChunks = [];
    }
  });

  // Legacy: Handle text transcriptions from Web Speech API (browser-side STT)
  socket.on('voice_transcript', async (data: { text: string }) => {
    if (!currentSessionId) {
      logger.warn('⚠️ Transcript received but no session active');
      return;
    }
    
    if (isProcessing) {
      logger.warn('⚠️ Already processing, skipping transcript');
      return;
    }
    
    try {
      isProcessing = true;
      const transcript = data.text.trim();
      
      if (!transcript) {
        logger.warn('⚠️ Empty transcript received');
        isProcessing = false;
        return;
      }
      
      logger.info(`📝 Transcript from browser: "${transcript}"`);
      
      // 🎭 ANALYZE SENTIMENT & EMOTION from text
      const sentiment = analyzeSentiment(transcript);
      let sentimentType: string;
      if (sentiment.score > 0) {
        sentimentType = 'positive';
      } else if (sentiment.score < 0) {
        sentimentType = 'negative';
      } else {
        sentimentType = 'neutral';
      }
      logger.info(`🎭 Detected: ${sentiment.emotion} (${sentimentType}, confidence: ${Math.abs(sentiment.score).toFixed(2)})`);
      
      socket.emit('transcription', { 
        text: transcript,
        sentiment: sentiment.emotion,
        score: sentiment.score
      });
      
      // Generate AI response with emotion context
      logger.info(`🤖 Generating AI response with ${sentiment.emotion} awareness...`);
      const aiResponse = await VoiceCallHandler.processCallerInputWithEmotion(
        currentSessionId, 
        transcript, 
        sentiment
      );
      
      logger.info(`✅ AI response: "${aiResponse.substring(0, 50)}..."`);
      
      // Convert to speech
      const responseAudio = await azureSpeechService.textToSpeech(aiResponse, {
        voice: 'en-ZA-LeahNeural',
        language: 'en-ZA'
      });
      
      socket.emit('ai_response', {
        text: aiResponse,
        audio: responseAudio.toString('base64')
      });
      
      logger.info(`🔊 Response sent (${responseAudio.length} bytes audio)`);
      isProcessing = false;
    } catch (error) {
      logger.error('❌ Error processing transcript:', error);
      socket.emit('error', { message: 'Failed to process your message' });
      isProcessing = false;
    }
  });
  
  // Receive audio stream chunks (legacy - for server-side STT)
  socket.on('audio_chunk', async (data: { audio: string; isFinal: boolean }) => {
    if (!currentSessionId) {
      logger.warn('⚠️ Audio chunk received but no session active');
      return;
    }
    
    if (isProcessing) {
      logger.warn('⚠️ Already processing, skipping chunk');
      return;
    }
    
    try {
      // Accumulate audio chunks
      const chunk = Buffer.from(data.audio, 'base64');
      audioChunks.push(chunk);
      
      logger.info(`🎙️ Processing audio (${chunk.length} bytes), total chunks: ${audioChunks.length}`);
      
      // Process when final chunk received
      if (data.isFinal && audioChunks.length > 0) {
        isProcessing = true;
        const fullAudio = Buffer.concat(audioChunks);
        const totalSize = fullAudio.length;
        audioChunks = [];
        
        logger.info(`� Transcribing ${totalSize} bytes of audio...`);
        
        try {
          // Transcribe speech
          const transcription = await azureSpeechService.speechToText(fullAudio, 'en-ZA');
          
          logger.info(`📝 Transcription result: "${transcription.text}" (confidence: ${transcription.confidence})`);
          
          if (transcription.text && transcription.text.trim().length > 0) {
            socket.emit('transcription', { text: transcription.text });
            
            // Generate AI response
            logger.info(`🤖 Generating AI response for: "${transcription.text}"`);
            const aiResponse = await VoiceCallHandler.processCallerInput(currentSessionId, transcription.text);
            
            logger.info(`✅ AI response generated: "${aiResponse.substring(0, 50)}..."`);
            
            // Convert to speech
            const responseAudio = await azureSpeechService.textToSpeech(aiResponse, {
              voice: 'en-ZA-LeahNeural',
              language: 'en-ZA'
            });
            
            socket.emit('ai_response', {
              text: aiResponse,
              audio: responseAudio.toString('base64')
            });
            
            logger.info(`🔊 Audio response sent (${responseAudio.length} bytes)`);
          } else {
            logger.warn('⚠️ No speech detected in audio');
            socket.emit('error', { message: 'No speech detected. Please try speaking again.' });
          }
        } catch (sttError) {
          logger.error('❌ STT Error:', sttError);
          socket.emit('error', { message: 'Speech recognition failed. Please try again.' });
        }
        
        isProcessing = false;
      }
    } catch (error) {
      logger.error('❌ Error processing audio chunk:', error);
      socket.emit('error', { message: 'Failed to process audio' });
      isProcessing = false;
      audioChunks = [];
    }
  });
  
  // End voice session
  socket.on('end_voice_session', () => {
    if (currentSessionId) {
      logger.info(`🔇 Voice session ended: ${currentSessionId}`);
      currentSessionId = null;
      audioChunks = [];
      isProcessing = false;
    }
  });
  
  socket.on('disconnect', () => {
    logger.info(`🔌 User disconnected: ${socket.id}`);
    if (currentSessionId) {
      currentSessionId = null;
      audioChunks = [];
    }
  });
});

// Export io for use in other modules
export { io };

// Catch-all route to serve index.html for SPA routing
app.get('*', (req, res) => {
  // Only handle non-API routes
  if (!req.path.startsWith('/api')) {
    if (config.nodeEnv === 'production') {
      // In production, serve the built React app
      const indexPath = path.join(__dirname, '..', 'public', 'index.html');
      res.sendFile(indexPath);
    } else {
      // In development, redirect to Vite dev server
      res.redirect(`${config.frontendUrl}${req.path}`);
    }
  }
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = () => {
  return new Promise((resolve, reject) => {
    try {
      logger.info(`📝 Server object type: ${typeof server}`);
      logger.info(`📝 Server listening: ${server.listening}`);
      
      const actualServer = server.listen(config.port, '0.0.0.0', () => {
        logger.info(`🚀 Server running on port ${config.port}`);
        logger.info(`📱 Frontend URL: ${config.frontendUrl}`);
        logger.info(`🔧 Environment: ${config.nodeEnv}`);
        logger.info(`📝 After listen - Server listening: ${actualServer.listening}`);
        logger.info(`📝 Server address: ${JSON.stringify(actualServer.address())}`);
        
        if (config.nodeEnv === 'development') {
          logger.info(`📊 API Documentation: http://localhost:${config.port}/api/health`);
        }
        
        logger.info('✅ Listen callback completed - server should be accepting connections');
        resolve(true);
      });
      
      logger.info('⏳ server.listen() called - waiting for callback...');
      
      // Add error handler for server
      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`Port ${config.port} is already in use`);
        } else {
          logger.error('Server error:', error);
        }
        reject(error instanceof Error ? error : new Error(String(error)));
      });
      
      logger.info('✅ Error handler registered');
    } catch (error) {
      logger.error('Failed to start server:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
};

// Handle uncaught exceptions - DON'T EXIT IN PRODUCTION
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  logger.error('Uncaught Exception:', error);
  logger.error('Stack:', error.stack);
  
  // Record error for health monitoring
  healthMonitor.recordError(error, 'uncaughtException');
  
  // In development, exit to restart. In production, try to recover.
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => process.exit(1), 1000);
  } else {
    logger.warn('⚠️ Production mode - attempting to continue despite uncaught exception');
  }
});

// Handle unhandled promise rejections - DON'T EXIT IN PRODUCTION
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Record error for health monitoring
  const error = reason instanceof Error ? reason : new Error(String(reason));
  healthMonitor.recordError(error, 'unhandledRejection');
  
  // In development, exit to restart. In production, try to recover.
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => process.exit(1), 1000);
  } else {
    logger.warn('⚠️ Production mode - attempting to continue despite unhandled rejection');
  }
});

// Log when process is about to exit
process.on('exit', (code) => {
  console.error(`🛑 PROCESS EXITING with code: ${code}`);
  logger.info(`🛑 Process exiting with code: ${code}`);
});

// Log beforeExit event
process.on('beforeExit', (code) => {
  console.error(`⚠️ BEFORE EXIT event fired with code: ${code}`);
  logger.info(`⚠️ beforeExit event fired with code: ${code}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start the server
// Note: With tsx, require.main !== module, so we check both conditions
const isMainModule = require.main === module || process.argv[1]?.includes('server.ts');

if (isMainModule) {
  logger.info('📍 Starting server (main module)');
  
  // Keep process alive (prevent premature exit)
  const keepAlive = setInterval(() => {
    // This interval prevents the event loop from becoming empty
  }, 60000); // Check every minute
  
  // ⚡ KEEP AI MODEL WARM - Prevents cold starts for voice calls
  // Cold starts can add 1-2 seconds to first response after idle
  if (config.azureOpenAIKey) {
    const AI_KEEPALIVE_INTERVAL = 30000; // 30 seconds - more frequent warmup
    
    // Immediate warmup on startup
    (async () => {
      try {
        const axios = require('axios');
        logger.info('🔥 Warming up AI model on startup...');
        
        const start = Date.now();
        await axios.post(
          `${config.azureOpenAIEndpoint}/chat/completions`,
          {
            model: 'Phi-4-mini-instruct',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 1
          },
          {
            headers: {
              'Authorization': `Bearer ${config.azureOpenAIKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const time = Date.now() - start;
        logger.info(`✅ AI warmed up in ${time}ms - ready for fast calls!`);
      } catch (error: any) {
        logger.warn('⚠️ Initial AI warmup failed:', error.message);
      }
    })();
    
    setInterval(async () => {
      try {
        const axios = require('axios');
        const start = Date.now();
        
        await axios.post(
          `${config.azureOpenAIEndpoint}/chat/completions`,
          {
            model: 'Phi-4-mini-instruct',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 1
          },
          {
            headers: {
              'Authorization': `Bearer ${config.azureOpenAIKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const time = Date.now() - start;
        logger.info(`⚡ AI keepalive ping: ${time}ms`);
      } catch (error: any) {
        logger.warn('⚠️ AI keepalive failed:', error.message);
      }
    }, AI_KEEPALIVE_INTERVAL);
    
    logger.info('⚡ AI model keepalive enabled (30s interval) - preventing cold starts');
  }
  
  startServer()
    .then(() => {
      logger.info('✅ Server started successfully and running');
      logger.info('🔄 Process will stay alive (keepAlive interval active)');
    })
    .catch((error) => {
      clearInterval(keepAlive);
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    });
} else {
  logger.info('📍 Server not started (imported as module)');
}

export default app;
