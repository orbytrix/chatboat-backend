# OpenRouter API Setup Guide

Quick setup guide for integrating OpenRouter AI into the Chatbot Backend API.

## Step 1: Get Your API Key

1. Visit https://openrouter.ai
2. Click "Sign In" or "Sign Up"
3. Navigate to https://openrouter.ai/keys
4. Click "Create Key"
5. Copy your API key

## Step 2: Add Credits

OpenRouter uses a pay-as-you-go model:

1. Go to https://openrouter.ai/credits
2. Click "Add Credits"
3. Add at least $5 to start (recommended: $10-20)
4. Credits never expire

## Step 3: Configure Environment Variables

Create or update your `.env` file:

```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=Chatbot Backend API
```

Replace `sk-or-v1-xxxxxxxxxxxxxxxxxxxxx` with your actual API key.

## Step 4: Choose Your AI Model

Edit `src/config/openrouter.js` to select your preferred model:

```javascript
const openRouterConfig = {
  // ... other config
  model: 'openai/gpt-4o-mini', // Change this to your preferred model
};
```

### Recommended Models

**For Development/Testing:**
- `openai/gpt-4o-mini` - Fast, affordable, good quality
- `meta-llama/llama-3.1-8b-instruct:free` - Free tier available

**For Production:**
- `openai/gpt-4o` - Best OpenAI model
- `anthropic/claude-3.5-sonnet` - Best Claude model
- `google/gemini-pro-1.5` - Google's latest

See all models at: https://openrouter.ai/models

## Step 5: Test the Connection

Start your server and test the API:

```bash
npm start
```

Or test directly:

```javascript
const openrouterService = require('./src/services/openrouterService');

openrouterService.testConnection()
  .then(() => console.log('✓ OpenRouter connected successfully'))
  .catch(err => console.error('✗ Connection failed:', err.message));
```

## Step 6: Monitor Usage

Track your API usage and costs:

1. Visit https://openrouter.ai/activity
2. View requests, tokens used, and costs
3. Set up usage alerts if needed

## Troubleshooting

### Error: "Invalid API key"
- Check that your API key is correct in `.env`
- Ensure the key starts with `sk-or-v1-`
- Verify the key is active at https://openrouter.ai/keys

### Error: "Insufficient credits"
- Add more credits at https://openrouter.ai/credits
- Check your current balance

### Error: "Model not found"
- Verify the model name is correct
- Check available models at https://openrouter.ai/models
- Some models require special access

### Error: "Rate limit exceeded"
- OpenRouter has rate limits per model
- Consider upgrading your plan
- Implement request queuing in your app

## Cost Optimization Tips

1. **Use cheaper models for simple tasks**
   - GPT-4o-mini for most conversations
   - GPT-4o only for complex reasoning

2. **Limit max_tokens**
   - Set appropriate `maxTokens` in config
   - Shorter responses = lower costs

3. **Cache responses**
   - Implement response caching for common queries
   - Reduce duplicate API calls

4. **Monitor usage**
   - Set up alerts for high usage
   - Review activity logs regularly

## Security Best Practices

1. **Never commit API keys**
   - Keep `.env` in `.gitignore`
   - Use environment variables in production

2. **Rotate keys regularly**
   - Create new keys periodically
   - Delete old/unused keys

3. **Set spending limits**
   - Configure budget alerts
   - Monitor unexpected usage spikes

4. **Use HTTPS only**
   - Always use secure connections
   - Verify SSL certificates

## Next Steps

- Read the full migration guide: `docs/OPENROUTER_MIGRATION.md`
- Explore OpenRouter documentation: https://openrouter.ai/docs
- Join the community: https://discord.gg/openrouter
- Check API status: https://status.openrouter.ai

## Support

If you encounter issues:

1. Check OpenRouter status: https://status.openrouter.ai
2. Review documentation: https://openrouter.ai/docs
3. Ask in Discord: https://discord.gg/openrouter
4. Contact support: support@openrouter.ai
