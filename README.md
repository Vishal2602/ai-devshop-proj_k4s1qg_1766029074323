# MessageClearance

*"Your message has been cleared for takeoff."*

A message screening tool themed like airport security. Paste any text, run it through scanners, get a boarding pass verdict.

## Features

- **Tone Scanner** - Detects passive-aggressive, rude, or vague language
- **Three Rewrite Options** - Short & direct | Warm & human | Confident & assertive
- **Boarding Pass Verdict** - Visual stamp showing message readiness
- **Missing Info Detector** - Flags gaps readers will notice

## Setup

### 1. Get an API Key

1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Create an account and generate an API key
3. Copy your key

### 2. Local Development

```bash
# Clone the repository
git clone https://github.com/ai-devshop/ai-devshop-proj_k4s1qg_1766029074323.git
cd ai-devshop-proj_k4s1qg_1766029074323

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API key to .env.local
# VITE_OPENROUTER_API_KEY=your-openrouter-api-key-here

# Start development server
npm run dev
```

### 3. Vercel Deployment

When deploying to Vercel, add your API key as an environment variable:

1. Go to your Vercel project settings
2. Navigate to **Settings → Environment Variables**
3. Add: `VITE_OPENROUTER_API_KEY` = `your-openrouter-api-key`

## Tech Stack

- React 19 + Vite
- Lucide React icons
- OpenRouter API (Claude models)

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## License

MIT
