/**
 * Azure Neural Voices - Comprehensive Catalog
 * Source: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support
 */

export interface VoiceStyle {
  name: string;
  description: string;
}

export interface AzureVoice {
  id: string;
  name: string;
  displayName: string;
  locale: string;
  localeDisplayName: string;
  gender: 'Male' | 'Female' | 'Neutral';
  voiceType: 'Neural' | 'Standard';
  styleList?: VoiceStyle[];
  recommendedFor: string[];
  isMultilingual?: boolean;
}

export const VOICE_CATEGORIES = {
  BUSINESS: 'Business & Professional',
  FRIENDLY: 'Friendly & Conversational',
  NEWS: 'News & Broadcasting',
  CUSTOMER_SERVICE: 'Customer Service',
  STORYTELLING: 'Storytelling & Narration',
  MULTILINGUAL: 'Multilingual',
} as const;

// South African Voices (Primary - Low Latency)
export const SOUTH_AFRICAN_VOICES: AzureVoice[] = [
  {
    id: 'en-ZA-LeahNeural',
    name: 'Leah',
    displayName: 'Leah (Female, Professional)',
    locale: 'en-ZA',
    localeDisplayName: 'English (South Africa)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS, VOICE_CATEGORIES.CUSTOMER_SERVICE],
    styleList: [
      { name: 'default', description: 'Professional and clear' },
    ],
  },
  {
    id: 'en-ZA-LukeNeural',
    name: 'Luke',
    displayName: 'Luke (Male, Professional)',
    locale: 'en-ZA',
    localeDisplayName: 'English (South Africa)',
    gender: 'Male',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS, VOICE_CATEGORIES.NEWS],
    styleList: [
      { name: 'default', description: 'Authoritative and clear' },
    ],
  },
  {
    id: 'af-ZA-AdriNeural',
    name: 'Adri',
    displayName: 'Adri (Female, Afrikaans)',
    locale: 'af-ZA',
    localeDisplayName: 'Afrikaans (South Africa)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.FRIENDLY, VOICE_CATEGORIES.CUSTOMER_SERVICE],
  },
  {
    id: 'af-ZA-WillemNeural',
    name: 'Willem',
    displayName: 'Willem (Male, Afrikaans)',
    locale: 'af-ZA',
    localeDisplayName: 'Afrikaans (South Africa)',
    gender: 'Male',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS],
  },
];

// English (US) - Popular Business Voices
export const US_ENGLISH_VOICES: AzureVoice[] = [
  {
    id: 'en-US-AvaMultilingualNeural',
    name: 'Ava',
    displayName: 'Ava (Female, Multilingual)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Female',
    voiceType: 'Neural',
    isMultilingual: true,
    recommendedFor: [VOICE_CATEGORIES.BUSINESS, VOICE_CATEGORIES.MULTILINGUAL],
  },
  {
    id: 'en-US-AndrewMultilingualNeural',
    name: 'Andrew',
    displayName: 'Andrew (Male, Multilingual)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Male',
    voiceType: 'Neural',
    isMultilingual: true,
    recommendedFor: [VOICE_CATEGORIES.BUSINESS, VOICE_CATEGORIES.MULTILINGUAL],
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria',
    displayName: 'Aria (Female, Friendly)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.FRIENDLY, VOICE_CATEGORIES.CUSTOMER_SERVICE],
    styleList: [
      { name: 'cheerful', description: 'Upbeat and positive' },
      { name: 'empathetic', description: 'Caring and understanding' },
      { name: 'chat', description: 'Casual conversation' },
    ],
  },
  {
    id: 'en-US-DavisNeural',
    name: 'Davis',
    displayName: 'Davis (Male, Professional)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Male',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS],
    styleList: [
      { name: 'chat', description: 'Conversational' },
    ],
  },
  {
    id: 'en-US-EmmaMultilingualNeural',
    name: 'Emma',
    displayName: 'Emma (Female, Multilingual)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Female',
    voiceType: 'Neural',
    isMultilingual: true,
    recommendedFor: [VOICE_CATEGORIES.BUSINESS, VOICE_CATEGORIES.MULTILINGUAL],
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy',
    displayName: 'Guy (Male, News)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Male',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.NEWS],
    styleList: [
      { name: 'newscast', description: 'News broadcasting' },
    ],
  },
  {
    id: 'en-US-JaneNeural',
    name: 'Jane',
    displayName: 'Jane (Female, Professional)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS],
  },
  {
    id: 'en-US-JasonNeural',
    name: 'Jason',
    displayName: 'Jason (Male, Professional)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Male',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS],
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny',
    displayName: 'Jenny (Female, Assistant)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.CUSTOMER_SERVICE],
    styleList: [
      { name: 'assistant', description: 'Virtual assistant' },
      { name: 'chat', description: 'Conversational' },
      { name: 'customerservice', description: 'Customer service' },
    ],
  },
  {
    id: 'en-US-NancyNeural',
    name: 'Nancy',
    displayName: 'Nancy (Female, Professional)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS],
  },
  {
    id: 'en-US-SaraNeural',
    name: 'Sara',
    displayName: 'Sara (Female, News)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.NEWS],
    styleList: [
      { name: 'newscast-casual', description: 'Casual news' },
      { name: 'newscast-formal', description: 'Formal news' },
    ],
  },
  {
    id: 'en-US-TonyNeural',
    name: 'Tony',
    displayName: 'Tony (Male, Professional)',
    locale: 'en-US',
    localeDisplayName: 'English (United States)',
    gender: 'Male',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS],
  },
];

// English (UK) - British Voices
export const UK_ENGLISH_VOICES: AzureVoice[] = [
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia',
    displayName: 'Sonia (Female, British)',
    locale: 'en-GB',
    localeDisplayName: 'English (United Kingdom)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS],
  },
  {
    id: 'en-GB-RyanNeural',
    name: 'Ryan',
    displayName: 'Ryan (Male, British)',
    locale: 'en-GB',
    localeDisplayName: 'English (United Kingdom)',
    gender: 'Male',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS],
  },
  {
    id: 'en-GB-LibbyNeural',
    name: 'Libby',
    displayName: 'Libby (Female, British)',
    locale: 'en-GB',
    localeDisplayName: 'English (United Kingdom)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.FRIENDLY],
  },
];

// English (Australia)
export const AUSTRALIAN_VOICES: AzureVoice[] = [
  {
    id: 'en-AU-NatashaNeural',
    name: 'Natasha',
    displayName: 'Natasha (Female, Australian)',
    locale: 'en-AU',
    localeDisplayName: 'English (Australia)',
    gender: 'Female',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.FRIENDLY],
  },
  {
    id: 'en-AU-WilliamNeural',
    name: 'William',
    displayName: 'William (Male, Australian)',
    locale: 'en-AU',
    localeDisplayName: 'English (Australia)',
    gender: 'Male',
    voiceType: 'Neural',
    recommendedFor: [VOICE_CATEGORIES.BUSINESS],
  },
];

// Combined catalog
export const ALL_VOICES: AzureVoice[] = [
  ...SOUTH_AFRICAN_VOICES,
  ...US_ENGLISH_VOICES,
  ...UK_ENGLISH_VOICES,
  ...AUSTRALIAN_VOICES,
];

// Voice configuration options
export interface VoiceConfig {
  voiceId: string;
  style?: string;
  speakingRate?: number; // 0.5 to 2.0 (default 1.0)
  pitch?: number; // 0.5 to 2.0 (default 1.0)
  volume?: number; // 0 to 100 (default 100)
}

export const SPEAKING_RATES = [
  { value: 0.5, label: '0.5x (Very Slow)' },
  { value: 0.75, label: '0.75x (Slow)' },
  { value: 1, label: '1.0x (Normal)' },
  { value: 1.25, label: '1.25x (Fast)' },
  { value: 1.5, label: '1.5x (Very Fast)' },
  { value: 2, label: '2.0x (Maximum)' },
];

// Helper functions
export const getVoicesByCategory = (category: string): AzureVoice[] => {
  return ALL_VOICES.filter(voice => 
    voice.recommendedFor.includes(category)
  );
};

export const getVoicesByLocale = (locale: string): AzureVoice[] => {
  return ALL_VOICES.filter(voice => voice.locale === locale);
};

export const getVoiceById = (id: string): AzureVoice | undefined => {
  return ALL_VOICES.find(voice => voice.id === id);
};

// Export count for reference
export const VOICE_COUNT = {
  total: ALL_VOICES.length,
  southAfrican: SOUTH_AFRICAN_VOICES.length,
  usEnglish: US_ENGLISH_VOICES.length,
  ukEnglish: UK_ENGLISH_VOICES.length,
  australian: AUSTRALIAN_VOICES.length,
};
