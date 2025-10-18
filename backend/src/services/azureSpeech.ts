import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import config from '../config';
import logger from '../utils/logger';

export interface SpeechConfig {
  voice?: string;
  language?: string;
  rate?: string;
  pitch?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  duration: number;
  language?: string;
}

export class AzureSpeechService {
  private readonly speechConfig: sdk.SpeechConfig | null = null;
  
  constructor() {
    if (config.azureSpeechKey && config.azureSpeechRegion) {
      this.speechConfig = sdk.SpeechConfig.fromSubscription(
        config.azureSpeechKey,
        config.azureSpeechRegion
      );
      logger.info('Azure Speech Service initialized');
    } else {
      logger.warn('Azure Speech Service not configured');
    }
  }

  /**
   * Convert text to speech and return audio buffer
   */
  async textToSpeech(
    text: string, 
    options: SpeechConfig = {}
  ): Promise<Buffer> {
    if (!this.speechConfig) {
      throw new Error('Azure Speech Service not configured');
    }

    try {
      // Configure voice settings
      const voice = options.voice || 'en-US-JennyNeural';
      const language = options.language || 'en-US';
      
      this.speechConfig.speechSynthesisVoiceName = voice;
      this.speechConfig.speechSynthesisLanguage = language;
      this.speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

      // Create SSML if custom rate/pitch is specified
      let ssmlText = text;
      if (options.rate || options.pitch) {
        const rate = options.rate || '0%';
        const pitch = options.pitch || '0%';
        ssmlText = `
          <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
            <voice name="${voice}">
              <prosody rate="${rate}" pitch="${pitch}">
                ${text}
              </prosody>
            </voice>
          </speak>
        `;
      }

      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

      return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssmlText,
          (result: sdk.SpeechSynthesisResult) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              const audioBuffer = Buffer.from(result.audioData);
              logger.info(`TTS completed: ${text.length} characters -> ${audioBuffer.length} bytes`);
              resolve(audioBuffer);
            } else {
              reject(new Error(`TTS failed: ${result.errorDetails}`));
            }
            synthesizer.close();
          },
          (error: string) => {
            logger.error('TTS error:', error);
            synthesizer.close();
            reject(new Error(error));
          }
        );
      });
    } catch (error) {
      logger.error('Azure TTS failed:', error);
      throw new Error('Text-to-speech conversion failed');
    }
  }

  /**
   * Convert speech to text from audio buffer
   */
  async speechToText(
    audioBuffer: Buffer,
    language: string = 'en-US'
  ): Promise<TranscriptionResult> {
    if (!this.speechConfig) {
      throw new Error('Azure Speech Service not configured');
    }

    try {
      this.speechConfig.speechRecognitionLanguage = language;

      // Use default microphone input for now - file input requires specific format
      // In production, save buffer to temp file and use fromWavFileInput
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);

      return new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          (result: sdk.SpeechRecognitionResult) => {
            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
              const transcription: TranscriptionResult = {
                text: result.text,
                confidence: result.properties?.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) 
                  ? JSON.parse(result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult)).NBest?.[0]?.Confidence || 0
                  : 0,
                duration: result.duration ? result.duration / 10000000 : 0, // Convert from ticks to seconds
                language,
              };

              logger.info(`STT completed: ${transcription.text.length} characters, confidence: ${transcription.confidence}`);
              resolve(transcription);
            } else if (result.reason === sdk.ResultReason.NoMatch) {
              resolve({
                text: '',
                confidence: 0,
                duration: 0,
                language,
              });
            } else {
              reject(new Error(`STT failed: ${result.errorDetails}`));
            }
            recognizer.close();
          },
          (error: string) => {
            logger.error('STT error:', error);
            recognizer.close();
            reject(new Error(error));
          }
        );
      });
    } catch (error) {
      logger.error('Azure STT failed:', error);
      throw new Error('Speech-to-text conversion failed');
    }
  }

  /**
   * Get recommended voices for different use cases
   */
  getRecommendedVoices(): { [key: string]: string[] } {
    return {
      'professional': [
        'en-US-JennyNeural',    // Professional female
        'en-US-GuyNeural',      // Professional male
        'en-US-AriaNeural',     // Clear female
        'en-US-DavisNeural',    // Clear male
      ],
      'friendly': [
        'en-US-SaraNeural',     // Friendly female
        'en-US-TonyNeural',     // Friendly male
        'en-US-JaneNeural',     // Warm female
        'en-US-JasonNeural',    // Warm male
      ],
      'energetic': [
        'en-US-AmberNeural',    // Energetic female
        'en-US-BrandonNeural',  // Energetic male
        'en-US-CoraNeural',     // Upbeat female
        'en-US-JacobNeural',    // Upbeat male
      ],
      'calm': [
        'en-US-AnaNeural',      // Calm female
        'en-US-ChristopherNeural', // Calm male
        'en-US-ElizabethNeural', // Soothing female
        'en-US-EricNeural',     // Soothing male
      ],
    };
  }

  /**
   * Create SSML with advanced speech controls
   */
  createSSML(
    text: string,
    voice: string,
    options: {
      rate?: string;
      pitch?: string;
      volume?: string;
      emphasis?: 'strong' | 'moderate' | 'reduced';
      pause?: string;
      language?: string;
    } = {}
  ): string {
    const language = options.language || 'en-US';
    
    let ssmlContent = text;
    
    // Add emphasis if specified
    if (options.emphasis) {
      ssmlContent = `<emphasis level="${options.emphasis}">${ssmlContent}</emphasis>`;
    }
    
    // Add pause if specified
    if (options.pause) {
      ssmlContent = `${ssmlContent}<break time="${options.pause}"/>`;
    }
    
    // Wrap in prosody for rate, pitch, volume
    const prosodyAttrs = [];
    if (options.rate) prosodyAttrs.push(`rate="${options.rate}"`);
    if (options.pitch) prosodyAttrs.push(`pitch="${options.pitch}"`);
    if (options.volume) prosodyAttrs.push(`volume="${options.volume}"`);
    
    if (prosodyAttrs.length > 0) {
      ssmlContent = `<prosody ${prosodyAttrs.join(' ')}>${ssmlContent}</prosody>`;
    }
    
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
        <voice name="${voice}">
          ${ssmlContent}
        </voice>
      </speak>
    `;
  }

  /**
   * Estimate TTS cost based on character count
   */
  estimateTTSCost(characterCount: number): { characters: number; estimatedCost: number } {
    // Azure Cognitive Services pricing (as of 2024)
    // Standard voices: $4 per 1M characters
    // Neural voices: $16 per 1M characters
    const neuralVoiceCostPer1M = 16;
    const estimatedCost = (characterCount / 1000000) * neuralVoiceCostPer1M;
    
    return {
      characters: characterCount,
      estimatedCost: Math.round(estimatedCost * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Estimate STT cost based on audio duration
   */
  estimateSTTCost(durationMinutes: number): { minutes: number; estimatedCost: number } {
    // Azure Cognitive Services pricing (as of 2024)
    // Standard: $1 per hour
    const costPerHour = 1;
    const estimatedCost = (durationMinutes / 60) * costPerHour;
    
    return {
      minutes: durationMinutes,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
    };
  }
}

export default new AzureSpeechService();