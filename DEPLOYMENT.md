# MessageClearance Deployment

## Live URLs

- **Production Site:** https://projk4s1qg1766029074323.vercel.app
- **GitHub Repository:** https://github.com/Vishal2602/ai-devshop-proj_k4s1qg_1766029074323

## API Key Setup Required

AI features require an OpenRouter API key to function.

### For Users

1. Visit https://openrouter.ai/keys
2. Create an account and generate an API key
3. On the site, click the Settings icon and enter your API key
4. Your key is stored locally in your browser (never sent to our servers)

### For Vercel Deployment (Admin)

To set up the API key as an environment variable for pre-configured deployment:

1. Go to [Vercel Dashboard](https://vercel.com/vishal2602s-projects/proj_k4s1qg_1766029074323/settings/environment-variables)
2. Add: `VITE_OPENROUTER_API_KEY` = `your-api-key`
3. Redeploy for changes to take effect

## Tech Stack

- React 19 + Vite 7
- OpenRouter API (Claude 3.5 Sonnet default)
- Deployed on Vercel

## Deployment Date

2025-12-18
