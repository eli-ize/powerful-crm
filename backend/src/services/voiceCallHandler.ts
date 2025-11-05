import logger from '../utils/logger';
import azureOpenAI from './azureOpenAI';
import azureSpeech from './azureSpeech';

interface CallTranscriptEntry {
  timestamp: Date;
  speaker: 'AI' | 'Customer';
  text: string;
  durationMs?: number; // How long it took to generate/transcribe
}

interface CallSession {
  callControlId: string;
  from: string;
  to: string;
  conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  transcript: CallTranscriptEntry[]; // Timestamped conversation for analysis
  startTime: Date;
  lastActivity: Date;
  stage: 'greeting' | 'qualification' | 'pitch' | 'objection_handling' | 'closing' | 'follow_up';
  purpose?: string;  // AI call purpose
  context?: any;     // Additional context (customer name, lead info, etc.)
}

// In-memory session storage (in production, use Redis)
const activeSessions = new Map<string, CallSession>();

export class VoiceCallHandler {
  /**
   * Initialize a new call session
   */
  static initSession(callControlId: string, from: string, to: string): CallSession {
    const session: CallSession = {
      callControlId,
      from,
      to,
      conversationHistory: [
        {
          role: 'system',
          content: `You are a warm, empathetic South African business assistant for Powerful CRM.

MIRRORING & ACTIVE LISTENING:
- Acknowledge the customer's emotions and tone
- Repeat back key points to show understanding ("So what I'm hearing is...")
- Match their energy level (excited = enthusiastic, concerned = thoughtful)
- Use their words and phrases when responding

NATURAL CONVERSATION:
- Speak like a real person, not a robot
- Use natural pauses: "Well...", "You know...", "I see..."
- Show empathy: "That makes sense", "I understand", "Great question"
- Keep responses under 25 words but make them conversational

PERSONALITY:
- Friendly and professional
- Genuinely curious about their needs
- Patient and understanding
- Positive but authentic (not fake cheerful)

Ask one question at a time. Build rapport naturally.`
        }
      ],
      transcript: [], // Track timestamped conversation for debugging
      startTime: new Date(),
      lastActivity: new Date(),
      stage: 'greeting'
    };

    activeSessions.set(callControlId, session);
    logger.info('📞 Call session initialized', { callControlId, from, to });
    
    return session;
  }

  /**
   * Get existing session or create new one
   */
  static getSession(callControlId: string): CallSession | null {
    return activeSessions.get(callControlId) || null;
  }

  /**
   * Generate AI greeting based on call purpose
   */
  static async generateGreeting(session: CallSession): Promise<string> {
    try {
      logger.info('🤖 Generating AI greeting...', { 
        purpose: session.purpose, 
        context: session.context 
      });
      
      // Build purpose-specific system prompt
      let systemPrompt = 'You are a professional South African business assistant for Powerful CRM.';
      let greetingPrompt = 'Call just connected. Give a warm professional greeting and ask how you can help.';
      
      const customerName = session.context?.name || '';
      
      switch (session.purpose) {
        case 'lead_qualification':
          systemPrompt += ' You are calling to qualify this lead and understand their business needs.';
          greetingPrompt = `Introduce yourself, mention you're calling from Powerful CRM${customerName ? ` for ${customerName}` : ''}, and briefly ask about their business needs. Keep it under 20 words.`;
          break;
          
        case 'follow_up':
          systemPrompt += ' You are following up on a previous conversation.';
          greetingPrompt = `Greet ${customerName || 'the customer'}, mention you're following up from Powerful CRM, and ask how things are going. Under 20 words.`;
          break;
          
        case 'appointment_reminder':
          systemPrompt += ' You are calling to remind about an upcoming appointment.';
          greetingPrompt = `Greet ${customerName || 'the customer'}, remind them about their appointment, and confirm they're still able to attend. Under 20 words.`;
          break;
          
        case 'demo_booking':
          systemPrompt += ' You are calling to schedule a product demo.';
          greetingPrompt = `Greet ${customerName || 'the customer'}, mention you're from Powerful CRM, and ask if they'd like to see a quick demo. Under 20 words.`;
          break;
          
        case 'survey':
          systemPrompt += ' You are conducting a quick customer satisfaction survey.';
          greetingPrompt = `Greet ${customerName || 'the customer'}, mention you're from Powerful CRM, and ask if they have 2 minutes for feedback. Under 20 words.`;
          break;
          
        default:
          // General incoming call
          greetingPrompt = 'Call just connected. Give a warm professional greeting and ask how you can help.';
      }
      
      systemPrompt += '\nBe warm, helpful, and concise. Keep responses under 25 words for phone calls. Ask one question at a time.';
      
      // Update session system prompt
      session.conversationHistory[0].content = systemPrompt;
      
      let greeting = '';
      for await (const chunk of azureOpenAI.generateChatCompletionStream({
        messages: [
          session.conversationHistory[0],
          {
            role: 'user',
            content: greetingPrompt
          }
        ],
        temperature: 0.7,
        maxTokens: 80  // Increased for complete greetings (was 40)
      })) {
        if (!chunk.done) {
          greeting += chunk.content;
        }
      }

      const finalGreeting = greeting.trim() || 'Hello! This is Powerful CRM calling. How are you today?';
      
      // Add to conversation history
      session.conversationHistory.push({
        role: 'assistant',
        content: finalGreeting
      });
      
      // Track in transcript for analysis
      session.transcript.push({
        timestamp: new Date(),
        speaker: 'AI',
        text: finalGreeting
      });
      
      session.lastActivity = new Date();

      logger.info('✅ Greeting generated:', { greeting: finalGreeting });
      
      return finalGreeting;
    } catch (error) {
      logger.error('❌ Greeting generation failed:', error);
      return 'Hello! Thank you for calling Powerful CRM. How can I help you today?';
    }
  }

  /**
   * Process caller speech with emotion awareness and generate AI response
   */
  static async processCallerInputWithEmotion(
    callControlId: string, 
    transcribedText: string,
    sentiment?: { emotion: string; score: number; confidence: number }
  ): Promise<string> {
    const session = this.getSession(callControlId);
    
    if (!session) {
      logger.warn('⚠️ No session found for call', { callControlId });
      return 'I apologize, there was an issue. Please call back.';
    }

    // Track customer's words in transcript
    session.transcript.push({
      timestamp: new Date(),
      speaker: 'Customer',
      text: transcribedText
    });

    try {
      logger.info('💬 Processing caller input:', { text: transcribedText, emotion: sentiment?.emotion });

      // 🎭 Add emotion-aware context to the message
      let contextualMessage = transcribedText;
      if (sentiment && sentiment.confidence > 0.3) {
        const emotionContext = {
          'excited': '[Customer sounds excited and enthusiastic]',
          'happy': '[Customer sounds pleased and positive]',
          'frustrated': '[Customer sounds frustrated - be extra empathetic]',
          'angry': '[Customer sounds upset - prioritize de-escalation]',
          'sad': '[Customer sounds disappointed - show compassion]',
          'concerned': '[Customer sounds worried - provide reassurance]',
          'neutral': ''
        };
        
        const emotionNote = emotionContext[sentiment.emotion as keyof typeof emotionContext] || '';
        if (emotionNote) {
          contextualMessage = `${emotionNote} ${transcribedText}`;
        }
      }

      // Add caller message to history with emotion context
      session.conversationHistory.push({
        role: 'user',
        content: contextualMessage
      });

      const responseStart = Date.now();

      // 🎭 Adjust AI temperature based on emotion (more creative for emotional responses)
      const temperature = sentiment && Math.abs(sentiment.score) > 0.5 ? 0.8 : 0.6;

      // Generate AI response with streaming
      let response = '';
      for await (const chunk of azureOpenAI.generateChatCompletionStream({
        messages: session.conversationHistory,
        temperature,
        maxTokens: 200  // Increased for complete conversational responses (was 40)
      })) {
        if (!chunk.done) {
          response += chunk.content;
        }
      }

      const finalResponse = response.trim() || 'I see. Could you tell me more about that?';

      // Add AI response to history (without emotion annotations)
      session.conversationHistory.push({
        role: 'assistant',
        content: finalResponse
      });
      
      // Track AI response in transcript with generation time
      session.transcript.push({
        timestamp: new Date(),
        speaker: 'AI',
        text: finalResponse,
        durationMs: Date.now() - responseStart
      });
      
      session.lastActivity = new Date();

      logger.info('✅ AI response generated:', { response: finalResponse, emotion: sentiment?.emotion });

      return finalResponse;
    } catch (error) {
      logger.error('❌ Response generation failed:', error);
      return 'I apologize, could you repeat that?';
    }
  }

  /**
   * Legacy method for backward compatibility (calls emotion-aware version)
   */
  static async processCallerInput(
    callControlId: string, 
    transcribedText: string
  ): Promise<string> {
    return this.processCallerInputWithEmotion(callControlId, transcribedText);
  }

  /**
   * Convert text to South African speech audio
   */
  static async textToSpeech(text: string): Promise<Buffer> {
    try {
      logger.info('🗣️ Converting to speech...', { text });
      
      const audioBuffer = await azureSpeech.textToSpeech(
        text,
        {
          voice: 'en-ZA-LeahNeural', // Professional SA female voice
          language: 'en-ZA'
        }
      );

      logger.info('✅ Speech generated:', { size: audioBuffer.length });
      
      return audioBuffer;
    } catch (error) {
      logger.error('❌ Speech generation failed:', error);
      throw error;
    }
  }

  /**
   * Transcribe caller audio to text
   */
  static async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      logger.info('🎤 Transcribing audio...', { size: audioBuffer.length });

      // Transcribe with Azure Speech
      const result = await azureSpeech.speechToText(
        audioBuffer,
        'en-ZA' // South African English
      );

      logger.info('✅ Transcription complete:', { text: result.text });
      
      return result.text;
    } catch (error) {
      logger.error('❌ Transcription failed:', error);
      throw error;
    }
  }

  /**
   * End call session and generate summary
   */
  static async endSession(callControlId: string): Promise<void> {
    const session = activeSessions.get(callControlId);
    
    if (session) {
      const duration = Date.now() - session.startTime.getTime();
      
      // Generate call summary using AI
      const summary = await this.generateCallSummary(session);
      const transcript = this.formatTranscript(session);
      
      // Log complete call analysis
      logger.info('📞 Call session ended', {
        callControlId,
        from: session.from,
        to: session.to,
        purpose: session.purpose,
        duration: `${(duration / 1000).toFixed(1)}s`,
        exchanges: session.transcript.filter(t => t.speaker === 'Customer').length,
        summary,
        transcript
      });

      // Save to file for analysis
      await this.saveCallLog(callControlId, session, summary, transcript);

      activeSessions.delete(callControlId);
    }
  }

  /**
   * Generate AI summary of the call
   */
  static async generateCallSummary(session: CallSession): Promise<string> {
    try {
      const conversationText = session.transcript
        .map(t => `${t.speaker}: ${t.text}`)
        .join('\n');

      const summary = await azureOpenAI.generateChatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are analyzing a business phone call. Provide a concise summary including: call outcome, customer sentiment, key points discussed, and next actions needed.'
          },
          {
            role: 'user',
            content: `Summarize this call:\n\n${conversationText}`
          }
        ],
        maxTokens: 150,
        temperature: 0.3
      });

      return summary.content;
    } catch (error) {
      logger.error('Failed to generate call summary:', error);
      return 'Summary generation failed';
    }
  }

  /**
   * Format transcript with timestamps for analysis
   */
  static formatTranscript(session: CallSession): string {
    const startTime = session.startTime.getTime();
    
    return session.transcript.map(entry => {
      const elapsed = ((entry.timestamp.getTime() - startTime) / 1000).toFixed(1);
      const duration = entry.durationMs ? ` (${entry.durationMs}ms)` : '';
      return `[${elapsed}s] ${entry.speaker}: ${entry.text}${duration}`;
    }).join('\n');
  }

  /**
   * Save call log to file system
   */
  static async saveCallLog(
    callControlId: string,
    session: CallSession,
    summary: string,
    transcript: string
  ): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const logsDir = path.join(process.cwd(), 'logs', 'calls');
      await fs.mkdir(logsDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `call_${timestamp}_${callControlId.substring(0, 8)}.json`;
      const filepath = path.join(logsDir, filename);
      
      const callLog = {
        callControlId,
        from: session.from,
        to: session.to,
        purpose: session.purpose,
        context: session.context,
        startTime: session.startTime,
        endTime: new Date(),
        duration: Date.now() - session.startTime.getTime(),
        summary,
        transcript,
        transcriptEntries: session.transcript,
        conversationHistory: session.conversationHistory
      };
      
      await fs.writeFile(filepath, JSON.stringify(callLog, null, 2));
      
      logger.info('💾 Call log saved:', { filepath });
    } catch (error) {
      logger.error('Failed to save call log:', error);
    }
  }

  /**
   * Get session analytics
   */
  static getSessionStats(callControlId: string) {
    const session = this.getSession(callControlId);
    
    if (!session) return null;

    return {
      duration: Date.now() - session.startTime.getTime(),
      exchanges: Math.floor((session.conversationHistory.length - 1) / 2),
      lastActivity: session.lastActivity,
      stage: session.stage
    };
  }

  /**
   * Clean up stale sessions (older than 1 hour)
   */
  static cleanupStaleSessions(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    let cleaned = 0;

    for (const [callControlId, session] of activeSessions.entries()) {
      if (session.lastActivity.getTime() < oneHourAgo) {
        activeSessions.delete(callControlId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('🧹 Cleaned up stale sessions', { count: cleaned });
    }
  }
}

// Cleanup stale sessions every 15 minutes
setInterval(() => {
  VoiceCallHandler.cleanupStaleSessions();
}, 15 * 60 * 1000);

export default VoiceCallHandler;