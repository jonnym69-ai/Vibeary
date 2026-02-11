# Vibeary Audio Scout - Deployment Guide

## 🚀 Quick Deployment Options

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```
Or deploy via [vercel.com](https://vercel.com) by connecting your GitHub repo.

### 2. Netlify
1. Drag the `dist` folder to [netlify.com](https://netlify.com)
2. Or use Netlify CLI:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### 3. GitHub Pages
1. Push to GitHub
2. In repo settings → Pages, set source to `deploy from branch`
3. Choose `main` branch and `dist` folder

### 4. Surge.sh
```bash
npm i -g surge
cd dist
surge --domain vibeary.surge.sh
```

## ⚠️ Important Notes

### API Key Security
- Your API key is in `.env` file (excluded from git)
- For production, consider:
  - Using environment variables in your hosting platform
  - Creating a backend proxy to hide the key
  - Rate limiting to prevent abuse

### Environment Variables
Add these to your hosting platform:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

## 📦 Build Files
- Built files are in `/dist` folder
- Ready to deploy as static site
- Size: ~220KB total (optimized)

## 🎯 After Deployment
Test your deployed app:
- Search functionality
- Surprise Me feature
- All archetype buttons
- Mobile responsiveness

Your Vibeary Audio Scout is ready for the world! 🎧✨
