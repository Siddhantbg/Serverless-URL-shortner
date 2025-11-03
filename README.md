# Serverless URL Shortener

A full-stack serverless application built on Cloudflare Workers with two core services: URL Shortening and Encrypted Link generation. Features Firebase Authentication, AES-256-GCM encryption, and global edge deployment.

## Architecture

![Serverless URL Shortener Architecture](./assets/ChatGPT%20Image%20Nov%203,%202025,%2002_39_25%20PM.png)

The system architecture consists of four main layers:
- **Frontend Layer**: React 19 + Vite SPA with Firebase Authentication
- **Edge Computing Layer**: Cloudflare Workers for serverless API endpoints
- **Authentication Layer**: Firebase for user management and token verification
- **Storage Layer**: Cloudflare KV for distributed key-value storage

## Project Structure

- `url-shortener-frontend/` — React frontend for creating and managing short URLs
- `url-shortener-worker/` — Cloudflare Worker backend for handling URL shortening and redirection
- `api-test.html` — HTML file for testing API endpoints

## Features

### URL Shortening Service
- 🔗 Shorten long URLs with custom or auto-generated aliases
- 🚀 Lightning-fast redirects via Cloudflare's global edge network
- 🗑️ Delete short URLs with authentication
- 📊 Track creation timestamps and user ownership

### Encrypted Link Service
- 🔐 AES-256-GCM encryption for sensitive URLs
- 🔑 Password-protected link access
- 🛡️ Client-side and server-side encryption support
- 🔒 Secure key derivation using PBKDF2

### Authentication & Security
- 🔥 Firebase Authentication (Email/Password + Google OAuth)
- 🎫 JWT token verification on edge
- 🔐 Protected endpoints with Bearer token authorization
- 🌐 CORS enabled with secure headers

### Performance & Scalability
- ⚡ Sub-50ms response times globally
- 🌍 Deployed across 150+ Cloudflare edge locations
- 📈 Auto-scaling with zero configuration
- 💰 Pay-per-request serverless pricing

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn
- Cloudflare account (for deploying the worker)

### Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/Siddhantbg/Serverless-URL-shortner.git
   cd Serverless-URL-shortner
   ```

2. **Install dependencies**
   ```sh
   cd url-shortener-frontend
   npm install
   cd ../url-shortener-worker
   npm install
   ```

3. **Configure Firebase Authentication**
   
   a. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   
   b. Enable Authentication methods (Email/Password and Google)
   
   c. Copy your Firebase config from Project Settings → General → Your apps
   
   d. Create `.env.local` in `url-shortener-frontend/` directory:
   ```sh
   cp url-shortener-frontend/.env.example url-shortener-frontend/.env.local
   ```
   
   e. Fill in your Firebase credentials in `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=http://localhost:8787
   ```

4. **Configure Cloudflare Worker**
   
   a. Add Firebase service account credentials to `url-shortener-worker/wrangler.toml`
   
   b. Create KV namespace for URL storage:
   ```sh
   cd url-shortener-worker
   npx wrangler kv:namespace create URL_STORE
   ```
   
   c. Update `wrangler.toml` with the KV namespace ID

5. **Run locally**
   ```sh
   # Terminal 1: Start Cloudflare Worker
   cd url-shortener-worker
   npx wrangler dev

   # Terminal 2: Start React frontend
   cd url-shortener-frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Worker API: `http://localhost:8787`

## Deployment

### Deploy Frontend (Vercel/Netlify/Cloudflare Pages)

**Important:** Set environment variables in your hosting platform:

**Vercel/Netlify:**
1. Go to Project Settings → Environment Variables
2. Add all `VITE_FIREBASE_*` variables from your `.env.local`
3. Set `VITE_API_URL` to your deployed Worker URL
4. Deploy:
   ```sh
   # Vercel
   vercel deploy

   # Netlify
   netlify deploy --prod
   ```

**Cloudflare Pages:**
1. Settings → Environment variables → Add variables
2. Deploy via dashboard or CLI

### Deploy Worker

```sh
cd url-shortener-worker
npx wrangler publish
```

The worker will be deployed to: `https://url-shortener-worker.<your-subdomain>.workers.dev`

Update your frontend's `VITE_API_URL` to point to this URL and redeploy the frontend.

## Troubleshooting

### Firebase Error: auth/invalid-api-key

This error occurs when Firebase environment variables are not set in your deployment environment.

**Solution:**
1. Verify `.env.local` exists locally with correct Firebase credentials
2. Add the same environment variables to your hosting platform (Vercel/Netlify/Cloudflare Pages)
3. Ensure variable names start with `VITE_` prefix (required for Vite)
4. Redeploy after adding environment variables

## License

MIT
