// Type declarations for microsoft-cognitiveservices-speech-sdk
declare module 'microsoft-cognitiveservices-speech-sdk' {
  export class SpeechConfig {
    static fromSubscription(subscriptionKey: string, region: string): SpeechConfig;
    speechSynthesisVoiceName: string;
    speechRecognitionLanguage: string;
    speechSynthesisLanguage: string;
    speechSynthesisOutputFormat: any;
  }

  export class AudioConfig {
    static fromDefaultMicrophoneInput(): AudioConfig;
    static fromWavFileInput(filename: string): AudioConfig;
    static fromStreamInput(stream: any): AudioConfig;
  }

  export class SpeechSynthesizer {
    constructor(speechConfig: SpeechConfig, audioConfig?: AudioConfig);
    speakTextAsync(
      text: string,
      successCallback: (result: SpeechSynthesisResult) => void,
      errorCallback: (error: string) => void
    ): void;
    speakSsmlAsync(
      ssml: string,
      successCallback: (result: SpeechSynthesisResult) => void,
      errorCallback: (error: string) => void
    ): void;
    close(): void;
  }

  export class SpeechRecognizer {
    constructor(speechConfig: SpeechConfig, audioConfig: AudioConfig);
    recognizeOnceAsync(
      successCallback: (result: SpeechRecognitionResult) => void,
      errorCallback: (error: string) => void
    ): void;
    close(): void;
  }

  export class SpeechSynthesisResult {
    audioData: ArrayBuffer;
    reason: ResultReason;
    errorDetails?: string;
  }

  export class SpeechRecognitionResult {
    text: string;
    reason: ResultReason;
    errorDetails?: string;
    properties?: any;
    duration?: number;
  }

  export enum ResultReason {
    SynthesizingAudioCompleted = 0,
    SynthesizingAudioStarted = 1,
    RecognizedSpeech = 2,
    NoMatch = 3,
    Canceled = 4,
  }

  export enum SpeechSynthesisOutputFormat {
    Audio16Khz32KBitRateMonoMp3 = 0,
    Audio16Khz128KBitRateMonoMp3 = 1,
    Audio24Khz48KBitRateMonoMp3 = 2,
  }

  export enum PropertyId {
    SpeechServiceResponse_JsonResult = 0,
  }
}
