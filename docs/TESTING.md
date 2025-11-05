# Testing Guide

**Comprehensive testing strategies for Powerful CRM - including zero-cost approaches**

---

## 🎯 Testing Philosophy

**Rule #1: Test cheap before testing expensive**

| Test Type | Cost per Test | When to Use |
|-----------|---------------|-------------|
| **Browser Chat** | $0.00 | Always test first |
| **Mock Voice** | $0.00 | Test call flow logic |
| **Real Voice (Ngrok)** | $0.50 | Final validation only |
| **Production Calls** | $0.50 | After all tests pass |

**Cost Savings Example:**
- Traditional: 100 tests × $0.50 = **$50**
- Smart approach: 95 chat tests ($0) + 5 voice tests ($2.50) = **$2.50**
- **Savings: $47.50 (95%)**

---

## 🆓 Zero-Cost Testing

### 1. Browser Chat Tester

**Purpose:** Test AI conversation logic without phone/speech services

**File:** `ai-chat-tester.html`

**How to Use:**
```bash
# Option 1: Open directly in browser
open ai-chat-tester.html

# Option 2: Serve via backend
cd backend
npm run start
# Then open http://localhost:8000/test-chat.html
```

**Features:**
✅ Pre-built test scenarios (sales, support, objections)  
✅ Real Azure OpenAI responses (no mocks)  
✅ Sentiment analysis  
✅ Conversation analytics  
✅ Export conversation logs  
✅ Beautiful UI with dark mode  

**What It Tests:**
- AI response quality
- Conversation flow logic
- Sentiment detection accuracy
- Context retention across messages
- Error handling
- Response time

**What It Doesn't Test:**
- Voice quality (TTS/STT)
- Phone call flow
- Telnyx integration
- Audio processing

---

### 2. Mock Mode Testing

**Enable mocks in environment:**

```env
# backend/.env
MOCK_MODE=true
MOCK_AI_RESPONSES=true
MOCK_SPEECH_SERVICES=true
MOCK_TELNYX=false  # Keep webhook testing real
```

**Mock behavior:**
```typescript
// When MOCK_AI_RESPONSES=true
azureOpenAI.generateChatCompletion() 
  → Returns: "This is a mock AI response for testing."

// When MOCK_SPEECH_SERVICES=true
azureSpeech.textToSpeech("Hello")
  → Returns: <silent audio buffer>
  
azureSpeech.speechToText(<audio>)
  → Returns: "This is mock transcription."
```

**Run tests with mocks:**
```bash
cd backend
MOCK_MODE=true npm test
```

---

### 3. Unit Testing (Jest)

**Backend unit tests** test individual functions in isolation.

**Run tests:**
```bash
cd backend

# All tests
npm test

# Specific file
npm test services/azureOpenAI.test.ts

# Watch mode (re-runs on changes)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Example Test:**
```typescript
// backend/src/services/azureOpenAI.test.ts
import azureOpenAIService from './azureOpenAI';

describe('Azure OpenAI Service', () => {
  it('should generate chat completion', async () => {
    const response = await azureOpenAIService.generateChatCompletion({
      messages: [
        { role: 'system', content: 'You are a sales assistant' },
        { role: 'user', content: 'Tell me about your product' }
      ]
    });
    
    expect(response.content).toBeTruthy();
    expect(response.content.length).toBeGreaterThan(0);
  });
  
  it('should handle errors gracefully', async () => {
    await expect(
      azureOpenAIService.generateChatCompletion({ messages: [] })
    ).rejects.toThrow();
  });
});
```

**Test Coverage Goal:** 80%+

---

## 💰 Low-Cost Testing

### Ngrok + Local Calls

**Cost:** $0.50 per test (only pays for Telnyx minutes, not Speech services)

**Setup:**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start ngrok
ngrok http 8000

# Terminal 3: Update Telnyx webhook
node scripts/update-telnyx-webhook.js https://abc123.ngrok.io
```

**Test Script:**
```bash
# Make a test call
node scripts/test-call.js +27123456789

# Monitor in real-time
# - Backend logs: Terminal 1
# - Ngrok requests: http://localhost:4040
# - Telnyx dashboard: portal.telnyx.com
```

**What This Tests:**
✅ Complete end-to-end call flow  
✅ Telnyx webhook handling  
✅ Audio streaming  
✅ Real TTS/STT quality  
✅ Call state management  

**Optimization:** Keep calls short (<30 seconds) to minimize cost

---

## 🔬 Integration Testing

### API Endpoint Tests

**Test all REST API endpoints:**

```bash
cd backend
npm run test:integration
```

**Example:**
```typescript
// backend/tests/integration/ai-chat.test.ts
import request from 'supertest';
import app from '../../src/server';

describe('POST /api/ai-chat', () => {
  it('should start a new chat session', async () => {
    const response = await request(app)
      .post('/api/ai-chat')
      .send({
        action: 'start',
        scenario: 'sales_call'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.sessionId).toBeTruthy();
    expect(response.body.greeting).toContain('Hello');
  });
  
  it('should send message and get AI response', async () => {
    const response = await request(app)
      .post('/api/ai-chat')
      .send({
        action: 'message',
        sessionId: 'test-session-123',
        message: 'Tell me about your pricing'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.response).toBeTruthy();
  });
});
```

---

### Socket.IO Testing

**Test WebSocket connections:**

```typescript
// backend/tests/integration/socket.test.ts
import { io as Client } from 'socket.io-client';

describe('Socket.IO Events', () => {
  let clientSocket;
  
  beforeAll((done) => {
    clientSocket = Client('http://localhost:8000');
    clientSocket.on('connect', done);
  });
  
  afterAll(() => {
    clientSocket.close();
  });
  
  it('should handle audio_chunk event', (done) => {
    clientSocket.emit('audio_chunk', {
      audio: 'base64-audio-data',
      format: 'audio/pcm',
      sessionId: 'test-123'
    });
    
    clientSocket.on('transcription', (data) => {
      expect(data.text).toBeTruthy();
      done();
    });
  });
});
```

---

## 🎭 Frontend Testing

### Component Tests (Vitest)

```bash
# Run all component tests
npm run test

# Specific component
npm run test src/components/crm/Phone.test.tsx

# UI mode (interactive)
npm run test:ui
```

**Example:**
```typescript
// src/components/crm/Phone.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Phone } from './Phone';

describe('<Phone />', () => {
  it('should render dial pad', () => {
    render(<Phone />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
  
  it('should dial number on button click', () => {
    render(<Phone />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();
  });
  
  it('should make call on call button click', async () => {
    const mockMakeCall = jest.fn();
    render(<Phone onMakeCall={mockMakeCall} />);
    
    fireEvent.click(screen.getByText('Call'));
    expect(mockMakeCall).toHaveBeenCalled();
  });
});
```

---

### E2E Tests (Playwright)

**Full user flow testing:**

```bash
# Install Playwright
npm init playwright@latest

# Run E2E tests
npm run test:e2e

# Interactive mode
npm run test:e2e -- --ui
```

**Example:**
```typescript
// tests/e2e/call-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete call flow', async ({ page }) => {
  // 1. Navigate to app
  await page.goto('http://localhost:5173');
  
  // 2. Open phone dialer
  await page.click('[data-testid="phone-button"]');
  
  // 3. Dial number
  await page.fill('[data-testid="phone-input"]', '+27123456789');
  
  // 4. Click call button
  await page.click('[data-testid="call-button"]');
  
  // 5. Verify call initiated
  await expect(page.locator('[data-testid="call-status"]'))
    .toContainText('Calling');
  
  // 6. Wait for connection
  await expect(page.locator('[data-testid="call-status"]'))
    .toContainText('Connected', { timeout: 10000 });
  
  // 7. End call
  await page.click('[data-testid="hangup-button"]');
  
  // 8. Verify call ended
  await expect(page.locator('[data-testid="call-status"]'))
    .toContainText('Call Ended');
});
```

---

## 📊 Test Scenarios

### Sales Call Scenarios

**1. Interested Prospect**
```
User: "Tell me about your services"
AI: <explains product>
User: "That sounds interesting, what's the pricing?"
AI: <explains pricing>
User: "I'd like to schedule a demo"
AI: "Great! When would work best for you?"
Expected: Meeting booked, deal created
```

**2. Objection Handling**
```
User: "This sounds expensive"
AI: "I understand cost is a concern. Let me show you the ROI..."
User: "How does this compare to <competitor>?"
AI: <handles objection professionally>
Expected: AI addresses concern, keeps conversation going
```

**3. Not Interested**
```
User: "We're not interested right now"
AI: "I understand. May I ask what's preventing you from considering this?"
User: "We already have a solution"
AI: "That's great you have something in place. Would you like me to follow up in 6 months?"
Expected: Polite exit, contact updated with reason
```

---

### Support Call Scenarios

**1. Account Issue**
```
User: "I can't log into my account"
AI: "I'm sorry to hear that. Let me help you troubleshoot..."
Expected: Ticket created, issue resolved or escalated
```

**2. Billing Question**
```
User: "I was charged twice this month"
AI: "Let me look into that for you. Can you provide your account email?"
Expected: Issue logged, refund process initiated
```

---

## ✅ Testing Checklist

### Before Every Deploy

- [ ] All unit tests pass (`npm test`)
- [ ] All integration tests pass (`npm run test:integration`)
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend builds without errors (`cd backend && npm run build`)
- [ ] Linter passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] At least 1 browser chat test passed
- [ ] At least 1 real call test passed (optional but recommended)

---

### Weekly Testing

- [ ] Test all pre-built scenarios in ai-chat-tester.html
- [ ] Make 3-5 real test calls to verify quality
- [ ] Check cost tracking dashboard (should match actual spend)
- [ ] Review call logs for errors
- [ ] Test error scenarios (invalid number, no answer, busy)

---

### Monthly Testing

- [ ] Load testing (simulate 50+ concurrent connections)
- [ ] Security audit (API key exposure, SQL injection)
- [ ] Cost analysis (actual vs. expected spend)
- [ ] Voice quality check (TTS clarity, STT accuracy)
- [ ] Database backup and restore test

---

## 🔍 Debugging Test Failures

### Backend Test Fails

```bash
# Enable debug logging
LOG_LEVEL=debug npm test

# Run single test with logs
npm test -- services/azureOpenAI.test.ts --verbose

# Check if services are running
curl http://localhost:8000/api/health
```

---

### Frontend Test Fails

```bash
# Check if backend is running
curl http://localhost:8000/api/health

# Enable verbose logging
npm run test -- --reporter=verbose

# Run in browser (easier to debug)
npm run test:ui
```

---

### Integration Test Fails

**Common Issues:**

1. **Port conflict:**
```bash
# Kill process on port 8000
lsof -i :8000
kill -9 <PID>
```

2. **Database state:**
```bash
# Reset test database
cd backend
npx prisma migrate reset
```

3. **API keys invalid:**
```bash
# Verify keys in .env
cat backend/.env | grep API_KEY

# Test Azure OpenAI manually
curl -X POST "${AZURE_OPENAI_ENDPOINT}..." \
  -H "api-key: $AZURE_OPENAI_API_KEY"
```

---

## 📈 Test Coverage

### Current Coverage Goals

| Component | Target | Status |
|-----------|--------|--------|
| Backend Services | 80% | ⚠️ 65% |
| Backend Routes | 70% | ⚠️ 55% |
| Frontend Components | 60% | ⚠️ 45% |
| E2E Critical Flows | 100% | ✅ 100% |

### Generate Coverage Report

```bash
# Backend
cd backend
npm test -- --coverage
open coverage/lcov-report/index.html

# Frontend
npm run test:coverage
open coverage/index.html
```

---

## 🚀 Performance Testing

### Load Testing

**Simulate concurrent users:**

```bash
# Install k6
brew install k6  # Mac
choco install k6  # Windows

# Run load test
k6 run tests/load/call-load-test.js
```

**Example Load Test:**
```javascript
// tests/load/call-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50,  // 50 virtual users
  duration: '30s',
};

export default function () {
  const response = http.post('http://localhost:8000/api/ai-chat', {
    action: 'message',
    sessionId: 'load-test',
    message: 'Hello'
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}
```

**Targets:**
- 50 concurrent users
- < 2s response time (p95)
- 0% error rate

---

## 📚 Related Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Local development setup
- **[API_REFERENCE.md](API_REFERENCE.md)** - API endpoints for testing
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common test failures
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture understanding

---

**Last Updated:** 2025  
**Maintained By:** Powerful CRM Development Team
