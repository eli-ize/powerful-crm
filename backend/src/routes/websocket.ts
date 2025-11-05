/**
 * WebSocket Audio Streaming Routes
 * 
 * Real-time audio streaming from browser to Azure Speech Recognition
 * Supports continuous recognition with auto-stop on silence
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { AzureContinuousRecognition } from '../services/azureContinuousRecognition';

interface AudioStreamMessage {
  type: 'audio' | 'start' | 'stop';
  data?: ArrayBuffer;
  sampleRate?: number;
}

interface TranscriptMessage {
  type: 'recognizing' | 'recognized' | 'stopped' | 'error';
  text?: string;
  isFinal?: boolean;
  error?: string;
}

export class AudioStreamingWebSocket {
  private wss: WebSocketServer;
  private activeRecognizers: Map<WebSocket, AzureContinuousRecognition> = new Map();
  private audioPushStreams: Map<WebSocket, any> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/speech'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🎙️ WebSocket server initialized on /ws/speech');
  }

  private handleConnection(ws: WebSocket): void {
    console.log('🔌 New WebSocket client connected');

    ws.on('message', async (data: Buffer) => {
      try {
        // Try to parse as JSON first (control messages)
        const message = JSON.parse(data.toString()) as AudioStreamMessage;
        await this.handleControlMessage(ws, message);
      } catch {
        // Not JSON, treat as binary audio data
        await this.handleAudioData(ws, data);
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
      this.cleanup(ws);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.cleanup(ws);
    });
  }

  private async handleControlMessage(ws: WebSocket, message: AudioStreamMessage): Promise<void> {
    switch (message.type) {
      case 'start':
        await this.startRecognition(ws, message.sampleRate || 16000);
        break;

      case 'stop':
        await this.stopRecognition(ws);
        break;

      default:
        console.warn('⚠️ Unknown control message type:', message.type);
    }
  }

  private async startRecognition(ws: WebSocket, sampleRate: number): Promise<void> {
    console.log(`🎤 Starting recognition for client (sample rate: ${sampleRate}Hz)`);

    try {
      // Create push audio stream for this client
      const format = (sdk as any).AudioStreamFormat.getWaveFormatPCM(sampleRate, 16, 1);
      const pushStream = (sdk as any).AudioInputStream.createPushStream(format);
      this.audioPushStreams.set(ws, pushStream);

      // Create audio config from push stream
      const audioConfig = (sdk as any).AudioConfig.fromStreamInput(pushStream);

      // Create continuous recognition service with audio config
      const recognizer = new AzureContinuousRecognition(audioConfig);

      // Set up event handlers
      recognizer.on('event', (event: any) => {
        if (event.type === 'recognizing' && event.text) {
          const response: TranscriptMessage = {
            type: 'recognizing',
            text: event.text,
            isFinal: false
          };
          ws.send(JSON.stringify(response));
        } else if (event.type === 'recognized' && event.text) {
          const response: TranscriptMessage = {
            type: 'recognized',
            text: event.text,
            isFinal: true
          };
          ws.send(JSON.stringify(response));
        } else if (event.type === 'sessionStopped') {
          const response: TranscriptMessage = {
            type: 'stopped',
            text: event.text,
            isFinal: true
          };
          ws.send(JSON.stringify(response));
          this.cleanup(ws);
        } else if (event.type === 'canceled' && event.error) {
          const response: TranscriptMessage = {
            type: 'error',
            error: event.error
          };
          ws.send(JSON.stringify(response));
          this.cleanup(ws);
        }
      });

      // Store recognizer for this client
      this.activeRecognizers.set(ws, recognizer);

      // Start continuous recognition
      await recognizer.startRecognition();
      console.log('✅ Recognition started successfully');

    } catch (error) {
      console.error('❌ Failed to start recognition:', error);
      const response: TranscriptMessage = {
        type: 'error',
        error: error instanceof Error ? error.message : 'Failed to start recognition'
      };
      ws.send(JSON.stringify(response));
      this.cleanup(ws);
    }
  }

  private async handleAudioData(ws: WebSocket, data: Buffer): Promise<void> {
    const pushStream = this.audioPushStreams.get(ws);
    
    if (!pushStream) {
      console.warn('⚠️ Received audio data but no push stream exists');
      return;
    }

    try {
      // Write audio chunk to Azure push stream
      pushStream.write(data);
    } catch (error) {
      console.error('❌ Failed to write audio data:', error);
    }
  }

  private async stopRecognition(ws: WebSocket): Promise<void> {
    console.log('🛑 Stopping recognition for client');

    const recognizer = this.activeRecognizers.get(ws);
    const pushStream = this.audioPushStreams.get(ws);

    if (recognizer) {
      try {
        // Close the push stream first
        if (pushStream) {
          pushStream.close();
        }

        // Stop recognition
        await recognizer.stopRecognition();
        console.log('✅ Recognition stopped successfully');
      } catch (error) {
        console.error('❌ Failed to stop recognition:', error);
      }
    }

    this.cleanup(ws);
  }

  private cleanup(ws: WebSocket): void {
    // Clean up recognizer
    const recognizer = this.activeRecognizers.get(ws);
    if (recognizer) {
      recognizer.removeAllListeners();
      this.activeRecognizers.delete(ws);
    }

    // Clean up push stream
    const pushStream = this.audioPushStreams.get(ws);
    if (pushStream) {
      try {
        pushStream.close();
      } catch (error) {
        console.error('❌ Error closing push stream:', error);
      }
      this.audioPushStreams.delete(ws);
    }

    console.log('🧹 Client cleanup completed');
  }

  public close(): void {
    // Clean up all active connections
    for (const [ws] of this.activeRecognizers) {
      this.cleanup(ws);
    }

    this.wss.close(() => {
      console.log('🔌 WebSocket server closed');
    });
  }
}
