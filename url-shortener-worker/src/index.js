// Using Cloudflare KV for persistent URL mappings
// Bind a KV namespace named `URLS` in wrangler.toml

// Base62 characters for short code generation
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Verify Firebase ID token
 * Returns the decoded token payload if valid, or null if invalid
 */
async function verifyFirebaseToken(token, projectId) {
  if (!token) return null;
  
  try {
    // Split the JWT token
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Basic validation checks
    const now = Math.floor(Date.now() / 1000);
    
    // Check expiration
    if (!payload.exp || payload.exp < now) {
      return null;
    }
    
    // Check issued at time (not issued in the future)
    if (!payload.iat || payload.iat > now) {
      return null;
    }
    
    // Check audience (should match Firebase project ID)
    if (payload.aud !== projectId) {
      return null;
    }
    
    // Check issuer
    const expectedIssuer = `https://securetoken.google.com/${projectId}`;
    if (payload.iss !== expectedIssuer) {
      return null;
    }
    
    // Check auth_time
    if (!payload.auth_time || payload.auth_time > now) {
      return null;
    }
    
    // Check subject (user ID) exists
    if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length === 0) {
      return null;
    }
    
    // Token is valid
    return payload;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
}

/**
 * Middleware to verify authentication
 * Returns the user payload if authenticated, or a 401 Response if not
 */
async function requireAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return addCORSHeaders(new Response(JSON.stringify({ error: 'Unauthorized: Missing token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }), request, env);
  }
  
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const projectId = env.FIREBASE_PROJECT_ID || 'krizpay-1d84a'; // Default to your project
  const payload = await verifyFirebaseToken(token, projectId);
  
  if (!payload) {
    return addCORSHeaders(new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }), request, env);
  }
  
  return payload; // Return user data
}

async function kvGet(env, key) {
  if (!env || !env.URLS) {
    throw new Error('KV binding URLS is not configured');
  }
  return await env.URLS.get(key);
}

async function kvPut(env, key, value) {
  if (!env || !env.URLS) {
    throw new Error('KV binding URLS is not configured');
  }
  return await env.URLS.put(key, value);
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
 * Determine the CORS origin to allow based on env.ALLOWED_ORIGINS (comma-separated)
 * If not set, default to '*'.
 */
function resolveCorsOrigin(request, env) {
  const originHdr = request.headers.get('Origin');
  const conf = (env && env.ALLOWED_ORIGINS) ? String(env.ALLOWED_ORIGINS) : '*';
  if (conf === '*' || !originHdr) return '*';
  const list = conf.split(',').map(s => s.trim()).filter(Boolean);
  if (list.includes(originHdr)) return originHdr;
  // If not matched, be conservative and return 'null' to disallow credentialed requests
  return 'null';
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request, env) {
  const allowOrigin = resolveCorsOrigin(request, env);
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    },
  });
}

/**
 * Add CORS headers to response
 */
function addCORSHeaders(response, request, env) {
  const allowOrigin = resolveCorsOrigin(request, env);
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Vary', 'Origin');
  return response;
}

// ---------------- Encryption helpers (AES-GCM, base64url) ----------------
function b64urlEncode(arr) {
  let str = btoa(String.fromCharCode(...arr));
  return str.replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
}
function b64urlDecodeToBytes(s) {
  s = s.replace(/-/g,'+').replace(/_/g,'/');
  const pad = s.length % 4; if (pad) s += '='.repeat(4 - pad);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function importAesKeyFromEnv(env) {
  const keyB64 = env && env.ENCRYPTION_KEY ? String(env.ENCRYPTION_KEY).trim() : '';
  if (!keyB64) throw new Error('Encryption key not configured');
  let raw;
  try {
    raw = b64urlDecodeToBytes(keyB64);
  } catch {
    // try standard base64 as well
    try { raw = Uint8Array.from(atob(keyB64), c => c.charCodeAt(0)); } catch { /* ignore */ }
  }
  if (!raw || (raw.length !== 16 && raw.length !== 24 && raw.length !== 32)) {
    throw new Error('ENCRYPTION_KEY must be base64/base64url of 16/24/32 bytes');
  }
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt','decrypt']);
}

async function encryptUrl(env, urlStr) {
  if (!isValidUrl(urlStr)) throw new Error('Invalid URL');
  const key = await importAesKeyFromEnv(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(urlStr);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, enc));
  const combined = new Uint8Array(iv.length + ct.length);
  combined.set(iv, 0); combined.set(ct, iv.length);
  return b64urlEncode(combined);
}

async function decryptCode(env, code) {
  if (!code) throw new Error('Code required');
  const key = await importAesKeyFromEnv(env);
  const combined = b64urlDecodeToBytes(code);
  if (combined.length < 13) throw new Error('Malformed code');
  const iv = combined.slice(0,12);
  const ct = combined.slice(12);
  const pt = new Uint8Array(await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, ct));
  return new TextDecoder().decode(pt);
}

/**
 * Handle POST /shorten - Create a short URL (Protected)
 */
async function handleShortenRequest(request, env) {
  // Require authentication
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult; // Return 401 error
  }
  const userPayload = authResult; // Decoded token payload
  
  // 1) Parse body with robust fallback
  let body = null;
  const req1 = request.clone();
  try {
    body = await req1.json();
  } catch {
    try {
      const req2 = request.clone();
      const raw = await req2.text();
      body = raw ? JSON.parse(raw) : null;
    } catch {
      body = null;
    }
  }

  // Fallback: also accept url from query string if body missing
  let originalUrl = body && body.url ? String(body.url).trim() : '';
  if (!originalUrl) {
    try {
      const u = new URL(request.url);
      originalUrl = (u.searchParams.get('url') || '').trim();
    } catch {
      // ignore
    }
  }

  if (!originalUrl) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'URL is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    ), request, env);
  }

  if (!isValidUrl(originalUrl)) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'Invalid URL format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    ), request, env);
  }

  // 2) Main logic with explicit error reporting
  try {
    let shortCode;
    let attempts = 0;
    do {
      shortCode = generateShortCode();
      attempts++;
    } while ((await kvGet(env, shortCode)) && attempts < 10);

    if (attempts >= 10) {
      return addCORSHeaders(new Response(
        JSON.stringify({ error: 'Failed to generate unique code' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ), request, env);
    }

    const record = { 
      url: originalUrl, 
      createdAt: new Date().toISOString(), 
      clicks: 0,
      userId: userPayload.sub, // Store user ID
      userEmail: userPayload.email || null
    };
    await kvPut(env, shortCode, JSON.stringify(record));

    const shortUrl = `${new URL(request.url).origin}/${shortCode}`;
    return addCORSHeaders(new Response(
      JSON.stringify({ shortUrl, shortCode, originalUrl }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ), request, env);
  } catch (err) {
    // Temporary: surface internal error details to help diagnose prod
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'internal', detail: String(err && err.message || err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ), request, env);
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
      return handleCORS(request, env);
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

    // Route: POST /encrypt - Stateless encryption; returns code and e-link (Protected)
    if (method === 'POST' && pathname === '/encrypt') {
      // Require authentication
      const authResult = await requireAuth(request, env);
      if (authResult instanceof Response) {
        return authResult; // Return 401 error
      }
      
      try {
        let longUrl = '';
        try { const raw = await request.text(); longUrl = raw ? (JSON.parse(raw).url || '') : ''; } catch {}
        if (!longUrl) { const u = new URL(request.url); longUrl = u.searchParams.get('url') || ''; }
        const code = await encryptUrl(env, String(longUrl).trim());
        const encryptedUrl = `${new URL(request.url).origin}/e/${code}`;
        return addCORSHeaders(new Response(JSON.stringify({ code, encryptedUrl }), { status: 200, headers: { 'Content-Type': 'application/json' } }), request, env);
      } catch (e) {
        const msg = e && e.message ? e.message : String(e);
        const status = msg.includes('key') ? 500 : 400;
        return addCORSHeaders(new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json' } }), request, env);
      }
    }

    // Route: GET /e/:code - decrypt and redirect
    if (method === 'GET' && pathname.startsWith('/e/')) {
      const code = pathname.substring(3);
      try {
        const originalUrl = await decryptCode(env, code);
        return Response.redirect(originalUrl, 302);
      } catch (e) {
        return addCORSHeaders(new Response(JSON.stringify({ error: 'Invalid or expired link' }), { status: 400, headers: { 'Content-Type': 'application/json' } }), request, env);
      }
    }

    // Route: GET /decrypt/:code - returns original URL
    if (method === 'GET' && pathname.startsWith('/decrypt/')) {
      const code = pathname.substring('/decrypt/'.length);
      try {
        const originalUrl = await decryptCode(env, code);
        return addCORSHeaders(new Response(JSON.stringify({ url: originalUrl }), { status: 200, headers: { 'Content-Type': 'application/json' } }), request, env);
      } catch (e) {
        return addCORSHeaders(new Response(JSON.stringify({ error: 'Invalid code' }), { status: 400, headers: { 'Content-Type': 'application/json' } }), request, env);
      }
    }

    // Route: POST /decrypt - accepts { code } or { encryptedUrl }
    if (method === 'POST' && pathname === '/decrypt') {
      try {
        let code = '';
        try {
          const raw = await request.text();
          const body = raw ? JSON.parse(raw) : {};
          code = body.code || '';
          if (!code && body.encryptedUrl) {
            const p = new URL(body.encryptedUrl).pathname;
            code = p.startsWith('/e/') ? p.substring(3) : p.replace(/^\/+/, '');
          }
        } catch {}
        if (!code) { const u = new URL(request.url); code = u.searchParams.get('code') || ''; }
        const originalUrl = await decryptCode(env, code);
        return addCORSHeaders(new Response(JSON.stringify({ url: originalUrl }), { status: 200, headers: { 'Content-Type': 'application/json' } }), request, env);
      } catch (e) {
        return addCORSHeaders(new Response(JSON.stringify({ error: 'Invalid code' }), { status: 400, headers: { 'Content-Type': 'application/json' } }), request, env);
      }
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

    // Diagnostics: GET /healthz - check bindings (avoid 6-char path to not collide with short codes)
    if (method === 'GET' && pathname === '/healthz') {
      if (env && env.HEALTHZ_TOKEN) {
        const q = new URL(request.url).searchParams.get('t');
        if (q !== env.HEALTHZ_TOKEN) {
          return new Response('Forbidden', { status: 403 });
        }
      }
      const info = {
        hasKV: !!(env && env.URLS),
        bindings: env ? Object.keys(env) : [],
      };
      return addCORSHeaders(new Response(JSON.stringify(info), { status: 200, headers: { 'Content-Type': 'application/json' } }), request, env);
    }

    // Default 404 response
    return addCORSHeaders(new Response(
      JSON.stringify({ error: 'Not found' }), 
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' }
      }
    ), request, env);
  },
};
