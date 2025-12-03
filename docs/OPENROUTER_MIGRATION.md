# Migration from NVIDIA API to OpenRouter API

This document outlines the changes made to migrate from NVIDIA API to OpenRouter API for AI-powered chat functionality.

## Why OpenRouter?

OpenRouter provides:
- Access to multiple AI models (GPT-4, Claude, Llama, etc.) through a single API
- Competitive pricing with pay-as-you-go model
- No vendor lock-in - easy to switch between models
- Better availability and reliability
- Simpler authentication and setup

## Changes Made

### 1. Configuration Files

**Old:** `src/config/nvidia.js`
**New:** `src/config/openrouter.js`

New environment variables required:
```env
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=Chatbot Backend API
```

### 2. Service Files

**Old:** `src/services/nvidiaService.js`
**New:** `src/services/openrouterService.js`

Key changes:
- Updated API endpoint to OpenRouter
- Added `HTTP-Referer` and `X-Title` headers (required by OpenRouter)
- Changed default model to `openai/gpt-4o-mini` (cost-effective option)
- Updated error messages and logging

### 3. Chat Service

**File:** `src/services/chatService.js`

Changed import:
```javascript
// Old
const nvidiaService = require('./nvidiaService');

// New
const openrouterService = require('./openrouterService');
```

### 4. Documentation Updates

- Updated Swagger documentation
- Updated README.md
- Updated requirements.md
- Updated tasks.md
- Updated route documentation

## Getting Your OpenRouter API Key

1. Visit https://openrouter.ai
2. Sign up for an account
3. Go to https://openrouter.ai/keys
4. Create a new API key
5. Add credits to your account (pay-as-you-go)
6. Copy the API key to your `.env` file

## Available Models

OpenRouter supports many models. Some popular options:

### Cost-Effective Options
- `openai/gpt-4o-mini` - Fast and affordable (default)
- `anthropic/claude-3-haiku` - Fast Claude model
- `meta-llama/llama-3.1-8b-instruct` - Open source option

### High-Quality Options
- `openai/gpt-4o` - Latest GPT-4 model
- `anthropic/claude-3.5-sonnet` - Best Claude model
- `google/gemini-pro-1.5` - Google's latest

### Free Options (with limits)
- `meta-llama/llama-3.1-8b-instruct:free`
- `google/gemini-flash-1.5:free`

To change the model, update the `model` field in `src/config/openrouter.js`.

## API Compatibility

OpenRouter uses the OpenAI-compatible API format, so the request/response structure remains the same:

```javascript
{
  model: "openai/gpt-4o-mini",
  messages: [
    { role: "system", content: "..." },
    { role: "user", content: "..." }
  ],
  temperature: 0.7,
  max_tokens: 1024
}
```

## Testing the Integration

After setting up your API key, you can test the connection:

```javascript
const openrouterService = require('./src/services/openrouterService');

openrouterService.testConnection()
  .then(success => console.log('Connection test:', success))
  .catch(error => console.error('Connection failed:', error));
```

## Cost Considerations

OpenRouter charges per token used. Approximate costs:
- GPT-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- GPT-4o: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- Claude 3.5 Sonnet: ~$3 per 1M input tokens, ~$15 per 1M output tokens

Monitor your usage at: https://openrouter.ai/activity

## Rollback Plan

If you need to rollback to NVIDIA API:

1. Keep the old `src/config/nvidia.js` and `src/services/nvidiaService.js` files
2. Update `src/services/chatService.js` to import `nvidiaService` instead
3. Restore NVIDIA environment variables
4. Restart the server

## Support

- OpenRouter Documentation: https://openrouter.ai/docs
- OpenRouter Discord: https://discord.gg/openrouter
- API Status: https://status.openrouter.ai
