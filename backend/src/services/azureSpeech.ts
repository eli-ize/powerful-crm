import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import config from '../config';
import logger from '../utils/logger';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';

// Configure ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath.path);

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
      // Configure voice settings - Default to South African voices
      const voice = options.voice || 'en-ZA-LeahNeural';  // SA Female (Johannesburg)
      const language = options.language || 'en-ZA';  // South African English
      
      this.speechConfig.speechSynthesisVoiceName = voice;
      this.speechConfig.speechSynthesisLanguage = language;
      this.speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

      // ALWAYS use SSML for natural, expressive speech (even without custom rate/pitch)
      const rate = options.rate || '+15%';  // Faster for natural conversation flow
      const pitch = options.pitch || 'medium';  // Natural pitch variation
      
      // Add natural breaks after punctuation for conversational rhythm
      const naturalText = text
        .replace(/([.!?])\s+/g, '$1<break time="400ms"/> ')  // Pause after sentences
        .replace(/([,;:])\s+/g, '$1<break time="200ms"/> ')  // Shorter pause after commas
        .replace(/\n/g, '<break time="500ms"/> ');  // Pause for line breaks
      
      // Enhanced SSML with conversational emotion and natural prosody
      const ssmlText = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
               xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${language}">
          <voice name="${voice}">
            <mstts:express-as style="chat" styledegree="2">
              <prosody rate="${rate}" pitch="${pitch}" volume="+5%" contour="(0%,+5%) (25%,+10%) (50%,+5%) (75%,+10%) (100%,+0%)">
                ${naturalText}
              </prosody>
            </mstts:express-as>
          </voice>
        </speak>
      `;

      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

      return new Promise((resolve, reject) => {
        // Always use SSML for natural voice quality
        synthesizer.speakSsmlAsync(
          ssmlText,
          (result: sdk.SpeechSynthesisResult) => {
            synthesizer.close();
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              const audioBuffer = Buffer.from(result.audioData);
              logger.info(`TTS completed: ${text.length} characters -> ${audioBuffer.length} bytes`);
              resolve(audioBuffer);
            } else {
              logger.error('TTS failed:', result.errorDetails);
              reject(new Error(`TTS failed: ${result.errorDetails}`));
            }
          },
          (error: string) => {
            synthesizer.close();
            logger.error('TTS error:', error);
            reject(new Error(`TTS failed: ${error}`));
          }
        );
      });
    } catch (error) {
      logger.error('Azure TTS failed:', error);
      throw new Error('Text-to-speech conversion failed');
    }
  }

  /**
   * 🚀 PHASE 2: Streaming Text-to-Speech
   * Yields audio chunks as they're generated for lower perceived latency
   * First chunk arrives in ~200-500ms vs waiting 1-2s for complete audio
   */
  async *textToSpeechStream(
    text: string, 
    options: SpeechConfig = {}
  ): AsyncGenerator<Buffer, void, undefined> {
    if (!this.speechConfig) {
      throw new Error('Azure Speech Service not configured');
    }

    try {
      // Configure voice settings - Default to South African voices
      const voice = options.voice || 'en-ZA-LeahNeural';
      const language = options.language || 'en-ZA';
      
      this.speechConfig.speechSynthesisVoiceName = voice;
      this.speechConfig.speechSynthesisLanguage = language;
      this.speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

      // Use same SSML as non-streaming for consistency
      const rate = options.rate || '+15%';
      const pitch = options.pitch || 'medium';
      
      const naturalText = text
        .replace(/([.!?])\s+/g, '$1<break time="400ms"/> ')
        .replace(/([,;:])\s+/g, '$1<break time="200ms"/> ')
        .replace(/\n/g, '<break time="500ms"/> ');
      
      const ssmlText = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
               xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${language}">
          <voice name="${voice}">
            <mstts:express-as style="chat" styledegree="2">
              <prosody rate="${rate}" pitch="${pitch}" volume="+5%" contour="(0%,+5%) (25%,+10%) (50%,+5%) (75%,+10%) (100%,+0%)">
                ${naturalText}
              </prosody>
            </mstts:express-as>
          </voice>
        </speak>
      `;

      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);
      const chunks: Buffer[] = [];
      let resolveSynthesis: (() => void) | null = null;
      let rejectSynthesis: ((error: Error) => void) | null = null;
      
      const synthesisPromise = new Promise<void>((resolve, reject) => {
        resolveSynthesis = resolve;
        rejectSynthesis = reject;
      });

      // 🎯 Key: synthesizing event fires for EACH audio chunk as it's generated
      // Note: TypeScript definitions incomplete, but runtime supports this
      (synthesizer as any).synthesizing = (_s: any, e: any) => {
        if (e.result.audioData && e.result.audioData.byteLength > 0) {
          const chunk = Buffer.from(e.result.audioData);
          chunks.push(chunk);
          logger.info(`🎵 Streaming chunk: ${chunk.length} bytes (${chunks.length} total)`);
        }
      };

      // Start synthesis (async)
      synthesizer.speakSsmlAsync(
        ssmlText,
        (result: sdk.SpeechSynthesisResult) => {
          synthesizer.close();
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            logger.info(`✅ Streaming TTS complete: ${text.length} chars -> ${chunks.length} chunks`);
            resolveSynthesis?.();
          } else {
            logger.error('Streaming TTS failed:', result.errorDetails);
            rejectSynthesis?.(new Error(`TTS failed: ${result.errorDetails}`));
          }
        },
        (error: string) => {
          synthesizer.close();
          logger.error('Streaming TTS error:', error);
          rejectSynthesis?.(new Error(`TTS failed: ${error}`));
        }
      );

      // Yield chunks as they arrive
      let lastYieldedIndex = 0;
      while (lastYieldedIndex < chunks.length || resolveSynthesis !== null) {
        // Yield any new chunks
        while (lastYieldedIndex < chunks.length) {
          yield chunks[lastYieldedIndex];
          lastYieldedIndex++;
        }
        
        // If synthesis complete, exit
        if (resolveSynthesis === null) break;
        
        // Wait a bit for more chunks (or completion)
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Check if synthesis finished
        try {
          await Promise.race([
            synthesisPromise.then(() => { resolveSynthesis = null; }),
            new Promise(resolve => setTimeout(resolve, 10))
          ]);
        } catch (error) {
          throw error;
        }
      }
      
    } catch (error) {
      logger.error('Azure Streaming TTS failed:', error);
      throw new Error('Streaming text-to-speech conversion failed');
    }
  }

  /**
   * Convert speech to text from audio buffer
   * Uses Azure Speech SDK with push stream (works for phone calls via Telnyx)
   * For browser-based chat, use Web Speech API client-side instead
   */
  /**
   * Create WAV header for RAW PCM data
   */
  private createWavHeader(dataLength: number, sampleRate: number, channels: number = 1, bitsPerSample: number = 16): Buffer {
    const header = Buffer.alloc(44);
    
    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);
    
    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // fmt chunk size
    header.writeUInt16LE(1, 20); // PCM format
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28); // byte rate
    header.writeUInt16LE(channels * bitsPerSample / 8, 32); // block align
    header.writeUInt16LE(bitsPerSample, 34);
    
    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);
    
    return header;
  }

  /**
   * Convert WebM/Opus audio to PCM WAV format for Azure Speech SDK
   */
  private async convertToPCMWav(inputBuffer: Buffer): Promise<Buffer> {
    const tempInput = join(tmpdir(), `audio-input-${Date.now()}.webm`);
    const tempOutput = join(tmpdir(), `audio-output-${Date.now()}.wav`);

    try {
      // Write input buffer to temp file
      await writeFile(tempInput, inputBuffer);
      logger.info(`📁 Temp input file: ${tempInput}`);

      // Convert using ffmpeg: WebM/Opus → PCM WAV (16kHz, mono, 16-bit)
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInput)
          .toFormat('wav')
          .audioCodec('pcm_s16le')  // 16-bit PCM
          .audioChannels(1)          // Mono
          .audioFrequency(16000)     // 16kHz sample rate
          .on('start', (cmd) => logger.info(`🎬 ffmpeg command: ${cmd}`))
          .on('end', () => {
            logger.info('✅ Audio conversion completed');
            resolve();
          })
          .on('error', (err) => {
            logger.error('❌ ffmpeg conversion error:', err.message);
            reject(err instanceof Error ? err : new Error(String(err)));
          })
          .save(tempOutput);
      });

      // Read converted WAV file
      const fs = await import('node:fs');
      const wavBuffer = await fs.promises.readFile(tempOutput);
      logger.info(`✅ Converted to PCM WAV: ${wavBuffer.length} bytes`);

      // Cleanup temp files
      await unlink(tempInput).catch(() => {});
      await unlink(tempOutput).catch(() => {});

      return wavBuffer;
    } catch (error: any) {
      // Cleanup on error
      await unlink(tempInput).catch(() => {});
      await unlink(tempOutput).catch(() => {});
      throw error;
    }
  }

  async speechToText(
    audioBuffer: Buffer,
    language: string = 'en-ZA',
    format: string = 'audio/webm'
  ): Promise<TranscriptionResult> {
    if (!this.speechConfig) {
      throw new Error('Azure Speech Service not configured');
    }

    try {
      logger.info(`🎤 Azure STT: Processing ${audioBuffer.length} bytes audio (${format})`);
      
      let wavBuffer: Buffer;
      
      // Check if it's RAW PCM or needs conversion
      if (format.startsWith('audio/pcm')) {
        // Extract sample rate from format string
        const rateMatch = /rate=(\d+)/.exec(format);
        const inputSampleRate = rateMatch ? Number.parseInt(rateMatch[1], 10) : 44100;
        
        logger.info(`✅ RAW PCM detected @ ${inputSampleRate}Hz`);
        
        // If not 16kHz, resample using ffmpeg
        if (inputSampleRate === 16000) {
          // Sample rate is correct, no resampling needed
          logger.debug('Sample rate already 16kHz');
          // Already 16kHz, just add WAV header
          const wavHeader = this.createWavHeader(audioBuffer.length, 16000, 1, 16);
          wavBuffer = Buffer.concat([wavHeader, audioBuffer]);
          logger.info(`✅ WAV file created: ${wavBuffer.length} bytes`);
        } else {
          logger.info(`🔄 Resampling ${inputSampleRate}Hz → 16000Hz for Azure Speech...`);
          
          // Add WAV header for input
          const inputWavHeader = this.createWavHeader(audioBuffer.length, inputSampleRate, 1, 16);
          const inputWav = Buffer.concat([inputWavHeader, audioBuffer]);
          
          // Resample to 16kHz using ffmpeg
          wavBuffer = await this.convertToPCMWav(inputWav);
        }
      } else {
        // Convert WebM/Opus to PCM WAV using ffmpeg
        logger.info('🔄 Converting WebM/Opus to PCM WAV...');
        wavBuffer = await this.convertToPCMWav(audioBuffer);
      }
      
      // Validate wavBuffer
      if (!wavBuffer || wavBuffer.length === 0) {
        throw new Error('Audio conversion failed: resulting buffer is empty');
      }
      
      logger.info(`✅ WAV conversion complete: ${wavBuffer.length} bytes`);
      
      this.speechConfig.speechRecognitionLanguage = language;

      // Use PushAudioInputStream instead of file-based approach (more reliable)
      logger.info('🔄 Creating audio stream from buffer...');
      
      // Create push stream and write WAV buffer directly
      const SdkAny = sdk as any;
      const pushStream = SdkAny.AudioInputStream.createPushStream();
      pushStream.write(wavBuffer);
      pushStream.close();
      
      const audioConfig = SdkAny.AudioConfig.fromStreamInput(pushStream);
      const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);
      
      logger.info('✅ Audio stream created, starting recognition...');

      return new Promise((resolve, reject) => {
        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          recognizer.close();
          reject(new Error('Azure Speech recognition timeout after 30 seconds'));
        }, 30000);

        recognizer.recognizeOnceAsync(
          (result: sdk.SpeechRecognitionResult) => {
            clearTimeout(timeout);
            recognizer.close();
            
            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
              const transcription: TranscriptionResult = {
                text: result.text,
                confidence: 0.9,
                duration: result.duration ? result.duration / 10000000 : 0,
                language
              };
              
              logger.info(`✅ Azure STT Success: "${transcription.text}"`);
              resolve(transcription);
            } else if (result.reason === sdk.ResultReason.NoMatch) {
              logger.warn(`⚠️ Azure STT: No speech detected`);
              resolve({
                text: '',
                confidence: 0,
                duration: 0,
                language
              });
            } else {
              logger.error(`❌ Azure STT failed: ${result.errorDetails}`);
              reject(new Error(`STT failed: ${result.errorDetails}`));
            }
          },
          (error: string) => {
            clearTimeout(timeout);
            recognizer.close();
            logger.error(`❌ Azure STT error:`, error);
            reject(new Error(`STT failed: ${error}`));
          }
        );
      });
    } catch (error: any) {
      logger.error('❌ Azure STT error:', error.message);
      throw error;
    }
  }

  /**
   * Fallback SDK method (kept for compatibility)
   */
  private async speechToTextSDK(
    audioBuffer: Buffer,
    language: string = 'en-ZA'
  ): Promise<TranscriptionResult> {
    if (!this.speechConfig) {
      throw new Error('Azure Speech Service not configured');
    }

    try {
      this.speechConfig.speechRecognitionLanguage = language;

      // Write audio buffer to temp file
      const tempFilePath = join(tmpdir(), `speech-realtime-${Date.now()}.wav`);
      await writeFile(tempFilePath, audioBuffer);

      const audioConfig = sdk.AudioConfig.fromWavFileInput(tempFilePath);
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
   * Prioritizes South African voices for local accent
   */
  getRecommendedVoices(): { [key: string]: string[] } {
    return {
      'south-african': [
        'en-ZA-LeahNeural',     // SA Professional female (Johannesburg)
        'en-ZA-LukeNeural',     // SA Professional male (Johannesburg)
      ],
      'professional': [
        'en-ZA-LeahNeural',     // SA Professional female ⭐ RECOMMENDED
        'en-ZA-LukeNeural',     // SA Professional male ⭐ RECOMMENDED
        'en-US-JennyNeural',    // US Professional female
        'en-US-GuyNeural',      // US Professional male
        'en-GB-SoniaNeural',    // UK Professional female
        'en-GB-RyanNeural',     // UK Professional male
      ],
      'friendly': [
        'en-ZA-LeahNeural',     // SA Friendly female
        'en-ZA-LukeNeural',     // SA Friendly male
        'en-US-SaraNeural',     // US Friendly female
        'en-US-TonyNeural',     // US Friendly male
        'en-GB-MiaNeural',      // UK Friendly female
      ],
      'business': [
        'en-ZA-LeahNeural',     // SA Business professional
        'en-ZA-LukeNeural',     // SA Business professional
        'en-US-AriaNeural',     // US Clear female
        'en-US-DavisNeural',    // US Clear male
      ],
      'multilingual-sa': [
        'en-ZA-LeahNeural',     // English (South Africa)
        'en-ZA-LukeNeural',     // English (South Africa)
        'af-ZA-AdriNeural',     // Afrikaans (South Africa) female
        'af-ZA-WillemNeural',   // Afrikaans (South Africa) male
        'zu-ZA-ThandoNeural',   // Zulu (South Africa) female
        'zu-ZA-ThembaNeural',   // Zulu (South Africa) male
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