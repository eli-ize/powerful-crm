/**
 * WebSocket Audio Streaming Client
 * 
 * Handles real-time audio streaming to backend for Azure Speech Recognition
 * Provides continuous transcription with auto-stop on silence
 */

export interface TranscriptEvent {
  type: 'recognizing' | 'recognized' | 'stopped' | 'error';
  text?: string;
  isFinal?: boolean;
  error?: string;
}

export interface AudioStreamingOptions {
  sampleRate?: number;
  onTranscript?: (event: TranscriptEvent) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export class AudioStreamingClient {
  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;
  private options: AudioStreamingOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000;

  constructor(options: AudioStreamingOptions = {}) {
    this.options = {
      sampleRate: 16000,
      ...options
    };
  }

  /**
   * Start recording and streaming audio to backend
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    try {
      console.log('🎤 Starting audio recording and streaming...');

      // Connect to WebSocket server
      await this.connect();

      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context
      this.audioContext = new AudioContext({
        sampleRate: this.options.sampleRate
      });

      // Create source from microphone stream
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create script processor for audio chunks
      const bufferSize = 4096;
      this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      // Process audio chunks
      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32Array to Int16Array (PCM 16-bit)
        const int16Data = this.floatTo16BitPCM(inputData);
        
        // Send to WebSocket
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(int16Data.buffer);
        }
      };

      // Connect audio nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      // Send start message
      this.sendControlMessage({
        type: 'start',
        sampleRate: this.options.sampleRate
      });

      this.isRecording = true;
      console.log('✅ Recording started successfully');

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Stop recording and streaming
   */
  async stopRecording(): Promise<void> {
    if (!this.isRecording) {
      return;
    }

    console.log('🛑 Stopping audio recording...');
    
    // Stop recording immediately to prevent more audio from being sent
    this.isRecording = false;

    // Send stop message
    this.sendControlMessage({
      type: 'stop'
    });

    // Wait a bit for final transcripts
    await new Promise(resolve => setTimeout(resolve, 500));

    this.cleanup();
    console.log('✅ Recording stopped successfully');
  }

  /**
   * Check if currently recording
   */
  isActive(): boolean {
    return this.isRecording;
  }

  /**
   * Connect to WebSocket server
   */
  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const apiUrl = (import.meta as any).env?.VITE_API_URL;
      const host = apiUrl?.replace(/^https?:\/\//, '') || 'localhost:8000';
      const wsUrl = `${protocol}//${host}/ws/speech`;

      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.options.onConnectionChange?.(true);
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: TranscriptEvent = JSON.parse(event.data);
          console.log('📝 Transcript event:', message);
          this.options.onTranscript?.(message);
        } catch (error) {
          console.error('❌ Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.options.onError?.('WebSocket connection error');
        reject(new Error('WebSocket connection failed'));
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.options.onConnectionChange?.(false);
        
        if (this.isRecording) {
          this.attemptReconnect();
        }
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached');
      this.options.onError?.('Connection lost. Please try again.');
      this.cleanup();
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));

    try {
      await this.connect();
      console.log('✅ Reconnected successfully');
    } catch (error) {
      console.error('❌ Reconnect failed:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Send control message to backend
   */
  private sendControlMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Convert Float32Array to Int16Array (PCM 16-bit)
   */
  private floatTo16BitPCM(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }

  /**
   * Clean up all resources
   */
  private cleanup(): void {
    this.isRecording = false;

    // Stop audio processing
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    // Stop microphone
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('🧹 Cleanup completed');
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.cleanup();
  }
}
