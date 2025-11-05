import { Router, Request, Response } from 'express';
import multer from 'multer';
import azureSpeechService from '../services/azureSpeech';
import logger from '../utils/logger';

const router = Router();

// Configure multer for audio file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

/**
 * POST /api/speech/synthesize
 * Simplified TTS endpoint for chat interface
 */
router.post('/synthesize', async (req: Request, res: Response) => {
  try {
    const { text, voice, language } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }

    const audioBuffer = await azureSpeechService.textToSpeech(text, {
      voice: voice || 'en-ZA-LeahNeural',
      language: language || 'en-ZA',
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });

    res.send(audioBuffer);
  } catch (error) {
    logger.error('Synthesize error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Synthesis failed',
    });
  }
});

/**
 * POST /api/speech/transcribe
 * Simplified STT endpoint for chat interface
 * Accepts base64 encoded audio
 */
router.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const { audio } = req.body;

    if (!audio) {
      return res.status(400).json({
        success: false,
        error: 'Audio data is required',
      });
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio, 'base64');
    
    logger.info(`Transcribing audio (${audioBuffer.length} bytes)...`);

    const result = await azureSpeechService.speechToText(audioBuffer);

    res.json({
      success: true,
      text: result.text,
      confidence: result.confidence,
      duration: result.duration,
    });
  } catch (error) {
    logger.error('Transcribe error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Transcription failed',
    });
  }
});

/**
 * 🚀 PHASE 2: POST /api/speech/text-to-speech-stream
 * Streaming text-to-speech for lower perceived latency
 * Sends audio chunks as they're generated (first chunk in ~200-500ms)
 * 
 * Body:
 * {
 *   text: string;
 *   voice?: string;  // e.g., "en-ZA-LeahNeural"
 *   language?: string;  // e.g., "en-ZA"
 *   rate?: string;  // e.g., "+10%", "-10%"
 *   pitch?: string;  // e.g., "+5%", "-5%"
 * }
 * 
 * Returns: Chunked audio stream (MP3)
 */
router.post('/text-to-speech-stream', async (req: Request, res: Response) => {
  try {
    const { text, voice, language, rate, pitch } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Text must be less than 10,000 characters',
      });
    }

    logger.info(`🎵 Streaming TTS: ${text.substring(0, 50)}... (${text.length} chars)`);

    // Set headers for chunked streaming
    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });

    let chunkCount = 0;
    const startTime = Date.now();

    // Stream audio chunks as they're generated
    for await (const chunk of azureSpeechService.textToSpeechStream(text, {
      voice,
      language,
      rate,
      pitch,
    })) {
      chunkCount++;
      if (chunkCount === 1) {
        logger.info(`⚡ First chunk arrived in ${Date.now() - startTime}ms`);
      }
      res.write(chunk);
    }

    logger.info(`✅ Streaming complete: ${chunkCount} chunks in ${Date.now() - startTime}ms`);
    res.end();

  } catch (error) {
    logger.error('Streaming TTS error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Streaming text-to-speech failed',
      });
    } else {
      res.end();
    }
  }
});

/**
 * POST /api/speech/text-to-speech
 * Convert text to speech audio
 * 
 * Body:
 * {
 *   text: string;
 *   voice?: string;  // e.g., "en-ZA-LeahNeural"
 *   language?: string;  // e.g., "en-ZA"
 *   rate?: string;  // e.g., "+10%", "-10%"
 *   pitch?: string;  // e.g., "+5%", "-5%"
 * }
 * 
 * Returns: Audio file (MP3)
 */
router.post('/text-to-speech', async (req: Request, res: Response) => {
  try {
    const { text, voice, language, rate, pitch } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Text must be less than 10,000 characters',
      });
    }

    logger.info(`TTS request: ${text.substring(0, 50)}... (${text.length} chars)`);

    const audioBuffer = await azureSpeechService.textToSpeech(text, {
      voice,
      language,
      rate,
      pitch,
    });

    // Estimate cost
    const costEstimate = azureSpeechService.estimateTTSCost(text.length);
    logger.info(`TTS cost estimate: $${costEstimate.estimatedCost} for ${costEstimate.characters} chars`);

    // Return audio file
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'X-Cost-Estimate': costEstimate.estimatedCost.toString(),
      'X-Character-Count': costEstimate.characters.toString(),
    });

    res.send(audioBuffer);
  } catch (error) {
    logger.error('TTS error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Text-to-speech conversion failed',
    });
  }
});

/**
 * POST /api/speech/speech-to-text
 * Convert speech audio to text
 * 
 * Body: multipart/form-data with audio file
 * 
 * Returns:
 * {
 *   success: true;
 *   text: string;
 *   confidence: number;
 *   duration: number;
 *   language: string;
 * }
 */
router.post('/speech-to-text', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded. Please provide an audio file.',
      });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const language = (req.body.language as string) || 'en-ZA';

    logger.info(`STT request: ${audioBuffer.length} bytes, ${mimeType}, language: ${language}`);

    // Call Azure Speech Service
    const result = await azureSpeechService.speechToText(audioBuffer, language, mimeType);

    logger.info(`STT success: "${result.text}" (confidence: ${result.confidence})`);

    res.json({
      success: true,
      text: result.text,
      confidence: result.confidence,
      duration: result.duration,
      language: result.language || language,
    });
  } catch (error) {
    logger.error('STT error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Speech-to-text conversion failed',
    });
  }
});

/**
 * GET /api/speech/voices
 * Get available voices grouped by use case
 * 
 * Returns:
 * {
 *   success: true;
 *   voices: {
 *     'south-african': string[];
 *     'professional': string[];
 *     'friendly': string[];
 *     'business': string[];
 *     'multilingual-sa': string[];
 *   }
 * }
 */
router.get('/voices', (req: Request, res: Response) => {
  try {
    const voices = azureSpeechService.getRecommendedVoices();
    
    res.json({
      success: true,
      voices,
      defaultVoice: 'en-ZA-LeahNeural',
      defaultLanguage: 'en-ZA',
      region: 'southafricanorth',
      note: 'All voices are neural quality. South African voices are optimized for local accents.',
    });
  } catch (error) {
    logger.error('Get voices error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get voices',
    });
  }
});

/**
 * POST /api/speech/estimate-cost
 * Estimate TTS cost for given text
 * 
 * Body:
 * {
 *   text: string;
 * }
 * 
 * Returns:
 * {
 *   success: true;
 *   characters: number;
 *   estimatedCost: number;
 *   pricing: string;
 * }
 */
router.post('/estimate-cost', (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }

    const estimate = azureSpeechService.estimateTTSCost(text.length);

    res.json({
      success: true,
      characters: estimate.characters,
      estimatedCost: estimate.estimatedCost,
      pricing: '$16 per 1M characters (Neural voices)',
      note: 'Actual costs may vary. This is an estimate based on character count.',
    });
  } catch (error) {
    logger.error('Cost estimation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Cost estimation failed',
    });
  }
});

/**
 * POST /api/speech/test
 * Test Azure Speech Service with sample text
 * 
 * Returns: Audio file with test message
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { voice } = req.body;
    
    const testText = 'Hello from South Africa! This is a test of Azure Speech Service using the Johannesburg datacenter for ultra-low latency.';
    
    logger.info('Testing Azure Speech Service...');

    const audioBuffer = await azureSpeechService.textToSpeech(testText, {
      voice: voice || 'en-ZA-LeahNeural',
      language: 'en-ZA',
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'X-Test-Voice': voice || 'en-ZA-LeahNeural',
    });

    res.send(audioBuffer);
  } catch (error) {
    logger.error('TTS test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
    });
  }
});

export default router;
