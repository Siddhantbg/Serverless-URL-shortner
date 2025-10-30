// Using Cloudflare KV for persistent URL mappings
// Bind a KV namespace named `URLS` in wrangler.toml

// Base62 characters for short code generation
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// Local fallback store for dev if KV binding isn't available
const localDB = new Map();

async function kvGet(env, key) {
  if (env && env.URLS) {
    return await env.URLS.get(key);
  }
  const val = localDB.get(key);
  return val ? JSON.stringify(val) : null;
}

async function kvPut(env, key, value) {
  if (env && env.URLS) {
    return await env.URLS.put(key, value);
  }
  try {
    localDB.set(key, JSON.parse(value));
  } catch {
    // ignore parse errors in fallback
  }
}

/**
 * Generate a random 6-character Base62 string
 */
function generateShortCode() {
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += BASE62_CHARS.charAt(Math.floor(Math.random() * BASE62_CHARS.length));
  }
  return result;
}

/**
 * Validate if a URL is properly formatted
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Add CORS headers to response
 */
function addCORSHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

/**
 * Handle POST /shorten - Create a short URL
 */
async function handleShortenRequest(request, env) {
  try {
    // Parse body robustly: read raw text once, then JSON.parse
    const raw = await request.text();
    console.log('Raw body received:', raw);
    let body = null;
    if (raw && raw.length) {
      try {
        body = JSON.parse(raw);
        console.log('Parsed body:', body);
      } catch (e) {
        console.error('JSON parse error:', e.message);
        body = null;
      }
    }
    
    if (!body || !body.url) {
      console.log('Body validation failed. body:', body);
      return addCORSHeaders(new Response(
        JSON.stringify({ error: 'URL is required' }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }

    const originalUrl = body.url.trim();
    console.log('Original URL after trim:', originalUrl);
    
    if (!isValidUrl(originalUrl)) {
      console.log('URL validation failed for:', originalUrl);
      return addCORSHeaders(new Response(
        JSON.stringify({ error: 'Invalid URL format' }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }
    
    console.log('URL validation passed, generating short code...');

    // Generate unique short code (ensure uniqueness in KV)
    let shortCode;
    let attempts = 0;
    do {
      shortCode = generateShortCode();
      attempts++;
    } while ((await kvGet(env, shortCode)) && attempts < 10);

    if (attempts >= 10) {
      console.error('Failed to generate unique code after 10 attempts');
      return addCORSHeaders(new Response(
        JSON.stringify({ error: 'Failed to generate unique code' }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }

    console.log('Generated short code:', shortCode);

    // Store the mapping in KV
    const record = {
      url: originalUrl,
      createdAt: new Date().toISOString(),
      clicks: 0
    };
  await kvPut(env, shortCode, JSON.stringify(record));
    console.log('Stored in KV successfully');

    // Create the short URL
  const shortUrl = `${new URL(request.url).origin}/${shortCode}`;

    return addCORSHeaders(new Response(
      JSON.stringify({ 
        shortUrl: shortUrl,
        shortCode: shortCode,
        originalUrl: originalUrl
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }
    ));

  } catch (error) {
    // Surface a clearer parsing error while keeping CORS headers
    console.error('Caught error in handleShortenRequest:', error.message, error.stack);
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'Invalid JSON body' }), 
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      }
    ));
  }
}

/**
 * Handle GET /:code - Redirect to original URL
 */
async function handleRedirectRequest(shortCode, env) {
  const raw = await kvGet(env, shortCode);
  if (!raw) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'Short URL not found' }), 
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' }
      }
    ));
  }

  const urlData = JSON.parse(raw);
  // Increment click counter and update last access
  urlData.clicks = (urlData.clicks || 0) + 1;
  urlData.lastAccessed = new Date().toISOString();
  await kvPut(env, shortCode, JSON.stringify(urlData));

  // Redirect to original URL
  return Response.redirect(urlData.url, 302);
}

/**
 * Handle GET /stats/:code - Get URL statistics (bonus feature)
 */
async function handleStatsRequest(shortCode, env) {
  const raw = await kvGet(env, shortCode);
  if (!raw) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'Short URL not found' }), 
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' }
      }
    ));
  }

  const urlData = JSON.parse(raw);
  return addCORSHeaders(new Response(
    JSON.stringify({
      shortCode: shortCode,
      originalUrl: urlData.url,
      clicks: urlData.clicks || 0,
      createdAt: urlData.createdAt,
      lastAccessed: urlData.lastAccessed || null
    }), 
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    }
  ));
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      console.log('Env bindings available:', Object.keys(env || {}));
    } catch (e) {
      // ignore logging errors
    }
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return handleCORS();
    }

    // Route: POST /shorten
    if (method === 'POST' && pathname === '/shorten') {
      return handleShortenRequest(request, env);
    }

    // Route: GET /stats/:code (bonus feature)
    if (method === 'GET' && pathname.startsWith('/stats/')) {
      const shortCode = pathname.substring(7); // Remove '/stats/'
      return handleStatsRequest(shortCode, env);
    }

    // Route: GET /:code (redirect)
    if (method === 'GET' && pathname.length > 1) {
      const shortCode = pathname.substring(1); // Remove leading '/'
      
      // Basic validation for short code format
      if (/^[0-9A-Za-z]{6}$/.test(shortCode)) {
        return handleRedirectRequest(shortCode, env);
      }
    }

    // Route: GET / (root) - Show API documentation
    if (method === 'GET' && pathname === '/') {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>URL Shortener API</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .endpoint { margin: 20px 0; padding: 15px; border-left: 4px solid #007acc; background: #f8f9fa; }
          </style>
        </head>
        <body>
          <h1>🔗 URL Shortener API</h1>
          <p>A simple URL shortener service built with Cloudflare Workers.</p>
          
          <div class="endpoint">
            <h3>POST /shorten</h3>
            <p>Create a short URL from a long URL.</p>
            <pre>
curl -X POST ${url.origin}/shorten \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/very/long/url"}'
            </pre>
            <p><strong>Response:</strong></p>
            <pre>{"shortUrl": "${url.origin}/abc123", "shortCode": "abc123", "originalUrl": "https://example.com/very/long/url"}</pre>
          </div>

          <div class="endpoint">
            <h3>GET /:code</h3>
            <p>Redirect to the original URL using the short code.</p>
            <pre>curl -L ${url.origin}/abc123</pre>
            <p>Returns a 302 redirect to the original URL.</p>
          </div>

          <div class="endpoint">
            <h3>GET /stats/:code</h3>
            <p>Get statistics for a short URL.</p>
            <pre>curl ${url.origin}/stats/abc123</pre>
            <p><strong>Response:</strong></p>
            <pre>{"shortCode": "abc123", "originalUrl": "https://example.com/very/long/url", "clicks": 5, "createdAt": "2024-01-01T12:00:00.000Z"}</pre>
          </div>

          
        </body>
        </html>
      `;
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Default 404 response
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'Not found' }), 
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' }
      }
    ));
  },
};
