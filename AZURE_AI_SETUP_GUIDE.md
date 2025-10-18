# 🤖 Azure AI Setup Guide - TTS/STT & OpenAI Integration

**For:** Powerful CRM - AI-Powered Call Automation  
**Date:** October 18, 2025

---

## 📋 Overview

This guide will help you set up Azure AI services for intelligent call automation:

1. **Azure Speech Services** - Text-to-Speech (TTS) and Speech-to-Text (STT)
2. **Azure OpenAI** - GPT-4 for intelligent conversation
3. **Integration** - Connect to Telnyx calling platform

---

## 🚀 Part 1: Azure Speech Services (TTS/STT)

### Step 1: Create Azure Speech Resource

```bash
# Option A: Azure Portal (Easiest)
1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Speech"
4. Click "Speech" by Microsoft
5. Click "Create"

# Fill in details:
- Subscription: Choose your subscription
- Resource group: Create new "powerful-crm-rg" or use existing
- Region: East US (or nearest to your users)
- Name: "powerful-crm-speech"
- Pricing tier: Free F0 (5 audio hours/month) or S0 (Pay as you go)

6. Click "Review + create"
7. Click "Create"
```

```powershell
# Option B: Azure CLI
az cognitiveservices account create `
  --name powerful-crm-speech `
  --resource-group powerful-crm-rg `
  --kind SpeechServices `
  --sku F0 `
  --location eastus `
  --yes
```

### Step 2: Get API Key and Region

```bash
# Portal Method:
1. Go to your Speech resource
2. Click "Keys and Endpoint" in left menu
3. Copy "KEY 1" (or KEY 2)
4. Note the "Region" (e.g., eastus)

# CLI Method:
az cognitiveservices account keys list \
  --name powerful-crm-speech \
  --resource-group powerful-crm-rg
```

### Step 3: Add to Environment Variables

```powershell
# Backend .env file
cd "U:\Powerful CRM\backend"

# Add these lines to .env
Add-Content -Path .env -Value "AZURE_SPEECH_KEY=your_key_here"
Add-Content -Path .env -Value "AZURE_SPEECH_REGION=eastus"
```

### Step 4: Add to GitHub Secrets

```bash
# Go to: https://github.com/eli-ize/powerful-crm/settings/secrets/actions

# Add two new secrets:
Name: AZURE_SPEECH_KEY
Value: [paste your key]

Name: AZURE_SPEECH_REGION
Value: eastus
```

### Step 5: Test Azure Speech

```powershell
# Create a test script
cd "U:\Powerful CRM"

@"
const azureSpeech = require('./backend/src/services/azureSpeech').default;

async function test() {
  try {
    // Test TTS
    console.log('Testing Text-to-Speech...');
    const audio = await azureSpeech.textToSpeech('Hello! This is a test of Azure Speech.');
    console.log('TTS Success! Audio buffer size:', audio.length);
    
    // List available voices
    const voices = azureSpeech.getRecommendedVoices();
    console.log('Available voices:', voices);
    
    console.log('✅ Azure Speech is working!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
"@ | Out-File -FilePath test-azure-speech.js

# Run test
cd backend
npm run dev
# Then in another terminal:
node test-azure-speech.js
```

---

## 🧠 Part 2: Azure OpenAI

### Step 1: Request Access (If Needed)

Azure OpenAI requires application approval:

```bash
1. Go to: https://aka.ms/oai/access
2. Fill out the form
3. Wait for approval (usually 1-2 business days)
4. You'll receive an email when approved
```

### Step 2: Create Azure OpenAI Resource

```bash
# Portal Method:
1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Azure OpenAI"
4. Click "Azure OpenAI" by Microsoft
5. Click "Create"

# Fill in details:
- Subscription: Choose your subscription
- Resource group: powerful-crm-rg
- Region: East US (check availability)
- Name: powerful-crm-openai
- Pricing tier: Standard S0

6. Click "Review + create"
7. Click "Create"
```

```powershell
# CLI Method:
az cognitiveservices account create `
  --name powerful-crm-openai `
  --resource-group powerful-crm-rg `
  --kind OpenAI `
  --sku S0 `
  --location eastus `
  --yes
```

### Step 3: Deploy a Model

```bash
# Portal Method:
1. Go to your Azure OpenAI resource
2. Click "Model deployments" or "Go to Azure OpenAI Studio"
3. Click "Deployments" → "Create new deployment"
4. Select model: "gpt-4" or "gpt-35-turbo"
5. Name: "gpt-4" (use this exact name or update config)
6. Click "Create"

# Note the deployment name - you'll need it!
```

### Step 4: Get Endpoint and API Key

```bash
# Portal Method:
1. Go to your Azure OpenAI resource
2. Click "Keys and Endpoint"
3. Copy "KEY 1"
4. Copy "Endpoint" (e.g., https://powerful-crm-openai.openai.azure.com)

# CLI Method:
az cognitiveservices account show `
  --name powerful-crm-openai `
  --resource-group powerful-crm-rg `
  --query properties.endpoint

az cognitiveservices account keys list `
  --name powerful-crm-openai `
  --resource-group powerful-crm-rg
```

### Step 5: Add to Environment Variables

```powershell
# Backend .env file
cd "U:\Powerful CRM\backend"

# Add these lines to .env
Add-Content -Path .env -Value "AZURE_OPENAI_KEY=your_key_here"
Add-Content -Path .env -Value "AZURE_OPENAI_ENDPOINT=https://powerful-crm-openai.openai.azure.com"
Add-Content -Path .env -Value "AZURE_OPENAI_DEPLOYMENT=gpt-4"
Add-Content -Path .env -Value "AZURE_OPENAI_API_VERSION=2024-02-15-preview"
```

### Step 6: Add to GitHub Secrets

```bash
# Go to: https://github.com/eli-ize/powerful-crm/settings/secrets/actions

Name: AZURE_OPENAI_KEY
Value: [paste your key]

Name: AZURE_OPENAI_ENDPOINT
Value: https://powerful-crm-openai.openai.azure.com

Name: AZURE_OPENAI_DEPLOYMENT
Value: gpt-4

Name: AZURE_OPENAI_API_VERSION
Value: 2024-02-15-preview
```

### Step 7: Test Azure OpenAI

```powershell
# Create test script
cd "U:\Powerful CRM"

@"
const azureOpenAI = require('./backend/src/services/azureOpenAI').default;

async function test() {
  try {
    console.log('Testing Azure OpenAI...');
    
    const response = await azureOpenAI.generateChatCompletion({
      messages: [
        { role: 'user', content: 'Say hello in a friendly way!' }
      ]
    });
    
    console.log('AI Response:', response.content);
    console.log('Tokens used:', response.usage.totalTokens);
    console.log('✅ Azure OpenAI is working!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
"@ | Out-File -FilePath test-azure-openai.js

# Run test
cd backend
node test-azure-openai.js
```

---

## 🔗 Part 3: Integration with Telnyx Calls

### Current Architecture

```
Telnyx Call → Webhook → Basic TTS → End
```

### Target Architecture

```
Telnyx Call
  ↓
Webhook Event (call.answered)
  ↓
Azure STT (Convert prospect speech → text)
  ↓
Azure OpenAI (Generate smart response)
  ↓
Azure TTS (Convert response → audio)
  ↓
Telnyx API (Play audio to prospect)
  ↓
Repeat conversation loop
```

### Implementation Plan

**I can implement this for you! Here's what needs to be done:**

1. **Create AI Call Handler Service** (`backend/src/services/aiCallHandler.ts`)
   - Manages conversation state
   - Coordinates between Speech/OpenAI/Telnyx
   - Tracks call stages (greeting → qualification → pitch → closing)

2. **Update Telnyx Webhook Handler** (`backend/src/routes/telnyx.ts`)
   - Add speech recognition on prospect audio
   - Generate AI responses
   - Convert to speech and play back

3. **Add Conversation State Management**
   - Store conversation history in database
   - Track call progress
   - Handle interruptions

4. **Create Call Analytics**
   - Analyze call outcomes
   - Generate follow-up emails
   - Score lead quality

Would you like me to implement this integration now?

---

## 💰 Pricing & Limits

### Azure Speech Services

**Free Tier (F0):**
- 5 audio hours/month for TTS
- 5 audio hours/month for STT
- Perfect for development/testing

**Standard Tier (S0):**
- TTS: $16 per 1 million characters (Neural voices)
- STT: $1 per audio hour
- For a 2-minute call: ~$0.033

### Azure OpenAI

**GPT-4:**
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Average call (10 exchanges): ~$0.10-0.30

**GPT-3.5-Turbo (Cheaper alternative):**
- Input: $0.0015 per 1K tokens
- Output: $0.002 per 1K tokens
- Average call: ~$0.01-0.05

### Total Cost Per Call

```
Speech STT:  $0.017  (2 min * $1/hour)
Speech TTS:  $0.016  (~1000 chars)
OpenAI GPT-4: $0.20  (10 exchanges)
Telnyx:      $0.008  (2 min * $0.004/min)
-----------------------------------
TOTAL:       ~$0.24 per call (GPT-4)
             ~$0.05 per call (GPT-3.5-Turbo)
```

---

## 🧪 Testing Checklist

### Before Going Live:

- [ ] Azure Speech key added to .env
- [ ] Azure OpenAI key added to .env
- [ ] Test TTS with test script
- [ ] Test STT with test script (if possible)
- [ ] Test OpenAI chat completion
- [ ] Backend server runs without errors
- [ ] All keys added to GitHub Secrets
- [ ] Deployment workflow updated
- [ ] Integration code implemented
- [ ] Test end-to-end call flow
- [ ] Monitor usage/costs in Azure Portal

---

## 🔧 Troubleshooting

### "Azure Speech Service not configured"

```powershell
# Check backend .env file
cd "U:\Powerful CRM\backend"
cat .env | Select-String "AZURE_SPEECH"

# Should show:
# AZURE_SPEECH_KEY=...
# AZURE_SPEECH_REGION=eastus
```

### "OpenAI service not configured"

```powershell
# Check backend .env file
cat .env | Select-String "AZURE_OPENAI"

# Should show:
# AZURE_OPENAI_KEY=...
# AZURE_OPENAI_ENDPOINT=https://...
# AZURE_OPENAI_DEPLOYMENT=gpt-4
```

### "Model deployment not found"

```bash
# Check deployment name matches
1. Go to Azure OpenAI Studio
2. Click "Deployments"
3. Copy exact deployment name
4. Update AZURE_OPENAI_DEPLOYMENT in .env
```

### "403 Forbidden" on OpenAI

```bash
# Common causes:
1. API key expired or wrong
2. Region mismatch
3. Model not deployed
4. Not approved for Azure OpenAI yet

# Solution: Check Azure Portal resource status
```

---

## 📚 Additional Resources

### Documentation
- [Azure Speech SDK](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- [Azure OpenAI](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Telnyx API](https://developers.telnyx.com/)

### Voice Customization
- [Voice Gallery](https://speech.microsoft.com/portal/voicegallery)
- [SSML Reference](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup)

### Best Practices
- Use regional endpoints close to your users
- Implement retry logic for API calls
- Monitor usage in Azure Portal
- Set up billing alerts
- Cache common responses

---

## 🎯 Next Steps

1. **Set up Azure resources** (follow Part 1 & 2)
2. **Add credentials** to .env and GitHub Secrets
3. **Test services** individually
4. **Request implementation** of AI call integration
5. **Test end-to-end** call flow
6. **Monitor & optimize**

---

## 💬 Need Help?

If you need me to:
- ✅ Implement the AI call handler integration
- ✅ Create test scripts
- ✅ Debug connection issues
- ✅ Optimize voice selection
- ✅ Add conversation analytics

Just let me know! I can implement the complete integration now that the services are configured.

---

**Ready to proceed?** Once you have your Azure credentials, I can implement the full AI call automation system! 🚀
