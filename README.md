# Serverless URL Shortener

A simple serverless URL shortener project with a frontend built using Vite + React and a backend worker using Cloudflare Workers.

## Project Structure

- `url-shortener-frontend/` — React frontend for creating and managing short URLs
- `url-shortener-worker/` — Cloudflare Worker backend for handling URL shortening and redirection
- `api-test.html` — HTML file for testing API endpoints

## Features
- Shorten long URLs to easy-to-share short links
- Redirect short URLs to their original destinations
- Simple web interface for users
- Serverless backend for scalability and low cost

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
