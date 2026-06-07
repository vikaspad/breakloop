# Connection Settings Guide — All Agent Types

Complete configuration examples for every connection type in BreakLoop.

---

## Table of Contents

1. [Connection Type Overview](#connection-type-overview)
2. [REST API](#1-rest-api)
3. [OpenAI](#2-openai)
4. [Claude API](#3-claude-api)
5. [LangChain / LangServe](#4-langchain--langserve)
6. [WebSocket](#5-websocket)
7. [Mock / Sandbox](#6-mock--sandbox)
8. [Troubleshooting](#troubleshooting)
9. [Quick Reference](#quick-reference)

---

## Connection Type Overview

| Type | Auth | Endpoint | Best For | Cost |
|------|------|----------|----------|------|
| **REST** | Custom | Required | Any HTTP API | Free |
| **OpenAI** | API Key | None (auto) | GPT models | $0.001-0.01/run |
| **Claude API** | API Key | None (auto) | Claude models | $0.001-0.01/run |
| **LangChain** | API Key | Required | LangServe chains | Varies |
| **WebSocket** | Custom | Required | Streaming agents | Free |
| **Mock** | None | None | Testing/sandbox | Minimal |

---

## 1. REST API

### Use Case
Custom HTTP endpoints, legacy systems, any agent serving HTTP requests.

### Onboarding Wizard - Step 2: Connection

```
┌─────────────────────────────────────────┐
│ STEP 2: CONNECTION CONFIGURATION       │
├─────────────────────────────────────────┤
│                                         │
│ Connection Type: REST ▼                 │
│                                         │
│ Endpoint:                              │
│ [https://your-agent.com/api/run   ]   │
│                                         │
│ Auth Type: BEARER ▼                     │
│                                         │
│ Auth Token (if needed):                │
│ [eyJhbGciOiJIUzI1NiIs...]             │
│                                         │
│ ← Back              Next → │
└─────────────────────────────────────────┘
```

### Field Definitions

| Field | Value | Notes |
|-------|-------|-------|
| **Connection Type** | `REST` | Select from dropdown |
| **Endpoint** | Full URL to agent | Must start with `http://` or `https://` |
| **Auth Type** | One of: BEARER, API_KEY, BASIC, NONE | Choose based on your API |
| **Auth Token** | Your credential | Only if Auth Type ≠ NONE |

### Example 1: REST with Bearer Token

**For:** Sample agent running on localhost

```
Connection Type: REST
Endpoint: http://localhost:3002/api/run
Auth Type: BEARER
Auth Token: my-secret-token-abc123xyz
```

**Expected Request (BreakLoop → Your Agent):**
```bash
curl -X POST http://localhost:3002/api/run \
  -H "Authorization: Bearer my-secret-token-abc123xyz" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello, who are you?",
    "session_id": "uuid-v4-string"
  }'
```

**Expected Response (Your Agent → BreakLoop):**
```json
{
  "output": "Hello! I'm a support bot here to help.",
  "session_id": "uuid-v4-string"
}
```

### Example 2: REST with API Key Header

**For:** Third-party API requiring x-api-key header

```
Connection Type: REST
Endpoint: https://api.example.com/v1/agent/run
Auth Type: API_KEY
Auth Token: sk-1234567890abcdef
```

**Expected Request:**
```bash
curl -X POST https://api.example.com/v1/agent/run \
  -H "x-api-key: sk-1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Your question here",
    "session_id": "uuid-v4-string"
  }'
```

### Example 3: REST with Basic Auth

**For:** Legacy systems with Basic authentication

```
Connection Type: REST
Endpoint: https://legacy-agent.company.com/api/process
Auth Type: BASIC
Auth Token: username:password (or base64 encoded)
```

**Expected Request:**
```bash
curl -X POST https://legacy-agent.company.com/api/process \
  -H "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Your request",
    "session_id": "uuid-v4-string"
  }'
```

**Note:** Base64(username:password) = base64("username:password")

### Example 4: REST with No Auth

**For:** Public endpoints or localhost development

```
Connection Type: REST
Endpoint: http://localhost:8080/chat
Auth Type: NONE
Auth Token: [leave blank]
```

**Expected Request:**
```bash
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello",
    "session_id": "uuid-v4-string"
  }'
```

### Verification

After onboarding, click **"Ping"** button. Expected:
- ✅ Green "✓ OK" — Agent responded successfully
- ❌ Red "✗ Fail" — Check endpoint, auth, network

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Cannot reach agent" | Wrong endpoint | Check URL is reachable with curl |
| "401 Unauthorized" | Bad auth token | Verify token in auth system |
| "405 Method Not Allowed" | Endpoint doesn't accept POST | Check endpoint supports POST |
| "Timeout after 30s" | Agent too slow | Increase timeout or speed up agent |

---

## 2. OpenAI

### Use Case
Using OpenAI API models (GPT-4o, GPT-3.5-turbo, etc.)

### Get Your API Key

1. Go to [platform.openai.com/api/keys](https://platform.openai.com/api/keys)
2. Click **"Create new secret key"**
3. Name it: `BreakLoop` (optional)
4. Copy the key: `sk-proj-...`
5. Save securely (can't view again!)

### Onboarding Wizard - Step 2: Connection

```
┌─────────────────────────────────────────┐
│ STEP 2: CONNECTION CONFIGURATION       │
├─────────────────────────────────────────┤
│                                         │
│ Connection Type: OpenAI ▼               │
│                                         │
│ Endpoint: [BLANK - not needed]         │
│                                         │
│ Auth Type: API_KEY ▼                    │
│                                         │
│ Auth Token:                            │
│ [sk-proj-abc123xyz...]                 │
│                                         │
│ ← Back              Next → │
└─────────────────────────────────────────┘
```

### Field Definitions

| Field | Value | Notes |
|-------|-------|-------|
| **Connection Type** | `OpenAI` | Select from dropdown |
| **Endpoint** | Leave blank | BreakLoop auto-uses api.openai.com |
| **Auth Type** | `API_KEY` | Only option for OpenAI |
| **Auth Token** | `sk-proj-...` | From platform.openai.com |

### Example 1: GPT-4o (Recommended)

```
Connection Type: OpenAI
Endpoint: [blank]
Auth Type: API_KEY
Auth Token: sk-proj-abcdef123456xyz...
```

**Backend Configuration (in agent settings):**
- Model: `gpt-4o`
- Temperature: `0.7` (balanced)
- Max tokens: `2000`

**Cost:** ~$0.003-0.01 per test run

### Example 2: GPT-4-turbo (Faster)

```
Connection Type: OpenAI
Endpoint: [blank]
Auth Type: API_KEY
Auth Token: sk-proj-abcdef123456xyz...
```

**Backend Configuration:**
- Model: `gpt-4-turbo`
- Temperature: `0.5` (focused)
- Max tokens: `1500`

**Cost:** ~$0.002-0.008 per test run

### Example 3: GPT-3.5-turbo (Budget)

```
Connection Type: OpenAI
Endpoint: [blank]
Auth Type: API_KEY
Auth Token: sk-proj-abcdef123456xyz...
```

**Backend Configuration:**
- Model: `gpt-3.5-turbo`
- Temperature: `0.7`
- Max tokens: `1000`

**Cost:** ~$0.0001-0.0005 per test run

### Verification

1. Click **"Ping"** in agent registry
2. Expected: ✅ Green "✓ OK"
3. If red "✗ Fail":
   - Check API key format (`sk-proj-...`)
   - Verify account has credits
   - Check [status.openai.com](https://status.openai.com)

### Model Options

| Model | Quality | Speed | Cost | Best For |
|-------|---------|-------|------|----------|
| `gpt-4o` | Best | Fast | Higher | Production, complex tasks |
| `gpt-4-turbo` | Excellent | Medium | Medium | Balanced approach |
| `gpt-3.5-turbo` | Good | Very Fast | Low | Testing, budget-conscious |
| `gpt-4o-mini` | Good | Very Fast | Very Low | Evals, cheap testing |

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "API key invalid" | Wrong format or revoked | Regenerate at platform.openai.com |
| "Rate limited" | Too many requests | Wait 60s, spread tests over time |
| "Insufficient quota" | No credits | Add payment method, buy credits |
| "Model not found" | Typo in model name | Use valid model: gpt-4o, gpt-3.5-turbo |

---

## 3. Claude API

### Use Case
Using Anthropic Claude models directly

### Get Your API Key

1. Go to [console.anthropic.com/account/keys](https://console.anthropic.com/account/keys)
2. Click **"Create key"**
3. Name it: `BreakLoop` (optional)
4. Copy the key: `sk-ant-...`
5. Save securely

### Onboarding Wizard - Step 2: Connection

```
┌─────────────────────────────────────────┐
│ STEP 2: CONNECTION CONFIGURATION       │
├─────────────────────────────────────────┤
│                                         │
│ Connection Type: Claude API ▼           │
│                                         │
│ Endpoint: [BLANK - not needed]         │
│                                         │
│ Auth Type: API_KEY ▼                    │
│                                         │
│ Auth Token:                            │
│ [sk-ant-abc123xyz...]                  │
│                                         │
│ ← Back              Next → │
└─────────────────────────────────────────┘
```

### Field Definitions

| Field | Value | Notes |
|-------|-------|-------|
| **Connection Type** | `Claude API` | Select from dropdown |
| **Endpoint** | Leave blank | BreakLoop auto-uses api.anthropic.com |
| **Auth Type** | `API_KEY` | Only option for Claude |
| **Auth Token** | `sk-ant-...` | From console.anthropic.com |

### Example 1: Claude 3.5 Sonnet (Recommended)

```
Connection Type: Claude API
Endpoint: [blank]
Auth Type: API_KEY
Auth Token: sk-ant-abcdef123456xyz...
```

**Backend Configuration:**
- Model: `claude-3-5-sonnet-20241022` (or latest)
- Temperature: `0.7`
- Max tokens: `2048`

**Cost:** ~$0.003-0.01 per test run

### Example 2: Claude 3 Opus (Most Capable)

```
Connection Type: Claude API
Endpoint: [blank]
Auth Type: API_KEY
Auth Token: sk-ant-abcdef123456xyz...
```

**Backend Configuration:**
- Model: `claude-3-opus-20240229`
- Temperature: `0.5` (focused)
- Max tokens: `2048`

**Cost:** ~$0.015-0.03 per test run (most expensive)

### Example 3: Claude 3.5 Haiku (Budget)

```
Connection Type: Claude API
Endpoint: [blank]
Auth Type: API_KEY
Auth Token: sk-ant-abcdef123456xyz...
```

**Backend Configuration:**
- Model: `claude-3-5-haiku-20241022`
- Temperature: `0.7`
- Max tokens: `1024`

**Cost:** ~$0.0008-0.002 per test run (cheapest)

### Verification

1. Click **"Ping"** in agent registry
2. Expected: ✅ Green "✓ OK"
3. If red "✗ Fail":
   - Check API key format (`sk-ant-...`)
   - Verify account has credits
   - Check [status.anthropic.com](https://status.anthropic.com)

### Model Options

| Model | Quality | Speed | Cost | Best For |
|-------|---------|-------|------|----------|
| `claude-3-5-sonnet` | Best | Fast | Medium | Production, recommended |
| `claude-3-opus` | Excellent | Slower | High | Complex reasoning |
| `claude-3-5-haiku` | Good | Very Fast | Low | Testing, evals |

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "API key invalid" | Wrong format or revoked | Regenerate at console.anthropic.com |
| "Rate limited" | Too many requests | Wait 60s, check usage dashboard |
| "Insufficient credits" | Account balance low | Add billing method, top up |
| "Model not found" | Typo or model unavailable | Use: claude-3-5-sonnet, claude-3-opus, claude-3-5-haiku |

---

## 4. LangChain / LangServe

### Use Case
LangChain agents deployed via LangServe endpoint

### Prerequisites

1. You have a LangServe deployed agent
2. Endpoint is: `https://your-langserve.com/YOUR_CHAIN`
3. You have an API key (if authentication enabled)

### Onboarding Wizard - Step 2: Connection

```
┌─────────────────────────────────────────┐
│ STEP 2: CONNECTION CONFIGURATION       │
├─────────────────────────────────────────┤
│                                         │
│ Connection Type: LangChain ▼            │
│                                         │
│ Endpoint:                              │
│ [https://your-langserve.com/my_chain] │
│                                         │
│ Auth Type: API_KEY ▼                    │
│                                         │
│ Auth Token:                            │
│ [your-api-key-or-token]                │
│                                         │
│ ← Back              Next → │
└─────────────────────────────────────────┘
```

### Field Definitions

| Field | Value | Notes |
|-------|-------|-------|
| **Connection Type** | `LangChain` | Select from dropdown |
| **Endpoint** | Full LangServe URL | `https://your-langserve.com/your_chain` |
| **Auth Type** | API_KEY, BEARER, or NONE | Depends on your LangServe setup |
| **Auth Token** | Your LangServe API key | Only if Auth Type ≠ NONE |

### Example 1: LangServe with API Key Auth

**For:** LangServe with LangSmith API key authentication

```
Connection Type: LangChain
Endpoint: https://langserve-demo.example.com/research-agent/invoke
Auth Type: API_KEY
Auth Token: lsv2_pt_abc123xyz_def456...
```

**Expected Request:**
```bash
curl -X POST https://langserve-demo.example.com/research-agent/invoke \
  -H "x-api-key: lsv2_pt_abc123xyz_def456..." \
  -H "Content-Type: application/json" \
  -d '{"input": "Your question", "session_id": "uuid"}'
```

### Example 2: LangServe with Bearer Token

**For:** LangServe with JWT token authentication

```
Connection Type: LangChain
Endpoint: https://my-langserve.com/customer-support-agent
Auth Type: BEARER
Auth Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Request:**
```bash
curl -X POST https://my-langserve.com/customer-support-agent \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"input": "Your question", "session_id": "uuid"}'
```

### Example 3: LangServe with No Auth (Dev/Local)

**For:** Local or public LangServe endpoints

```
Connection Type: LangChain
Endpoint: http://localhost:8000/my-chain
Auth Type: NONE
Auth Token: [leave blank]
```

**Expected Request:**
```bash
curl -X POST http://localhost:8000/my-chain \
  -H "Content-Type: application/json" \
  -d '{"input": "Your question", "session_id": "uuid"}'
```

### Finding Your LangServe Endpoint

1. Start LangServe: `poetry run langchain serve`
2. Look for output: `LangServe is running at http://localhost:8000/`
3. Available chains listed at: `http://localhost:8000/docs`
4. Your endpoint: `http://localhost:8000/{chain_name}`

### Verification

1. Test with curl first:
```bash
curl -X POST https://your-langserve.com/your_chain \
  -H "Content-Type: application/json" \
  -d '{"input": "test", "session_id": "test-123"}'
```

2. Click **"Ping"** in BreakLoop
3. Expected: ✅ Green "✓ OK"

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Cannot reach agent" | Wrong endpoint | Verify with curl, check URL |
| "401 Unauthorized" | Bad API key | Regenerate key in LangSmith |
| "Timeout" | LangServe slow | Check server health, increase timeout |
| "Invalid response format" | Endpoint wrong | Use `/invoke` path, not `/batch` |

---

## 5. WebSocket

### Use Case
Streaming agents, real-time communication, long-running tasks

### Prerequisites

1. Agent server supports WebSocket connections
2. Endpoint: `wss://your-agent.com/ws` (WebSocket Secure)
3. Authentication method defined (query param, header, etc.)

### Onboarding Wizard - Step 2: Connection

```
┌─────────────────────────────────────────┐
│ STEP 2: CONNECTION CONFIGURATION       │
├─────────────────────────────────────────┤
│                                         │
│ Connection Type: WebSocket ▼            │
│                                         │
│ Endpoint:                              │
│ [wss://your-agent.com/ws]              │
│                                         │
│ Auth Type: BEARER ▼                     │
│                                         │
│ Auth Token:                            │
│ [your-token-here]                      │
│                                         │
│ ← Back              Next → │
└─────────────────────────────────────────┘
```

### Field Definitions

| Field | Value | Notes |
|-------|-------|-------|
| **Connection Type** | `WebSocket` | Select from dropdown |
| **Endpoint** | Full WebSocket URL | Must start with `ws://` or `wss://` |
| **Auth Type** | BEARER, API_KEY, or NONE | Your auth method |
| **Auth Token** | Your credential | Token passed to WebSocket handshake |

### Example 1: WebSocket with Bearer Token

**For:** Streaming agents with JWT authentication

```
Connection Type: WebSocket
Endpoint: wss://streaming-agent.example.com/ws
Auth Type: BEARER
Auth Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How it works:**
1. BreakLoop opens WebSocket: `wss://streaming-agent.example.com/ws`
2. Sends auth in handshake: `Authorization: Bearer eyJ...`
3. Sends input: `{"input": "Your question", "session_id": "uuid"}`
4. Receives streamed output: `{"token": "Hello"}`, `{"token": "!"}`, etc.
5. Accumulates tokens until `{"done": true}`

### Example 2: WebSocket with API Key (Query Param)

**For:** Simple API key in query string

```
Connection Type: WebSocket
Endpoint: wss://agent.example.com/ws?key=sk-abc123
Auth Type: API_KEY
Auth Token: sk-abc123
```

**How it works:**
1. Full URL: `wss://agent.example.com/ws?key=sk-abc123`
2. BreakLoop appends token to endpoint
3. Receives streaming response

### Example 3: WebSocket No Auth (Local)

**For:** Local development

```
Connection Type: WebSocket
Endpoint: ws://localhost:9000/agent
Auth Type: NONE
Auth Token: [leave blank]
```

**How it works:**
1. Open: `ws://localhost:9000/agent`
2. Send: `{"input": "test", "session_id": "uuid"}`
3. Receive streamed tokens

### Building a WebSocket Agent

**Node.js Example:**
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9000 });

wss.on('connection', (ws, req) => {
  // Check auth
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  ws.on('message', async (msg) => {
    const { input, session_id } = JSON.parse(msg);
    
    // Stream response token by token
    const response = await agent.run(input);
    for (const token of response.split(' ')) {
      ws.send(JSON.stringify({ token }));
    }
    ws.send(JSON.stringify({ done: true }));
  });
});
```

### Verification

1. Test with wscat:
```bash
wscat -c "wss://your-agent.com/ws" --header "Authorization: Bearer token"
```

2. Click **"Ping"** in BreakLoop
3. Expected: ✅ Green "✓ OK"

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Cannot connect" | Server offline | Check server is running, endpoint correct |
| "Unauthorized" | Bad token | Verify token format, expiry |
| "Connection closed" | Server closed early | Check server logs, handle gracefully |
| "Timeout" | No response | Increase timeout, check agent is responding |

---

## 6. Mock / Sandbox

### Use Case
Testing without external dependencies, sandbox simulation, development

### Prerequisites

- None! Mock agent is built-in
- Requires: `ANTHROPIC_API_KEY` (uses Claude Haiku internally)

### Onboarding Wizard - Step 2: Connection

```
┌─────────────────────────────────────────┐
│ STEP 2: CONNECTION CONFIGURATION       │
├─────────────────────────────────────────┤
│                                         │
│ Connection Type: Mock ▼                 │
│                                         │
│ Endpoint: [HIDDEN - not needed]        │
│                                         │
│ Auth Type: NONE ▼ (disabled)            │
│                                         │
│ Auth Token: [HIDDEN - not needed]      │
│                                         │
│ ✓ Sandbox mode enabled                 │
│                                         │
│ ← Back              Next → │
└─────────────────────────────────────────┘
```

### Field Definitions

| Field | Value | Notes |
|-------|-------|-------|
| **Connection Type** | `Mock` | Select from dropdown |
| **Endpoint** | [Disabled] | Not used for Mock |
| **Auth Type** | [Disabled] | Not used for Mock |
| **Auth Token** | [Disabled] | Not used for Mock |

### Example: Using Mock Agent

```
Connection Type: Mock
Endpoint: [blank]
Auth Type: [not applicable]
Auth Token: [blank]
Agent Type: CONVERSATIONAL (or any)
```

**What happens:**
1. BreakLoop intercepts requests
2. Calls Claude Haiku internally
3. System prompt: "Simulate a {AGENT_TYPE} agent..."
4. Returns simulated response
5. All done locally, no external API

### Mock Agent Behavior by Type

| Agent Type | Simulates |
|---|---|
| **CONVERSATIONAL** | A helpful ChatBot responding to conversation |
| **TOOL_USING** | An agent that calls functions with realistic tool calls |
| **AUTONOMOUS** | A planning agent that shows multi-step reasoning |
| **MULTI_AGENT** | Multiple agents coordinating |
| **RAG_PIPELINE** | A retrieval + generation pipeline |
| **CUSTOM** | A conversational agent (default fallback) |

### Cost

**Extremely low!** Uses Claude Haiku:
- ~$0.000001-0.00001 per test run
- 1000 runs ≈ $0.01

### Verification

1. Click **"Ping"** → Always ✅ OK (no external call)
2. Create test suite
3. Run tests → Responses generated locally

### When to Use Mock

✅ **Good for:**
- Early testing before agent ready
- UI/UX testing
- Quick feedback loop
- Understanding test structure
- Building test suites

❌ **Not good for:**
- Final validation (use real agent)
- Load testing (limited by local rate)
- Specific model behavior testing

### Example Test Case

```yaml
Input: "Summarize this article about AI"
Expected: A summary of article
Pass Criteria: 2-3 paragraphs, mentions key points
Result: Mock agent generates plausible summary locally
Cost: ~$0.000001
```

---

## Troubleshooting

### General Connection Issues

| Symptom | Diagnosis | Solution |
|---------|-----------|----------|
| Red "✗ Fail" on ping | Connection failed | Check endpoint, auth, network |
| Timeout (30s) | No response received | Check agent is running, increase timeout |
| "Unauthorized" error | Auth failed | Verify credentials, format, expiry |
| "Invalid response" | Agent format wrong | Check agent returns JSON with "output" field |

### By Connection Type

#### REST
- **Issue:** "Cannot reach agent"
  - **Check:** `curl http://your-endpoint/api/run`
  - **Fix:** Verify URL, check server is running

#### OpenAI
- **Issue:** "Rate limited"
  - **Check:** Usage at platform.openai.com/account/usage
  - **Fix:** Wait 60 seconds, spread requests over time

#### Claude API
- **Issue:** "Model not found"
  - **Check:** Model name spelling
  - **Fix:** Use `claude-3-5-sonnet`, not `claude-sonnet`

#### LangChain
- **Issue:** "Invalid response format"
  - **Check:** Endpoint returns `{"output": "..."}` or similar
  - **Fix:** Use `/invoke` endpoint, not `/batch`

#### WebSocket
- **Issue:** "Connection closed immediately"
  - **Check:** Server logs
  - **Fix:** Verify auth, check server error

#### Mock
- **Issue:** "ANTHROPIC_API_KEY not set"
  - **Check:** Environment variable `echo $ANTHROPIC_API_KEY`
  - **Fix:** Set in system env: `export ANTHROPIC_API_KEY=sk-ant-...`

---

## Quick Reference

### Copy-Paste Templates

#### REST with Bearer Token
```
Connection Type: REST
Endpoint: https://your-agent.com/api/run
Auth Type: BEARER
Auth Token: [your-token]
```

#### OpenAI (GPT-4o)
```
Connection Type: OpenAI
Endpoint: [blank]
Auth Type: API_KEY
Auth Token: sk-proj-[your-key]
```

#### Claude API (Sonnet)
```
Connection Type: Claude API
Endpoint: [blank]
Auth Type: API_KEY
Auth Token: sk-ant-[your-key]
```

#### LangServe
```
Connection Type: LangChain
Endpoint: https://your-langserve.com/your_chain
Auth Type: API_KEY
Auth Token: lsv2_pt_[your-key]
```

#### WebSocket with Auth
```
Connection Type: WebSocket
Endpoint: wss://your-agent.com/ws
Auth Type: BEARER
Auth Token: [your-token]
```

#### Mock (No Setup)
```
Connection Type: Mock
Endpoint: [blank]
Auth Type: [not used]
Auth Token: [blank]
```

---

## Getting Credentials

### OpenAI API Key
1. [platform.openai.com/api/keys](https://platform.openai.com/api/keys)
2. Click "Create new secret key"
3. Copy: `sk-proj-...`

### Claude API Key
1. [console.anthropic.com/account/keys](https://console.anthropic.com/account/keys)
2. Click "Create key"
3. Copy: `sk-ant-...`

### LangSmith API Key
1. [smith.langchain.com/settings/api_keys](https://smith.langchain.com/settings/api_keys)
2. Click "Create API Key"
3. Copy: `lsv2_pt_...`

### Custom REST/WebSocket Keys
- Contact your agent's administrator
- Request: API key or token for BreakLoop integration

---

## Security Best Practices

✅ **DO:**
- Store credentials in environment variables
- Use HTTPS endpoints (`https://`, `wss://`)
- Rotate API keys regularly
- Use API key restrictions (IP, domain, scopes)
- Never commit keys to git

❌ **DON'T:**
- Share API keys in chat or email
- Use same key for multiple services
- Store keys in `.env` files committed to git
- Use unencrypted HTTP endpoints

---

## Summary Table

| Connection | Endpoint | Auth | Setup Time | Cost |
|---|---|---|---|---|
| **REST** | Required | Custom | 5 min | Free |
| **OpenAI** | None | API Key | 2 min | $0.001-0.01 |
| **Claude** | None | API Key | 2 min | $0.001-0.01 |
| **LangChain** | Required | Optional | 10 min | Varies |
| **WebSocket** | Required | Custom | 10 min | Free |
| **Mock** | None | None | 0 min | Minimal |

Choose based on:
- **Already have agent?** → REST, WebSocket, LangChain
- **Using LLM models?** → OpenAI, Claude API
- **Testing/sandbox?** → Mock
- **Streaming responses?** → WebSocket

---

## Next Steps

1. **Choose connection type** based on your agent
2. **Get credentials** (API key, endpoint, token)
3. **Fill wizard form** using examples above
4. **Click Ping** to verify connection
5. **Create test suite** and run tests

Questions? Check the troubleshooting section above!
