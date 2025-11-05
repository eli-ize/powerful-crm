import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import config from '../config';
import logger from '../utils/logger';
import { EventEmitter } from 'events';

export interface TranscriptionEvent {
  type: 'recognizing' | 'recognized' | 'canceled' | 'sessionStarted' | 'sessionStopped' | 'noSpeech';
  text?: string;
  offset?: number;
  duration?: number;
  confidence?: number;
  error?: string;
}

export class AzureContinuousRecognition extends EventEmitter {
  private recognizer: sdk.SpeechRecognizer | null = null;
  private isActive = false;
  private lastSpeechTime = 0;
  private silenceTimeout: NodeJS.Timeout | null = null;
  // 🚀 PHASE 1: Azure Native Silence Detection - reduced from 5000ms to 500ms
  // Azure will auto-detect end of speech much faster using native VAD (Voice Activity Detection)
  private readonly SILENCE_THRESHOLD_MS = 500; // 500ms for near-instant response
  private fullTranscript: string[] = [];
  private customAudioConfig?: any;

  constructor(audioConfig?: any) {
    super();
    this.customAudioConfig = audioConfig;
  }

  /**
   * Start continuous speech recognition
   */
  async startRecognition(): Promise<void> {
    if (!config.azureSpeechKey || !config.azureSpeechRegion) {
      throw new Error('Azure Speech Service not configured');
    }

    if (this.isActive) {
      throw new Error('Recognition already active');
    }

    try {
      logger.info('🎙️ Starting Azure Continuous Speech Recognition...');

      // Create speech config
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        config.azureSpeechKey,
        config.azureSpeechRegion
      );

      // Set language
      speechConfig.speechRecognitionLanguage = 'en-ZA'; // South African English

      // 🚀 PHASE 1: Azure Native Silence Detection
      // Use Azure's built-in Voice Activity Detection (VAD) for faster turn completion
      // This detects end of speech much faster than manual timeout (500ms vs 5000ms)
      // Note: TypeScript definitions incomplete, but runtime supports this
      (speechConfig as any).setProperty(
        'SpeechServiceConnection_EndSilenceTimeoutMs',
        "500"  // 500ms silence = 4.5 seconds faster than old 5s timeout!
      );
      
      logger.info('🎯 Azure native silence detection enabled: 500ms');

      // Use custom audio config if provided, otherwise use default microphone
      const audioConfig = this.customAudioConfig || sdk.AudioConfig.fromDefaultMicrophoneInput();

      // Create speech recognizer
      this.recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // Set up event handlers
      this.setupEventHandlers();

      // Start continuous recognition (TypeScript types are outdated, cast to any)
      (this.recognizer as any).startContinuousRecognitionAsync(
        () => {
          this.isActive = true;
          this.lastSpeechTime = Date.now();
          this.fullTranscript = [];
          logger.info('✅ Continuous recognition started');
          this.emit('event', {
            type: 'sessionStarted'
          } as TranscriptionEvent);
        },
        (error) => {
          logger.error('❌ Failed to start recognition:', error);
          this.emit('event', {
            type: 'canceled',
            error: error
          } as TranscriptionEvent);
        }
      );
    } catch (error) {
      logger.error('❌ Recognition error:', error);
      throw error;
    }
  }

  /**
   * Stop recognition
   */
  async stopRecognition(): Promise<string> {
    if (!this.isActive || !this.recognizer) {
      return this.fullTranscript.join(' ');
    }

    logger.info('🛑 Stopping continuous recognition...');

    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    return new Promise((resolve) => {
      (this.recognizer as any).stopContinuousRecognitionAsync(
        () => {
          this.isActive = false;
          const finalTranscript = this.fullTranscript.join(' ');
          logger.info('✅ Recognition stopped. Final transcript:', finalTranscript);
          
          this.emit('event', {
            type: 'sessionStopped',
            text: finalTranscript
          } as TranscriptionEvent);
          
          if (this.recognizer) {
            this.recognizer.close();
            this.recognizer = null;
          }
          
          resolve(finalTranscript);
        },
        (error) => {
          logger.error('❌ Error stopping recognition:', error);
          this.isActive = false;
          resolve(this.fullTranscript.join(' '));
        }
      );
    });
  }

  /**
   * Set up event handlers for the speech recognizer
   */
  private setupEventHandlers(): void {
    if (!this.recognizer) return;

    const recognizer = this.recognizer as any;

    // Recognizing event (partial results - real-time intermediate)
    recognizer.recognizing = (s: any, e: any) => {
      // Check if it's recognizing speech (intermediate result)
      if (e.result && e.result.text) {
        logger.info(`🔄 Recognizing: ${e.result.text}`);
        
        this.lastSpeechTime = Date.now();
        this.resetSilenceTimer();
        
        this.emit('event', {
          type: 'recognizing',
          text: e.result.text,
          offset: e.result.offset,
          duration: e.result.duration
        } as TranscriptionEvent);
      }
    };

    // Recognized event (final results for each phrase)
    recognizer.recognized = (s: any, e: any) => {
      if (e.result && e.result.text) {
        logger.info(`✅ Recognized: ${e.result.text}`);
        
        // Add to full transcript
        this.fullTranscript.push(e.result.text);
        
        this.lastSpeechTime = Date.now();
        this.resetSilenceTimer();
        
        this.emit('event', {
          type: 'recognized',
          text: e.result.text,
          offset: e.result.offset,
          duration: e.result.duration
        } as TranscriptionEvent);
      } else {
        logger.warn('⚠️ No speech could be recognized');
        this.emit('event', {
          type: 'noSpeech'
        } as TranscriptionEvent);
      }
    };

    // Canceled event (errors)
    recognizer.canceled = (s: any, e: any) => {
      logger.error(`❌ Recognition canceled: ${e.reason}`);
      
      if (e.errorDetails) {
        logger.error(`Error details: ${e.errorDetails}`);
        this.emit('event', {
          type: 'canceled',
          error: e.errorDetails
        } as TranscriptionEvent);
      }
      
      this.stopRecognition();
    };

    // Session started
    recognizer.sessionStarted = (s: any, e: any) => {
      logger.info('🎤 Speech recognition session started');
    };

    // Session stopped
    recognizer.sessionStopped = (s: any, e: any) => {
      logger.info('🛑 Speech recognition session stopped');
      this.stopRecognition();
    };
  }

  /**
   * Reset silence detection timer
   */
  private resetSilenceTimer(): void {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
    }

    this.silenceTimeout = setTimeout(() => {
      const silenceDuration = Date.now() - this.lastSpeechTime;
      logger.info(`🔇 Silence detected for ${silenceDuration}ms - auto-stopping recognition`);
      this.stopRecognition();
    }, this.SILENCE_THRESHOLD_MS);
  }

  /**
   * Check if recognition is active
   */
  isRecognizing(): boolean {
    return this.isActive;
  }

  /**
   * Get current transcript
   */
  getCurrentTranscript(): string {
    return this.fullTranscript.join(' ');
  }
}

export default new AzureContinuousRecognition();
