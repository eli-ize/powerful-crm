import { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { 
  Volume2, Mic, MicOff, Loader2, CheckCircle, AlertCircle, 
  RefreshCw, Play, Square, ArrowRight, Filter, Search, Globe, Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { ALL_VOICES, AzureVoice, VOICE_CATEGORIES, SPEAKING_RATES, VoiceConfig } from '../../data/azureVoices';
import { AudioStreamingClient, TranscriptEvent } from '../../services/audioStreamingClient';

interface TestResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  duration?: number;
  data?: any;
}

const TEST_SCRIPTS = [
  "Hello, this is a test of Azure speech services. Can you hear me clearly?",
  "Good morning! I'm calling to discuss your recent inquiry about our services.",
  "Thank you for your time. I'll send you the information via email shortly.",
];

export function AzureAudioTester() {
  const [testText, setTestText] = useState(TEST_SCRIPTS[0]);
  const [selectedVoice, setSelectedVoice] = useState('en-ZA-LeahNeural');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [transcribedText, setTranscribedText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [characterCount, setCharacterCount] = useState(testText.length);
  const [costEstimate, setCostEstimate] = useState(0);
  
  // Voice filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocale, setSelectedLocale] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [speakingRate, setSpeakingRate] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Continuous recognition state
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamingClientRef = useRef<AudioStreamingClient | null>(null);
  const testResultsRef = useRef<TestResult[]>([]);
  
  // Use ref for callback to avoid stale closures
  const onTranscriptRef = useRef<((event: TranscriptEvent) => void) | null>(null);

  const apiUrl = (import.meta as any).env?.VITE_API_URL;
  const backendUrl = apiUrl || 'http://localhost:8000';
  
  // Filter voices based on criteria
  const filteredVoices = useMemo(() => {
    let voices = ALL_VOICES;
    
    // Search filter
    if (searchQuery) {
      voices = voices.filter(v => 
        v.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.localeDisplayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      voices = voices.filter(v => 
        v.recommendedFor.includes(selectedCategory)
      );
    }
    
    // Locale filter
    if (selectedLocale !== 'all') {
      voices = voices.filter(v => v.locale === selectedLocale);
    }
    
    // Gender filter
    if (selectedGender !== 'all') {
      voices = voices.filter(v => v.gender === selectedGender);
    }
    
    return voices;
  }, [searchQuery, selectedCategory, selectedLocale, selectedGender]);
  
  // Get unique locales
  const availableLocales = useMemo(() => {
    const locales = new Set(ALL_VOICES.map(v => v.locale));
    return Array.from(locales).sort();
  }, []);
  
  const selectedVoiceData = ALL_VOICES.find(v => v.id === selectedVoice);

  const handleTextChange = (newText: string) => {
    setTestText(newText);
    setCharacterCount(newText.length);
    // Azure Neural voices: $16 per 1M characters
    const cost = (newText.length / 1000000) * 16;
    setCostEstimate(cost);
  };

  const addTestResult = (result: TestResult): number => {
    const newIndex = testResultsRef.current.length;
    const updatedResults = [...testResultsRef.current, result];
    testResultsRef.current = updatedResults;
    setTestResults(updatedResults);
    return newIndex;
  };

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    const updatedResults = testResultsRef.current.map((r, i) => 
      i === index ? { ...r, ...updates } : r
    );
    testResultsRef.current = updatedResults;
    setTestResults(updatedResults);
  };

  // Test 1: TTS (Text to Speech)
  const testTTS = async (): Promise<Blob | null> => {
    const startTime = Date.now();
    
    const stepIndex = addTestResult({
      step: 'Text-to-Speech (TTS)',
      status: 'running',
      message: 'Converting text to speech...',
    });

    try {
      const response = await fetch(`${backendUrl}/api/speech/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          voice: selectedVoice,
          language: 'en-ZA',
          rate: speakingRate, // Add speaking rate
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const duration = Date.now() - startTime;
      
      // Create audio URL for playback
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      updateTestResult(stepIndex, {
        status: 'success',
        message: `Generated ${(audioBlob.size / 1024).toFixed(1)}KB audio in ${duration}ms`,
        duration,
        data: { size: audioBlob.size, url },
      });

      toast.success(`TTS Success: ${duration}ms`);
      return audioBlob;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(stepIndex, {
        status: 'error',
        message: error instanceof Error ? error.message : 'TTS failed',
        duration,
      });
      toast.error('TTS failed');
      return null;
    }
  };

  // Test 2: Play Audio
  const playGeneratedAudio = async (audioBlob: Blob): Promise<boolean> => {
    const stepIndex = addTestResult({
      step: 'Play Audio',
      status: 'running',
      message: 'Playing generated audio...',
    });

    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audioElementRef.current = audio;
        
        let hasResolved = false;

        const completePlayback = (success: boolean, message: string) => {
          if (hasResolved) return;
          hasResolved = true;
          
          console.log('Playback completed:', success, message);
          updateTestResult(stepIndex, {
            status: success ? 'success' : 'error',
            message,
          });
          
          if (success) {
            toast.success('Audio playback complete');
          } else {
            toast.error(message);
          }
          
          URL.revokeObjectURL(url);
          resolve(success);
        };

        audio.addEventListener('ended', () => {
          console.log('✅ Audio ended event fired');
          completePlayback(true, 'Audio played successfully');
        });

        audio.addEventListener('error', (e) => {
          console.error('❌ Audio error event:', e);
          completePlayback(false, 'Audio playback failed');
        });

        audio.addEventListener('loadedmetadata', () => {
          console.log('📊 Audio duration:', audio.duration, 'seconds');
        });

        audio.addEventListener('playing', () => {
          console.log('▶️ Audio started playing');
        });

        console.log('🎵 Calling audio.play()...');
        audio.play().catch(err => {
          console.error('❌ Play() promise rejected:', err);
          completePlayback(false, `Play failed: ${err.message}`);
        });
      } catch (error) {
        console.error('❌ playGeneratedAudio error:', error);
        updateTestResult(stepIndex, {
          status: 'error',
          message: error instanceof Error ? error.message : 'Playback failed',
        });
        resolve(false);
      }
    });
  };

  // Test 3: Record Microphone
  const recordMicrophone = async (durationMs: number = 5000): Promise<Blob | null> => {
    console.log('🎤 recordMicrophone() called, duration:', durationMs);
    
    const stepIndex = addTestResult({
      step: 'Record Microphone',
      status: 'running',
      message: `Recording for ${durationMs / 1000}s...`,
    });
    
    console.log('📍 Created recording step at index:', stepIndex);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Got media stream');
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      console.log('📹 MediaRecorder created, initial state:', mediaRecorder.state);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('📦 Audio chunk received:', event.data.size, 'bytes');
        }
      };

      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          console.log('🛑 MediaRecorder onstop fired!');
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log('📦 Created blob:', audioBlob.size, 'bytes');
          
          for (const track of stream.getTracks()) {
            track.stop();
          }
          console.log('🎙️ Stream tracks stopped');
          
          console.log('📝 Updating test result at index:', stepIndex);
          updateTestResult(stepIndex, {
            status: 'success',
            message: `Recorded ${(audioBlob.size / 1024).toFixed(1)}KB audio`,
            data: { size: audioBlob.size },
          });
          
          toast.success('Recording complete');
          console.log('✅ Recording completed successfully');
          resolve(audioBlob);
        };

        console.log('▶️ Starting MediaRecorder...');
        mediaRecorder.start();
        setIsRecording(true);
        console.log('🔴 Recording started, state:', mediaRecorder.state);

        setTimeout(() => {
          console.log('⏰ Timeout fired after', durationMs, 'ms, current state:', mediaRecorder.state);
          if (mediaRecorder.state === 'recording') {
            console.log('🛑 Calling mediaRecorder.stop()...');
            mediaRecorder.stop();
            setIsRecording(false);
          } else {
            console.warn('⚠️ MediaRecorder not in recording state:', mediaRecorder.state);
          }
        }, durationMs);
      });
    } catch (error) {
      console.error('❌ Recording error:', error);
      updateTestResult(stepIndex, {
        status: 'error',
        message: error instanceof Error ? error.message : 'Recording failed',
      });
      toast.error('Microphone access denied');
      return null;
    }
  };

  // Test 4: STT (Speech to Text)
  const testSTT = async (audioBlob: Blob): Promise<string | null> => {
    const startTime = Date.now();
    
    const stepIndex = addTestResult({
      step: 'Speech-to-Text (STT)',
      status: 'running',
      message: 'Transcribing audio...',
    });

    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const response = await fetch(`${backendUrl}/api/speech/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio }),
      });

      if (!response.ok) {
        throw new Error(`STT failed: ${response.statusText}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;
      
      setTranscribedText(result.text);

      updateTestResult(stepIndex, {
        status: 'success',
        message: `Transcribed in ${duration}ms (confidence: ${(result.confidence * 100).toFixed(0)}%)`,
        duration,
        data: { text: result.text, confidence: result.confidence },
      });

      toast.success(`STT Success: "${result.text}"`);
      return result.text;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(stepIndex, {
        status: 'error',
        message: error instanceof Error ? error.message : 'STT failed',
        duration,
      });
      toast.error('STT failed');
      return null;
    }
  };

  // Continuous Recognition with WebSocket Streaming
  const startContinuousRecognition = async () => {
    // Reset states first
    setFinalTranscript('');
    setLiveTranscript('');
    setIsConnected(false);
    
    // Dispose old client if exists
    if (streamingClientRef.current) {
      streamingClientRef.current.dispose();
      streamingClientRef.current = null;
    }

    // Define the callback with latest state
    const handleTranscript = (event: TranscriptEvent) => {
      console.log('📝 Transcript received, updating UI...', event);
      if (event.type === 'recognizing' && event.text) {
        console.log('🔵 Setting live transcript:', event.text);
        setLiveTranscript(event.text);
      } else if (event.type === 'recognized' && event.text) {
        console.log('✅ Adding to final transcript:', event.text);
        setFinalTranscript(prev => {
          const updated = prev ? `${prev} ${event.text}` : event.text;
          console.log('📝 Final transcript updated:', updated);
          return updated;
        });
        setLiveTranscript('');
      } else if (event.type === 'stopped') {
        console.log('🛑 Recognition stopped');
        toast.success('Recognition stopped (silence detected)');
        setIsStreaming(false);
      } else if (event.type === 'error' && event.error) {
        console.error('❌ Recognition error:', event.error);
        toast.error(`Error: ${event.error}`);
        setIsStreaming(false);
      }
    };
    
    // Store in ref so it can be called from the client
    onTranscriptRef.current = handleTranscript;

    // Create new client for each session
    streamingClientRef.current = new AudioStreamingClient({
      sampleRate: 16000,
      onTranscript: (event: TranscriptEvent) => {
        // Use the ref to call the latest version of the callback
        if (onTranscriptRef.current) {
          onTranscriptRef.current(event);
        }
      },
      onError: (error) => {
        console.error('❌ Streaming error:', error);
        toast.error(error);
        setIsStreaming(false);
      },
      onConnectionChange: (connected) => {
        console.log('🔌 Connection status:', connected);
        setIsConnected(connected);
      }
    });

    try {
      setIsStreaming(true);
      await streamingClientRef.current.startRecording();
      toast.success('🎤 Listening... (auto-stops after 5s silence)');
    } catch (error) {
      console.error('Failed to start continuous recognition:', error);
      toast.error('Failed to start continuous recognition');
      setIsStreaming(false);
    }
  };

  const stopContinuousRecognition = async () => {
    if (streamingClientRef.current) {
      await streamingClientRef.current.stopRecording();
      setIsStreaming(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingClientRef.current) {
        streamingClientRef.current.dispose();
      }
    };
  }, []);

  // Run Full Test Suite
  const runFullTest = async () => {
    setIsProcessing(true);
    setTestResults([]);
    setTranscribedText('');
    setCurrentStep(0);

    try {
      // Step 1: TTS
      setCurrentStep(1);
      const audioBlob = await testTTS();
      if (!audioBlob) {
        setIsProcessing(false);
        return;
      }

      // Step 2: Play Audio
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 500));
      const playSuccess = await playGeneratedAudio(audioBlob);
      if (!playSuccess) {
        setIsProcessing(false);
        return;
      }

      // Audio has finished playing (the promise above waits for onended)
      toast.info('Test complete! Now test with microphone.', { duration: 3000 });
    } catch (error) {
      console.error('Test suite error:', error);
      toast.error('Test suite failed');
    } finally {
      setIsProcessing(false);
      setCurrentStep(0);
    }
  };

  // Run Microphone Test
  const runMicrophoneTest = async () => {
    if (isProcessing) {
      toast.warning('Test already in progress');
      return;
    }
    
    setIsProcessing(true);

    try {
      // Record for 5 seconds
      const audioBlob = await recordMicrophone(5000);
      if (!audioBlob) {
        setIsProcessing(false);
        return;
      }

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 500));

      // Transcribe
      await testSTT(audioBlob);
    } catch (error) {
      console.error('Microphone test error:', error);
      toast.error('Microphone test failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Play generated audio manually
  const playAudio = () => {
    if (audioUrl) {
      console.log('🔁 Replaying audio from URL:', audioUrl);
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      
      // Find the "Play Audio" test result and update it
      const playAudioIndex = testResults.findIndex(r => r.step === 'Play Audio');
      if (playAudioIndex !== -1) {
        console.log('📍 Updating Play Audio test result at index:', playAudioIndex);
        updateTestResult(playAudioIndex, {
          status: 'running',
          message: 'Replaying generated audio...',
        });
        
        let hasResolved = false;
        
        const completeReplay = (success: boolean, message: string) => {
          if (hasResolved) return;
          hasResolved = true;
          
          console.log('🔁 Replay completed:', success, message);
          updateTestResult(playAudioIndex, {
            status: success ? 'success' : 'error',
            message,
          });
        };
        
        audio.addEventListener('ended', () => {
          console.log('✅ Replay ended event fired');
          completeReplay(true, 'Audio played successfully');
        });
        
        audio.addEventListener('error', (e) => {
          console.error('❌ Replay error:', e);
          completeReplay(false, 'Audio playback failed');
        });
        
        audio.addEventListener('loadedmetadata', () => {
          console.log('📊 Replay audio duration:', audio.duration, 'seconds');
        });
        
        audio.addEventListener('playing', () => {
          console.log('▶️ Replay started playing');
        });
      }
      
      console.log('🎵 Calling replay audio.play()...');
      audio.play().catch(err => {
        console.error('❌ Replay play failed:', err);
        if (playAudioIndex !== -1) {
          updateTestResult(playAudioIndex, {
            status: 'error',
            message: `Play failed: ${err.message}`,
          });
        }
      });
    } else {
      console.warn('⚠️ No audio URL available for replay');
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setTranscribedText('');
    setCurrentStep(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>🎙️ Azure Speech Testing Suite</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test Text-to-Speech (TTS) and Speech-to-Text (STT) with real audio
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Voice Selection ({filteredVoices.length} voices available)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {/* Search */}
                <div className="space-y-2">
                  <Label className="text-xs">Search Voice</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(VOICE_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={label}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Locale Filter */}
                <div className="space-y-2">
                  <Label className="text-xs">Language/Region</Label>
                  <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {availableLocales.map((locale) => {
                        const voice = ALL_VOICES.find(v => v.locale === locale);
                        return (
                          <SelectItem key={locale} value={locale}>
                            {voice?.localeDisplayName || locale}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                <div className="space-y-2">
                  <Label className="text-xs">Gender</Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Voice Selection Dropdown */}
            <div className="space-y-2">
              <Label>Selected Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {filteredVoices.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No voices match your filters
                    </div>
                  ) : (
                    filteredVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{voice.displayName}</span>
                          <span className="text-xs text-gray-500">
                            {voice.localeDisplayName} • {voice.voiceType}
                            {voice.isMultilingual && ' • Multilingual'}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedVoiceData && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedVoiceData.gender}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedVoiceData.voiceType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedVoiceData.localeDisplayName}
                  </Badge>
                  {selectedVoiceData.isMultilingual && (
                    <Badge variant="secondary" className="text-xs">
                      Multilingual
                    </Badge>
                  )}
                  {selectedVoiceData.recommendedFor.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Speaking Rate Control */}
            <div className="space-y-2">
              <Label>Speaking Rate: {speakingRate}x</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.25"
                  value={speakingRate}
                  onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <Select 
                  value={speakingRate.toString()} 
                  onValueChange={(v: string) => setSpeakingRate(parseFloat(v))}
                >
                  <SelectTrigger className="w-[150px]">
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
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2 hidden">
            <Label>Voice</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredVoices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col py-1">
                      <span className="font-medium">{voice.displayName}</span>
                      <span className="text-xs text-gray-500">{voice.localeDisplayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedVoiceData && (
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {selectedVoiceData.gender}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedVoiceData.locale}
                </Badge>
              </div>
            )}
          </div>

          {/* Test Scripts */}
          <div className="space-y-2">
            <Label>Test Script</Label>
            <div className="grid gap-2">
              {TEST_SCRIPTS.map((script, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setTestText(script)}
                  className="justify-start text-left h-auto py-2"
                >
                  <span className="text-xs">{script}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Text */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Or Enter Custom Text</Label>
              <span className="text-xs text-gray-500">{characterCount} chars</span>
            </div>
            <Textarea
              value={testText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter text to test..."
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Azure Neural: $16 per 1M characters</span>
              <span className="font-medium">Cost: ${costEstimate.toFixed(6)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={runFullTest}
              disabled={isProcessing || !testText}
              className="flex-1"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Test TTS
                </>
              )}
            </Button>

            <Button
              onClick={runMicrophoneTest}
              disabled={isProcessing || isStreaming}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {isRecording ? (
                <>
                  <Square className="mr-2 h-5 w-5 text-red-500 animate-pulse" />
                  Recording...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Test STT (Mic)
                </>
              )}
            </Button>

            {testResults.length > 0 && (
              <Button onClick={resetTests} variant="ghost" size="lg">
                <RefreshCw className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Continuous Recognition (WebSocket Streaming) */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={isStreaming ? stopContinuousRecognition : startContinuousRecognition}
              disabled={isProcessing}
              variant={isStreaming ? "destructive" : "default"}
              className="flex-1"
              size="lg"
            >
              {isStreaming ? (
                <>
                  <Square className="mr-2 h-5 w-5" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Continuous Recognition (Real-time)
                </>
              )}
            </Button>
            {isStreaming && (
              <div className="flex items-center gap-2 px-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Audio Playback */}
          {audioUrl && (
            <Button
              onClick={playAudio}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Replay Generated Audio
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card"
              >
                <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{result.step}</p>
                    {result.duration && (
                      <Badge variant="outline" className="text-xs">
                        {result.duration}ms
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{result.message}</p>
                  {result.data?.text && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="text-xs font-mono">"{result.data.text}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Real-time Continuous Transcription */}
      {(liveTranscript || finalTranscript) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-green-500" />
              Live Transcription (Real-time)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Final Transcript */}
            {finalTranscript && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Final Transcript
                </Label>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm leading-relaxed">{finalTranscript.trim()}</p>
                </div>
              </div>
            )}
            
            {/* Live/Partial Transcript */}
            {liveTranscript && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Recognizing...
                </Label>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 italic">
                    {liveTranscript}
                  </p>
                </div>
              </div>
            )}

            {isStreaming && !liveTranscript && !finalTranscript && (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
                <p className="text-sm">Start speaking... (auto-stops after 5s silence)</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transcription Result (Batch STT) */}
      {transcribedText && (
        <Card>
          <CardHeader>
            <CardTitle>Transcribed Text (Batch STT)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-mono text-green-900">
                  "{transcribedText}"
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Compare with Original</Label>
                <div className="p-4 bg-gray-50 border rounded-lg">
                  <p className="text-sm font-mono text-gray-700">
                    "{testText}"
                  </p>
                </div>
              </div>

              {transcribedText.toLowerCase() === testText.toLowerCase() ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Perfect match! ✓</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Text differs (check accuracy)</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">1</Badge>
              <div>
                <p className="font-medium text-sm">Test TTS (Text-to-Speech)</p>
                <p className="text-xs text-muted-foreground">
                  Click "Test TTS" to convert text to speech and play it
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">2</Badge>
              <div>
                <p className="font-medium text-sm">Test STT (Speech-to-Text)</p>
                <p className="text-xs text-muted-foreground">
                  Click "Test STT (Mic)" to record your voice and transcribe it
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">3</Badge>
              <div>
                <p className="font-medium text-sm">Verify Results</p>
                <p className="text-xs text-muted-foreground">
                  Compare transcribed text with original to check accuracy
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> For best results, speak clearly and minimize background noise during microphone testing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
