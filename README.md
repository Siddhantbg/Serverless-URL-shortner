# Serverless URL Shortener

A full-stack serverless application built on Cloudflare Workers with two core services: URL Shortening and Encrypted Link generation. Features Firebase Authentication, AES-256-GCM encryption, and global edge deployment.

## Architecture

![Serverless URL Shortener Architecture](./assets/architecture-diagram.png)

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

1. **Install dependencies**
   ```sh
   cd url-shortener-frontend
   npm install
   cd ../url-shortener-worker
   npm install
   ```

2. **Run the frontend locally**
   ```sh
   cd url-shortener-frontend
   npm run dev
   ```

3. **Test the worker locally**
   ```sh
   cd url-shortener-worker
   npx wrangler dev
   ```

## Deployment

- Deploy the frontend to your preferred static hosting (e.g., Vercel, Netlify)
- Deploy the worker using Cloudflare Wrangler:
  ```sh
  cd url-shortener-worker
  npx wrangler publish
  ```

## License

MIT
