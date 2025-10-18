# 🔧 Configuration Storage Guide

## Question 1: Can the API Fetch Connection ID?

### ✅ YES! The API can automatically fetch Connection IDs from Telnyx

The backend has an endpoint that fetches all SIP connections:

```bash
GET http://localhost:8000/api/telnyx/sip-credentials
```

**Response Example:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "name": "CRM PBX Forward Only",
      "connectionId": "2808440028160591630",
      "userName": "crmpbx",
      "status": "active",
      "active": true
    },
    {
      "name": "Another Connection",
      "connectionId": "2731919540911867884",
      "userName": "l5ve0smuq3uj",
      "status": "active",
      "active": true
    }
  ]
}
```

### 🚀 New Feature Added: Auto-Detect Button

In **Settings → Telnyx PBX → Configuration** tab, there's now an **"Auto-Detect"** button next to the Connection ID field that:

1. Fetches all SIP connections from Telnyx API
2. Finds the active connection
3. Auto-fills the Connection ID
4. Shows a success toast with the connection name

---

## Question 2: Does the Frontend Have Access to .env?

### ❌ NO - The frontend CANNOT access backend .env files

**Security Reason:** The `.env` file in the `backend` folder is server-side only. Browsers cannot access server files for security reasons.

### ✅ How It Works Instead

#### Backend (.env) ➜ Configuration Service ➜ API Endpoints ➜ Frontend

**Flow:**
1. **Backend reads `.env`** → `backend/.env` contains `TELNYX_API_KEY` and `TELNYX_CONNECTION_ID`
2. **Config service loads it** → `backend/src/config/index.ts` reads environment variables
3. **API exposes safe data** → `GET /api/telnyx/config` returns masked/safe info
4. **Frontend uses API** → React components call the API endpoint

**Example:**

```typescript
// Backend: backend/src/config/index.ts
const config = {
  telnyxApiKey: process.env.TELNYX_API_KEY,          // Full key
  telnyxConnectionId: process.env.TELNYX_CONNECTION_ID  // Full ID
};

// API Endpoint: backend/src/routes/telnyx.ts
router.get('/config', async (_req, res) => {
  res.json({
    hasApiKey: !!config.telnyxApiKey,
    apiKeyPrefix: config.telnyxApiKey.substring(0, 10) + '...',  // Masked!
    connectionId: config.telnyxConnectionId  // Safe to expose
  });
});

// Frontend: src/components/crm/Phone.tsx
const response = await fetch('http://localhost:8000/api/telnyx/config');
const { connectionId } = await response.json();
```

---

## Question 3: Where Does the Frontend Save Configuration Details?

### 📦 Frontend Storage: Browser localStorage

All frontend configurations are saved in the browser's **localStorage**, which persists across page reloads but is specific to each browser/computer.

### Storage Keys Used:

#### 1. **`crm_api_keys`** - API Keys for Various Services
```javascript
localStorage.getItem('crm_api_keys')
// Stores: { googlePlaces: '', hunter: '', apollo: '', telnyx: '', ... }
```

**Used In:**
- `src/components/crm/ApiSetup.tsx` - API Setup page
- `src/components/crm/Phone.tsx` - Checks for Telnyx key before calls

#### 2. **`telnyx_config`** - Telnyx Connection Settings
```javascript
localStorage.getItem('telnyx_config')
// Stores: { apiKey: 'KEY01...', publicKey: '', connectionId: '2808440...' }
```

**Used In:**
- `src/components/crm/TelnyxManager.tsx` - Configuration tab
- `src/components/crm/Phone.tsx` - Gets connection ID for calls

#### 3. **`telnyx_numbers`** - Phone Numbers with AI Settings
```javascript
localStorage.getItem('telnyx_numbers')
// Stores: [
//   {
//     id: '1',
//     phoneNumber: '+16282210321',
//     displayName: 'Main Office',
//     isActive: true,
//     isPrimary: true,
//     aiEnabled: true,
//     aiInstructions: 'You are a professional AI receptionist...',
//     callHandling: 'ai',
//     businessHours: { enabled: true, schedule: {...} }
//   }
// ]
```

**Used In:**
- `src/components/crm/TelnyxManager.tsx` - Phone Numbers tab

#### 4. **`telnyx_phone_number`** - Primary/Default Caller ID
```javascript
localStorage.getItem('telnyx_phone_number')
// Stores: '+16282210321'
```

**Used In:**
- `src/components/crm/Phone.tsx` - Default "from" number for outbound calls
- `src/components/crm/TelnyxQuickAdd.tsx` - Quick setup component

#### 5. **`auth_token`** - User Authentication Token
```javascript
localStorage.getItem('auth_token')
// Stores: JWT token for API authentication
```

**Used In:**
- All API calls requiring authentication
- Header: `Authorization: Bearer ${token}`

---

## 🎯 Complete Configuration Flow

### Step 1: Backend Configuration (Server-side)
```bash
# backend/.env
TELNYX_API_KEY=YOUR_TELNYX_API_KEY
TELNYX_CONNECTION_ID=2808440028160591630
```

### Step 2: Frontend Configuration (Browser localStorage)
```javascript
// User goes to Settings → Telnyx PBX → Configuration
localStorage.setItem('telnyx_config', JSON.stringify({
  apiKey: 'KEY0199F42...',  // Can be different from backend
  connectionId: '2808440028160591630',
  publicKey: ''
}));
```

### Step 3: Making a Call (Uses both)
```javascript
// Phone.tsx - handleCall()
const telnyxConfig = localStorage.getItem('telnyx_config');  // Frontend config
const config = JSON.parse(telnyxConfig);

const response = await fetch('http://localhost:8000/api/calls', {
  method: 'POST',
  body: JSON.stringify({
    to: '+27637250867',
    from: '+16282210321',
    connectionId: config.connectionId  // From localStorage
  })
});

// Backend receives request and uses .env credentials
const apiKey = process.env.TELNYX_API_KEY;  // From .env
const connectionId = req.body.connectionId;  // From frontend
```

---

## 🔐 Security Considerations

### Backend (.env) - SECURE
- ✅ API keys stored server-side
- ✅ Never exposed to browser
- ✅ Version controlled in `.gitignore`
- ✅ Used for actual API calls

### Frontend (localStorage) - LESS SECURE
- ⚠️ Stored in browser (anyone with access to browser can see)
- ⚠️ Lost when browser data is cleared
- ⚠️ Specific to each user's browser
- ✅ Good for user preferences
- ✅ Good for non-sensitive data like phone numbers

### Best Practice:
**Sensitive operations (calls, SMS) should use backend API keys from .env, not frontend localStorage!**

---

## 📊 Storage Comparison Table

| Storage Type | Location | Access | Security | Persistence | Use Case |
|-------------|----------|--------|----------|-------------|----------|
| **Backend .env** | Server filesystem | Server only | 🔒 High | Permanent | API keys, secrets |
| **Frontend localStorage** | Browser storage | Client only | ⚠️ Low | Until cleared | User preferences |
| **Database** | PostgreSQL | Server only | 🔒 High | Permanent | User data, logs |
| **Memory (runtime)** | Server RAM | Server only | 🔒 Medium | Until restart | Temporary cache |

---

## 🚀 Quick Setup Checklist

### Backend Setup (One-time)
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Add `TELNYX_API_KEY=<your-telnyx-api-key>`
- [ ] Add `TELNYX_CONNECTION_ID=2808440028160591630`
- [ ] Restart backend: `cd backend && npm run dev`

### Frontend Setup (Per browser/user)
- [ ] Go to Settings → Telnyx PBX → Configuration
- [ ] Click "Auto-Detect" to fetch Connection ID (OR paste manually)
- [ ] Click "Save Configuration"
- [ ] Go to Phone Numbers tab
- [ ] Click "Import from Telnyx" to auto-fetch your numbers
- [ ] Test by going to Phone & SMS and making a call

---

## 🆘 Troubleshooting

### "Invalid call parameters" Error
✅ **Solution:** Connection ID missing in localStorage
```javascript
// Check if set:
JSON.parse(localStorage.getItem('telnyx_config'))?.connectionId
// Should return: "2808440028160591630"

// If null, go to Settings → Telnyx PBX → Configuration → Click "Auto-Detect"
```

### "Telnyx not configured" Error
✅ **Solution:** API key missing in localStorage
```javascript
// Check if set:
JSON.parse(localStorage.getItem('crm_api_keys'))?.telnyx
// Should return: "KEY0199F42..."

// If null, go to Settings → API Setup → Add Telnyx key
```

### Backend shows "KEY0199F42...3u9F" on startup
✅ **This is correct!** Backend is masking the key for security in logs

### "Connection refused" on localhost:8000
✅ **Solution:** Backend not running
```bash
cd backend
npm run dev
# Should show: "🚀 Server running on port 8000"
```

---

## 📝 Summary

1. **Backend .env** = Server-side secrets (never exposed to browser)
2. **Frontend localStorage** = User preferences stored in browser
3. **API can auto-fetch Connection IDs** from Telnyx
4. **New "Auto-Detect" button** makes setup easier
5. **Configuration is split** between server (.env) and client (localStorage) for security

**Current Status:** ✅ Both backend and frontend are configured correctly with Connection ID `2808440028160591630`
