import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Phone, PhoneOff, Mic, MicOff, Volume2,
  MessageSquare, Bot, User
} from 'lucide-react';
import { toast } from 'sonner';
import { ALL_VOICES, SPEAKING_RATES } from '../../data/azureVoices';
import { AudioStreamingClient, TranscriptEvent } from '../../services/audioStreamingClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export function VoiceCallSimulator() {
  // Call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Configuration
  const [selectedVoice, setSelectedVoice] = useState('en-ZA-LeahNeural');
  const [speakingRate, setSpeakingRate] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI sales assistant. Keep responses brief and natural, as if speaking on a phone call. Ask relevant questions to understand the customer's needs."
  );
  
  // Conversation
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveTranscript, setLiveTranscript] = useState(''); // Live user speech transcript
  const [finalTranscript, setFinalTranscript] = useState(''); // Accumulated final transcript
  const [aiResponse, setAiResponse] = useState(''); // Current AI response
  
  // Latency tracking
  const [latencies, setLatencies] = useState({
    stt: 0,      // Speech-to-text latency
    ai: 0,       // AI response generation latency
    tts: 0,      // Text-to-speech latency
    total: 0     // Total turn latency
  });
  const turnStartTimeRef = useRef<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Stats
  const [callDuration, setCallDuration] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  
  // Refs
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const callStartTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamingClientRef = useRef<AudioStreamingClient | null>(null);
  const onTranscriptRef = useRef<((event: TranscriptEvent) => void) | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(''); // AI chat session ID
  const isCallActiveRef = useRef<boolean>(false); // Track call state without closure issues
  
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const selectedVoiceData = ALL_VOICES.find(v => v.id === selectedVoice);

  // Update call duration
  useEffect(() => {
    if (isCallActive) {
      intervalRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCallActive]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start voice call with continuous recognition
  const startCall = async () => {
    try {
      setIsCallActive(true);
      isCallActiveRef.current = true; // Set ref for closure-free access
      callStartTimeRef.current = Date.now();
      setMessages([]);
      setCallDuration(0);
      setTurnCount(0);
      setLiveTranscript('');
      setFinalTranscript('');
      setAiResponse('');
      
      // Create AI chat session

      const sessionResponse = await fetch(`${backendUrl}/api/ai-chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose: 'Voice call simulation - test conversation',
          customerName: 'User',
          context: 'Testing voice call simulator with continuous recognition'
        })
      });
      
      if (!sessionResponse.ok) {
        throw new Error('Failed to create AI session');
      }
      
      const sessionData = await sessionResponse.json();
      sessionIdRef.current = sessionData.sessionId;

      
      // Dispose old client if exists
      if (streamingClientRef.current) {
        streamingClientRef.current.dispose();
        streamingClientRef.current = null;
      }

      // Define the callback with latest state
      const handleTranscript = (event: TranscriptEvent) => {

        
        if (event.type === 'recognizing' && event.text) {

          setLiveTranscript(event.text);
          
          // Start timing when speech begins
          if (!turnStartTimeRef.current) {
            turnStartTimeRef.current = Date.now();

          }
        } else if (event.type === 'recognized' && event.text) {
          const sttLatency = Date.now() - turnStartTimeRef.current;

          
          setLatencies(prev => ({ ...prev, stt: sttLatency }));
          
          // Add to final transcript
          setFinalTranscript(prev => (prev ? `${prev} ${event.text}` : event.text) || '');
          
          setLiveTranscript(''); // Clear live transcript
          
          // Process user speech with AI

          processUserInput(event.text);
          
        } else if (event.type === 'stopped') {

          setIsListening(false);
          
          // Restart recognition after AI finishes speaking
          // This allows continuous conversation

        } else if (event.type === 'error' && event.error) {
          console.error('❌ Recognition error:', event.error);
          toast.error(`Error: ${event.error}`);
          setIsListening(false);
        }
      };
      
      // Store in ref
      onTranscriptRef.current = handleTranscript;

      // Create new streaming client
      streamingClientRef.current = new AudioStreamingClient({
        sampleRate: 16000,
        onTranscript: (event: TranscriptEvent) => {
          if (onTranscriptRef.current) {
            onTranscriptRef.current(event);
          }
        },
        onError: (error) => {
          console.error('❌ Streaming error:', error);
          toast.error(error);
          setIsListening(false);
        },
        onConnectionChange: (connected) => {
          setIsConnected(connected);
        }
      });

      // Start continuous recognition
      setIsListening(true);
      await streamingClientRef.current.startRecording();
      
      toast.success('🎤 Voice call started! Speak naturally...');
      
      // AI greeting after a short delay
      setTimeout(() => {
        if (sessionData.greeting) {
          speakAIMessage(sessionData.greeting);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start voice call');
      setIsCallActive(false);
      setIsListening(false);
    }
  };

  // End voice call
  const endCall = async () => {
    
    // Stop audio playback first
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
    }
    
    // Stop continuous recognition
    if (streamingClientRef.current) {
      try {
        await streamingClientRef.current.stopRecording();
        streamingClientRef.current.dispose();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      } finally {
        streamingClientRef.current = null;
      }
    }
    
    // Clear any pending timeouts
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    setIsCallActive(false);
    isCallActiveRef.current = false; // Clear ref
    setIsListening(false);
    setIsSpeaking(false);
    setIsConnected(false);
    
    toast.info(`Call ended. Duration: ${formatDuration(callDuration)}, Turns: ${turnCount}`);
  };

  // Restart recognition for next user input
  const restartRecognition = async () => {
    if (!isCallActiveRef.current) {
      return;
    }
    
    try {
      
      // Dispose old client if exists
      if (streamingClientRef.current) {
        try {
          streamingClientRef.current.dispose();
        } catch (e) {

        }
        streamingClientRef.current = null;
      }
      
      // Create a new WebSocket connection
      streamingClientRef.current = new AudioStreamingClient({
        sampleRate: 16000,
        onTranscript: (event: TranscriptEvent) => {
          if (onTranscriptRef.current) {
            onTranscriptRef.current(event);
          }
        },
        onError: (error) => {
          console.error('❌ Streaming error:', error);
          toast.error(error);
          setIsListening(false);
        },
        onConnectionChange: (connected) => {
          setIsConnected(connected);
        }
      });
      
      setIsListening(true);
      await streamingClientRef.current.startRecording();
      
    } catch (error) {
      console.error('❌ Failed to restart recognition:', error);
      toast.error('Failed to restart listening');
      setIsListening(false);
    }
  };

  // Track active request to prevent duplicate processing (double speech bug fix)
  const activeRequestIdRef = useRef<string | null>(null);
  const audioQueueRef = useRef<Array<{ text: string; requestId: string }>>([]);

  // Process user input and get AI response
  const processUserInput = async (userText: string) => {
    
    // USE REF not state - avoid closure issues
    if (!isCallActiveRef.current) {
      return;
    }
    
    // Prevent interruptions while AI is speaking (avoid audio overlap)
    if (isSpeaking) {
      return;
    }
    
    // 🔒 DEDUPLICATION: Prevent duplicate requests from being processed simultaneously
    const requestId = `${Date.now()}-${Math.random()}`;
    if (activeRequestIdRef.current) {
      audioQueueRef.current.push({ text: userText, requestId });
      return;
    }
    activeRequestIdRef.current = requestId;
    
    // Allow processing even if previous is still running for continuous conversation
    // The backend handles queuing
    const aiStartTime = Date.now();
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setTurnCount(prev => prev + 1);
    
    // Generate AI response
    setIsProcessing(true);
    
    try {
      
      const response = await fetch(`${backendUrl}/api/ai-chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: userText
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI Chat failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const aiLatency = Date.now() - aiStartTime;
      
      setLatencies(prev => ({ ...prev, ai: aiLatency }));
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Clear processing flag before speaking so recognition can restart
      setIsProcessing(false);
      
      // Speak the AI response
      await speakAIMessage(data.response);
      
      // 🔓 Clear request lock and process queued requests
      activeRequestIdRef.current = null;
      if (audioQueueRef.current.length > 0) {
        const nextRequest = audioQueueRef.current.shift();
        if (nextRequest && isCallActiveRef.current) {
          setTimeout(() => processUserInput(nextRequest.text), 100);
        }
      }
      
    } catch (error) {
      console.error('❌ AI processing error:', error);
      toast.error('Failed to get AI response');
      
      // Clear processing flag before fallback
      setIsProcessing(false);
      
      // Fallback response
      await speakAIMessage("I apologize, but I'm having trouble processing that. Could you please try again?");
      
      // 🔓 Clear request lock on error
      activeRequestIdRef.current = null;
    }
  };

  // Convert AI text to speech and play
  const speakAIMessage = async (text: string) => {
    const ttsStartTime = Date.now();
    
    // 🛑 Stop any existing audio first to prevent multiple streams
    if (audioElementRef.current) {
      const oldAudio = audioElementRef.current;
      audioElementRef.current = null;  // Clear ref FIRST to prevent race
      
      // Clean up old audio asynchronously
      try {
        oldAudio.pause();
        oldAudio.currentTime = 0;
        oldAudio.src = '';  // Release blob URL
      } catch (e) {
        console.warn('⚠️ Error cleaning up audio:', e);
      }
      
      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setAiResponse(text);
    setIsSpeaking(true);
    
    try {
      // 🚀 PHASE 2: Use streaming TTS for lower perceived latency
      const response = await fetch(`${backendUrl}/api/speech/text-to-speech-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice
        })
      });
      
      if (!response.ok) {
        throw new Error(`Streaming TTS failed: ${response.statusText}`);
      }
      
      // Collect stream into blob (browser handles streaming efficiently)
      const audioBlob = await response.blob();
      const ttsLatency = Date.now() - ttsStartTime;
      
      setLatencies(prev => ({ ...prev, tts: ttsLatency }));
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play audio
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      
      audio.onplay = () => {
        const totalLatency = Date.now() - turnStartTimeRef.current;
        setLatencies(prev => ({ ...prev, total: totalLatency }));
        turnStartTimeRef.current = 0; // Reset timer
      };
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        
        // Restart recognition for next user input (check ref, not closure)
        if (isCallActiveRef.current) {
          restartRecognition();
        } else {
          // Call ended, not restarting recognition
        }
      };
      
      audio.onerror = (error) => {
        console.error('❌ Audio playback error:', error);
        setIsSpeaking(false);
        toast.error('Failed to play audio');
        
        // Still restart recognition even if audio failed (check ref)
        if (isCallActiveRef.current) {
          restartRecognition();
        }
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('❌ TTS error:', error);
      toast.error('Failed to convert text to speech');
      setIsSpeaking(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (streamingClientRef.current) {
      // Note: AudioStreamingClient doesn't have a mute method
      // We could stop/start recording, but for now just update UI state
      toast.info(isMuted ? '🔊 Unmuted' : '🔇 Muted');
    }
  };



  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Voice Call Simulator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Have a voice conversation with AI without telephony - all in your browser!
          </p>
        </CardHeader>
        <CardContent>
          {!isCallActive ? (
            // Pre-call configuration
            <div className="space-y-4">
              {/* Voice Selection */}
              <div className="space-y-2">
                <Label>AI Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {ALL_VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.displayName}</span>
                          <span className="text-xs text-gray-500">
                            {voice.localeDisplayName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVoiceData && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedVoiceData.gender}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedVoiceData.voiceType}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Speaking Rate */}
              <div className="space-y-2">
                <Label>Speaking Rate: {speakingRate}x</Label>
                <Select 
                  value={speakingRate.toString()} 
                  onValueChange={(v: string) => setSpeakingRate(Number.parseFloat(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEAKING_RATES.map((rate) => (
                      <SelectItem key={rate.value} value={rate.value.toString()}>
                        {rate.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label>AI Personality</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                  placeholder="Define how the AI should behave..."
                />
              </div>

              {/* Start Call Button */}
              <Button 
                onClick={startCall} 
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Phone className="h-5 w-5 mr-2" />
                Start Voice Call
              </Button>
            </div>
          ) : (
            // Active call interface
            <div className="space-y-4">
              {/* Call Stats */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <div className="font-semibold text-green-700 dark:text-green-400">
                      Call Active
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(callDuration)} • {turnCount} turns
                    </div>
                  </div>
                </div>
                <Button
                  onClick={endCall}
                  variant="destructive"
                  size="sm"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Call
                </Button>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className={isConnected ? 'text-green-600 font-medium' : 'text-gray-500'}>
                  {isConnected ? '🟢 Connected' : '⚫ Disconnected'}
                </span>
                {isListening && <span className="text-blue-600 font-medium">🎤 Listening</span>}
                {isSpeaking && <span className="text-purple-600 font-medium">🔊 Speaking</span>}
                {isProcessing && <span className="text-yellow-600 font-medium">⏳ Processing</span>}
              </div>

              {/* Latency Metrics */}
              {(latencies.stt > 0 || latencies.ai > 0 || latencies.tts > 0) && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ⚡ Performance Metrics (Last Turn)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400">STT</span>
                      <span className={`font-semibold ${latencies.stt < 1000 ? 'text-green-600' : latencies.stt < 2000 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {latencies.stt > 0 ? `${latencies.stt}ms` : '-'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400">AI</span>
                      <span className={`font-semibold ${latencies.ai < 1000 ? 'text-green-600' : latencies.ai < 2000 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {latencies.ai > 0 ? `${latencies.ai}ms` : '-'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400">TTS</span>
                      <span className={`font-semibold ${latencies.tts < 1000 ? 'text-green-600' : latencies.tts < 2000 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {latencies.tts > 0 ? `${latencies.tts}ms` : '-'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400">Total</span>
                      <span className={`font-semibold ${latencies.total < 3000 ? 'text-green-600' : latencies.total < 5000 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {latencies.total > 0 ? `${latencies.total}ms` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Transcript */}
              {liveTranscript && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Live:</span> {liveTranscript}
                  </p>
                </div>
              )}

              {/* Final Transcript */}
              {finalTranscript && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">You said:</span> {finalTranscript}
                  </p>
                </div>
              )}

              {/* AI Response */}
              {aiResponse && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    <span className="font-semibold">AI:</span> {aiResponse}
                  </p>
                </div>
              )}

              {/* Mute Button */}
              <div className="flex justify-center">
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="lg"
                  disabled={!isCallActive || isProcessing}
                  className="h-14 px-8"
                >
                  {isMuted ? (
                    <>
                      <MicOff className="h-5 w-5 mr-2" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Mute
                    </>
                  )}
                </Button>
              </div>

              {/* Instructions */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Speak naturally - the AI will automatically detect when you finish speaking
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation History */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation History ({messages.length} messages)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                      {message.audioUrl && message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-2 text-xs"
                          onClick={() => {
                            const audio = new Audio(message.audioUrl);
                            audio.play();
                          }}
                        >
                          <Volume2 className="h-3 w-3 mr-1" />
                          Replay
                        </Button>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>✅ <strong>No Telephony Required</strong> - Everything runs in your browser</p>
          <p>🎤 <strong>Push-to-Talk</strong> - Hold button, speak, release to send</p>
          <p>🧠 <strong>AI-Powered</strong> - Azure OpenAI processes your speech</p>
          <p>🎙️ <strong>Natural Voice</strong> - Azure Neural voices respond</p>
          <p>💬 <strong>Full History</strong> - Review entire conversation</p>
          <p className="pt-2 text-xs">
            <strong>Use Cases:</strong> Test AI scripts, practice sales calls, demo conversations, train agents
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
