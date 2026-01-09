# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React, Vite, Tailwind CSS
- Zustand, Framer Motion, Lucide React
- Express, CORS, dotenv
- Google Generative AI SDK

## Step 2: Configure Environment

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
```

**Get your Gemini API key:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it into your `.env` file

## Step 3: Start the Application

You need **two terminal windows**:

### Terminal 1 - Backend Server
```bash
npm run server
```

You should see:
```
🚀 BrainBits server running on http://localhost:3001
```

### Terminal 2 - Frontend Development Server
```bash
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 4: Open in Browser

Navigate to: **http://localhost:5173**

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### API Key errors
- Verify `.env` file exists in root directory
- Check that `GEMINI_API_KEY` is set correctly
- Ensure backend server is running

### CORS errors
- Make sure backend server is running on port 3001
- Check that Vite proxy is configured (already done in `vite.config.js`)

### Port already in use
- Change `PORT` in `.env` to a different port (e.g., 3002)
- Update Vite proxy in `vite.config.js` if needed

## Production Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Architecture Overview

- **Frontend**: React app served by Vite on port 5173
- **Backend**: Express server on port 3001
- **API Proxy**: Vite proxies `/api/*` to backend
- **State**: Zustand store with localStorage persistence
- **AI**: Google Gemini Pro model via backend API
