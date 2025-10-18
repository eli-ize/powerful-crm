/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_PLACES_API_KEY: string;
  readonly VITE_TELNYX_API_KEY: string;
  readonly VITE_AZURE_SPEECH_KEY: string;
  readonly VITE_AZURE_SPEECH_REGION: string;
  readonly VITE_AZURE_OPENAI_KEY: string;
  readonly VITE_AZURE_OPENAI_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
