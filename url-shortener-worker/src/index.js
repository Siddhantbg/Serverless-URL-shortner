// In-memory storage for URL mappings (resets on worker restart)
const urlDatabase = {};

// Base62 characters for short code generation
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

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
async function handleShortenRequest(request) {
  try {
    const body = await request.json();
    
    if (!body || !body.url) {
      return addCORSHeaders(new Response(
        JSON.stringify({ error: 'URL is required' }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }

    const originalUrl = body.url.trim();
    
    if (!isValidUrl(originalUrl)) {
      return addCORSHeaders(new Response(
        JSON.stringify({ error: 'Invalid URL format' }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }

    // Generate unique short code
    let shortCode;
    let attempts = 0;
    do {
      shortCode = generateShortCode();
      attempts++;
    } while (urlDatabase[shortCode] && attempts < 10);

    if (attempts >= 10) {
      return addCORSHeaders(new Response(
        JSON.stringify({ error: 'Failed to generate unique code' }), 
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }

    // Store the mapping
    urlDatabase[shortCode] = {
      url: originalUrl,
      createdAt: new Date().toISOString(),
      clicks: 0
    };

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
function handleRedirectRequest(shortCode) {
  const urlData = urlDatabase[shortCode];
  
  if (!urlData) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'Short URL not found' }), 
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' }
      }
    ));
  }

  // Increment click counter
  urlData.clicks++;
  urlData.lastAccessed = new Date().toISOString();

  // Redirect to original URL
  return Response.redirect(urlData.url, 302);
}

/**
 * Handle GET /stats/:code - Get URL statistics (bonus feature)
 */
function handleStatsRequest(shortCode) {
  const urlData = urlDatabase[shortCode];
  
  if (!urlData) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'Short URL not found' }), 
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' }
      }
    ));
  }

  return addCORSHeaders(new Response(
    JSON.stringify({
      shortCode: shortCode,
      originalUrl: urlData.url,
      clicks: urlData.clicks,
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
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return handleCORS();
    }

    // Route: POST /shorten
    if (method === 'POST' && pathname === '/shorten') {
      return handleShortenRequest(request);
    }

    // Route: GET /stats/:code (bonus feature)
    if (method === 'GET' && pathname.startsWith('/stats/')) {
      const shortCode = pathname.substring(7); // Remove '/stats/'
      return handleStatsRequest(shortCode);
    }

    // Route: GET /:code (redirect)
    if (method === 'GET' && pathname.length > 1) {
      const shortCode = pathname.substring(1); // Remove leading '/'
      
      // Basic validation for short code format
      if (/^[0-9A-Za-z]{6}$/.test(shortCode)) {
        return handleRedirectRequest(shortCode);
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

          <p><small>Database contains ${Object.keys(urlDatabase).length} short URLs.</small></p>
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
