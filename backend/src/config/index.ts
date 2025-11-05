import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  databaseProvider: 'azure-sql' | 'postgresql' | 'supabase';
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  redisUrl: string;
  frontendUrl: string;
  backendUrl: string;
  webhookUrl?: string; // Ngrok URL for webhooks (optional)
  
  // External APIs
  googlePlacesApiKey: string;
  telnyxApiKey: string;
  telnyxPublicKey: string;
  telnyxConnectionId: string;
  telnyxPreferredRegion: string; // 'us', 'europe', 'asia'
  azureSpeechKey: string;
  azureSpeechRegion: string;
  openaiApiKey: string;
  
  // Alternative AI Providers (Cost-Optimized)
  groqApiKey: string; // 10x cheaper LLM
  elevenLabsApiKey: string; // High-quality TTS
  anthropicApiKey: string; // Claude (alternative to GPT-4)
  
  // Azure OpenAI
  azureOpenAIKey: string;
  azureOpenAIEndpoint: string;
  azureOpenAIDeployment: string;
  azureOpenAIApiVersion: string;
  
  // Email
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;
  
  // Storage
  storageType: 'local' | 's3' | 'azure' | 'gcs';
  awsS3Bucket: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  
  // Stripe
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // Security
  corsOrigin: string;
  trustProxy: boolean;
  
  // Logging
  logLevel: string;
  logFile: string;
}

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

function getOptionalEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) {
    throw new TypeError(`Environment variable ${key} must be a number`);
  }
  return num;
}

function getBooleanEnvVar(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

const config: Config = {
  port: getNumberEnvVar('PORT', 8000),
  nodeEnv: getOptionalEnvVar('NODE_ENV', 'development'),
  databaseUrl: getRequiredEnvVar('DATABASE_URL'),
  databaseProvider: (getOptionalEnvVar('DATABASE_PROVIDER', 'postgresql') as any),
  jwtSecret: getRequiredEnvVar('JWT_SECRET'),
  jwtRefreshSecret: getRequiredEnvVar('JWT_REFRESH_SECRET'),
  jwtExpiresIn: getOptionalEnvVar('JWT_EXPIRES_IN', '15m'),
  jwtRefreshExpiresIn: getOptionalEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
  redisUrl: getOptionalEnvVar('REDIS_URL', 'redis://localhost:6379'),
  frontendUrl: getOptionalEnvVar('FRONTEND_URL', 'http://localhost:3000'),
  backendUrl: getOptionalEnvVar('BACKEND_URL', 'http://localhost:8000'),
  webhookUrl: getOptionalEnvVar('WEBHOOK_URL'), // Ngrok URL for webhooks
  
  // External APIs (optional for development)
  googlePlacesApiKey: getOptionalEnvVar('GOOGLE_PLACES_API_KEY'),
  telnyxApiKey: getOptionalEnvVar('TELNYX_API_KEY'),
  telnyxPublicKey: getOptionalEnvVar('TELNYX_PUBLIC_KEY'),
  telnyxConnectionId: getOptionalEnvVar('TELNYX_CONNECTION_ID'),
  telnyxPreferredRegion: getOptionalEnvVar('TELNYX_PREFERRED_REGION', 'europe'), // Closest to SA
  azureSpeechKey: getOptionalEnvVar('AZURE_SPEECH_KEY'),
  azureSpeechRegion: getOptionalEnvVar('AZURE_SPEECH_REGION', 'southafricanorth'), // SA region!
  openaiApiKey: getOptionalEnvVar('OPENAI_API_KEY'),
  
  // Alternative AI Providers (Cost-Optimized)
  groqApiKey: getOptionalEnvVar('GROQ_API_KEY'), // 10x cheaper than GPT-4
  elevenLabsApiKey: getOptionalEnvVar('ELEVENLABS_API_KEY'), // Better TTS than Azure
  anthropicApiKey: getOptionalEnvVar('ANTHROPIC_API_KEY'), // Claude alternative
  
  // Azure OpenAI
  azureOpenAIKey: getOptionalEnvVar('AZURE_OPENAI_KEY'),
  azureOpenAIEndpoint: getOptionalEnvVar('AZURE_OPENAI_ENDPOINT'),
  azureOpenAIDeployment: getOptionalEnvVar('AZURE_OPENAI_DEPLOYMENT', 'gpt-4'),
  azureOpenAIApiVersion: getOptionalEnvVar('AZURE_OPENAI_API_VERSION', '2024-02-15-preview'),
  
  // Email
  smtpHost: getOptionalEnvVar('SMTP_HOST', 'smtp.gmail.com'),
  smtpPort: getNumberEnvVar('SMTP_PORT', 587),
  smtpUser: getOptionalEnvVar('SMTP_USER'),
  smtpPassword: getOptionalEnvVar('SMTP_PASSWORD'),
  emailFrom: getOptionalEnvVar('EMAIL_FROM', 'noreply@yourcrm.com'),
  
  // Storage
  storageType: (getOptionalEnvVar('STORAGE_TYPE', 'local') as any),
  awsS3Bucket: getOptionalEnvVar('AWS_S3_BUCKET'),
  awsAccessKeyId: getOptionalEnvVar('AWS_ACCESS_KEY_ID'),
  awsSecretAccessKey: getOptionalEnvVar('AWS_SECRET_ACCESS_KEY'),
  awsRegion: getOptionalEnvVar('AWS_REGION', 'us-east-1'),
  
  // Stripe
  stripeSecretKey: getOptionalEnvVar('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: getOptionalEnvVar('STRIPE_WEBHOOK_SECRET'),
  
  // Rate Limiting
  rateLimitWindowMs: getNumberEnvVar('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
  rateLimitMaxRequests: getNumberEnvVar('RATE_LIMIT_MAX_REQUESTS', 100),
  
  // Security
  corsOrigin: getOptionalEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  trustProxy: getBooleanEnvVar('TRUST_PROXY', false),
  
  // Logging
  logLevel: getOptionalEnvVar('LOG_LEVEL', 'info'),
  logFile: getOptionalEnvVar('LOG_FILE', 'logs/app.log'),
};

// Validate critical configuration
if (config.nodeEnv === 'production') {
  const requiredProdVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DATABASE_URL'
  ];
  
  for (const varName of requiredProdVars) {
    if (!process.env[varName]) {
      throw new Error(`${varName} is required in production`);
    }
  }
  
  // Validate JWT secret length
  if (config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
  
  if (config.jwtRefreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long in production');
  }
}

export default config;