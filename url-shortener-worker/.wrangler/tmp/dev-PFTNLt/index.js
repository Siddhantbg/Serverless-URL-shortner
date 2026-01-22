var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-xzjIZ6/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/index.js
var BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
async function verifyFirebaseToken(token, projectId) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const now = Math.floor(Date.now() / 1e3);
    if (!payload.exp || payload.exp < now) {
      return null;
    }
    if (!payload.iat || payload.iat > now) {
      return null;
    }
    if (payload.aud !== projectId) {
      return null;
    }
    const expectedIssuer = `https://securetoken.google.com/${projectId}`;
    if (payload.iss !== expectedIssuer) {
      return null;
    }
    if (!payload.auth_time || payload.auth_time > now) {
      return null;
    }
    if (!payload.sub || typeof payload.sub !== "string" || payload.sub.length === 0) {
      return null;
    }
    return payload;
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
}
__name(verifyFirebaseToken, "verifyFirebaseToken");
async function requireAuth(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return addCORSHeaders(new Response(JSON.stringify({ error: "Unauthorized: Missing token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    }), request, env);
  }
  const token = authHeader.substring(7);
  const projectId = env.FIREBASE_PROJECT_ID || "krizpay-1d84a";
  const payload = await verifyFirebaseToken(token, projectId);
  if (!payload) {
    return addCORSHeaders(new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    }), request, env);
  }
  return payload;
}
__name(requireAuth, "requireAuth");
async function kvGet(env, key) {
  if (!env || !env.URLS) {
    throw new Error("KV binding URLS is not configured");
  }
  return await env.URLS.get(key);
}
__name(kvGet, "kvGet");
async function kvPut(env, key, value) {
  if (!env || !env.URLS) {
    throw new Error("KV binding URLS is not configured");
  }
  return await env.URLS.put(key, value);
}
__name(kvPut, "kvPut");
function generateShortCode() {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += BASE62_CHARS.charAt(Math.floor(Math.random() * BASE62_CHARS.length));
  }
  return result;
}
__name(generateShortCode, "generateShortCode");
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}
__name(isValidUrl, "isValidUrl");
function resolveCorsOrigin(request, env) {
  const originHdr = request.headers.get("Origin");
  const conf = env && env.ALLOWED_ORIGINS ? String(env.ALLOWED_ORIGINS) : "*";
  if (conf === "*" || !originHdr) return "*";
  const list = conf.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.includes(originHdr)) return originHdr;
  return "null";
}
__name(resolveCorsOrigin, "resolveCorsOrigin");
function handleCORS(request, env) {
  const allowOrigin = resolveCorsOrigin(request, env);
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    }
  });
}
__name(handleCORS, "handleCORS");
function addCORSHeaders(response, request, env) {
  const allowOrigin = resolveCorsOrigin(request, env);
  response.headers.set("Access-Control-Allow-Origin", allowOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Vary", "Origin");
  return response;
}
__name(addCORSHeaders, "addCORSHeaders");
function b64urlEncode(arr) {
  let str = btoa(String.fromCharCode(...arr));
  return str.replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}
__name(b64urlEncode, "b64urlEncode");
function b64urlDecodeToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
__name(b64urlDecodeToBytes, "b64urlDecodeToBytes");
async function importAesKeyFromEnv(env) {
  const keyB64 = env && env.ENCRYPTION_KEY ? String(env.ENCRYPTION_KEY).trim() : "";
  if (!keyB64) throw new Error("Encryption key not configured");
  let raw;
  try {
    raw = b64urlDecodeToBytes(keyB64);
  } catch {
    try {
      raw = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
    } catch {
    }
  }
  if (!raw || raw.length !== 16 && raw.length !== 24 && raw.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be base64/base64url of 16/24/32 bytes");
  }
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
__name(importAesKeyFromEnv, "importAesKeyFromEnv");
async function encryptUrl(env, urlStr) {
  if (!isValidUrl(urlStr)) throw new Error("Invalid URL");
  const key = await importAesKeyFromEnv(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(urlStr);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc));
  const combined = new Uint8Array(iv.length + ct.length);
  combined.set(iv, 0);
  combined.set(ct, iv.length);
  return b64urlEncode(combined);
}
__name(encryptUrl, "encryptUrl");
async function decryptCode(env, code) {
  if (!code) throw new Error("Code required");
  const key = await importAesKeyFromEnv(env);
  const combined = b64urlDecodeToBytes(code);
  if (combined.length < 13) throw new Error("Malformed code");
  const iv = combined.slice(0, 12);
  const ct = combined.slice(12);
  const pt = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct));
  return new TextDecoder().decode(pt);
}
__name(decryptCode, "decryptCode");
async function handleShortenRequest(request, env) {
  const authResult = await requireAuth(request, env);
  if (authResult instanceof Response) {
    return authResult;
  }
  const userPayload = authResult;
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
  let originalUrl = body && body.url ? String(body.url).trim() : "";
  if (!originalUrl) {
    try {
      const u = new URL(request.url);
      originalUrl = (u.searchParams.get("url") || "").trim();
    } catch {
    }
  }
  if (!originalUrl) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "URL is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    ), request, env);
  }
  if (!isValidUrl(originalUrl)) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "Invalid URL format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    ), request, env);
  }
  try {
    let shortCode;
    let attempts = 0;
    do {
      shortCode = generateShortCode();
      attempts++;
    } while (await kvGet(env, shortCode) && attempts < 10);
    if (attempts >= 10) {
      return addCORSHeaders(new Response(
        JSON.stringify({ error: "Failed to generate unique code" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      ), request, env);
    }
    const record = {
      url: originalUrl,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      clicks: 0,
      userId: userPayload.sub,
      // Store user ID
      userEmail: userPayload.email || null
    };
    await kvPut(env, shortCode, JSON.stringify(record));
    const shortUrl = `${new URL(request.url).origin}/${shortCode}`;
    return addCORSHeaders(new Response(
      JSON.stringify({ shortUrl, shortCode, originalUrl }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    ), request, env);
  } catch (err) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "internal", detail: String(err && err.message || err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    ), request, env);
  }
}
__name(handleShortenRequest, "handleShortenRequest");
async function handleRedirectRequest(shortCode, env) {
  const raw = await kvGet(env, shortCode);
  if (!raw) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "Short URL not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    ));
  }
  const urlData = JSON.parse(raw);
  urlData.clicks = (urlData.clicks || 0) + 1;
  urlData.lastAccessed = (/* @__PURE__ */ new Date()).toISOString();
  await kvPut(env, shortCode, JSON.stringify(urlData));
  return Response.redirect(urlData.url, 302);
}
__name(handleRedirectRequest, "handleRedirectRequest");
async function handleStatsRequest(shortCode, env) {
  const raw = await kvGet(env, shortCode);
  if (!raw) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "Short URL not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    ));
  }
  const urlData = JSON.parse(raw);
  return addCORSHeaders(new Response(
    JSON.stringify({
      shortCode,
      originalUrl: urlData.url,
      clicks: urlData.clicks || 0,
      createdAt: urlData.createdAt,
      lastAccessed: urlData.lastAccessed || null
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  ));
}
__name(handleStatsRequest, "handleStatsRequest");
var src_default = {
  async fetch(request, env, ctx) {
    try {
      console.log("Env bindings available:", Object.keys(env || {}));
    } catch (e) {
    }
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;
    if (method === "OPTIONS") {
      return handleCORS(request, env);
    }
    if (method === "POST" && pathname === "/shorten") {
      return handleShortenRequest(request, env);
    }
    if (method === "GET" && pathname.startsWith("/stats/")) {
      const shortCode = pathname.substring(7);
      return handleStatsRequest(shortCode, env);
    }
    if (method === "POST" && pathname === "/encrypt") {
      const authResult = await requireAuth(request, env);
      if (authResult instanceof Response) {
        return authResult;
      }
      try {
        let longUrl = "";
        try {
          const raw = await request.text();
          longUrl = raw ? JSON.parse(raw).url || "" : "";
        } catch {
        }
        if (!longUrl) {
          const u = new URL(request.url);
          longUrl = u.searchParams.get("url") || "";
        }
        const code = await encryptUrl(env, String(longUrl).trim());
        const encryptedUrl = `${new URL(request.url).origin}/e/${code}`;
        return addCORSHeaders(new Response(JSON.stringify({ code, encryptedUrl }), { status: 200, headers: { "Content-Type": "application/json" } }), request, env);
      } catch (e) {
        const msg = e && e.message ? e.message : String(e);
        const status = msg.includes("key") ? 500 : 400;
        return addCORSHeaders(new Response(JSON.stringify({ error: msg }), { status, headers: { "Content-Type": "application/json" } }), request, env);
      }
    }
    if (method === "GET" && pathname.startsWith("/e/")) {
      const code = pathname.substring(3);
      try {
        const originalUrl = await decryptCode(env, code);
        return Response.redirect(originalUrl, 302);
      } catch (e) {
        return addCORSHeaders(new Response(JSON.stringify({ error: "Invalid or expired link" }), { status: 400, headers: { "Content-Type": "application/json" } }), request, env);
      }
    }
    if (method === "GET" && pathname.startsWith("/decrypt/")) {
      const code = pathname.substring("/decrypt/".length);
      try {
        const originalUrl = await decryptCode(env, code);
        return addCORSHeaders(new Response(JSON.stringify({ url: originalUrl }), { status: 200, headers: { "Content-Type": "application/json" } }), request, env);
      } catch (e) {
        return addCORSHeaders(new Response(JSON.stringify({ error: "Invalid code" }), { status: 400, headers: { "Content-Type": "application/json" } }), request, env);
      }
    }
    if (method === "POST" && pathname === "/decrypt") {
      try {
        let code = "";
        try {
          const raw = await request.text();
          const body = raw ? JSON.parse(raw) : {};
          code = body.code || "";
          if (!code && body.encryptedUrl) {
            const p = new URL(body.encryptedUrl).pathname;
            code = p.startsWith("/e/") ? p.substring(3) : p.replace(/^\/+/, "");
          }
        } catch {
        }
        if (!code) {
          const u = new URL(request.url);
          code = u.searchParams.get("code") || "";
        }
        const originalUrl = await decryptCode(env, code);
        return addCORSHeaders(new Response(JSON.stringify({ url: originalUrl }), { status: 200, headers: { "Content-Type": "application/json" } }), request, env);
      } catch (e) {
        return addCORSHeaders(new Response(JSON.stringify({ error: "Invalid code" }), { status: 400, headers: { "Content-Type": "application/json" } }), request, env);
      }
    }
    if (method === "GET" && pathname.length > 1) {
      const shortCode = pathname.substring(1);
      if (/^[0-9A-Za-z]{6}$/.test(shortCode)) {
        return handleRedirectRequest(shortCode, env);
      }
    }
    if (method === "GET" && pathname === "/") {
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
          <h1>\u{1F517} URL Shortener API</h1>
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
        headers: { "Content-Type": "text/html" }
      });
    }
    if (method === "GET" && pathname === "/healthz") {
      if (env && env.HEALTHZ_TOKEN) {
        const q = new URL(request.url).searchParams.get("t");
        if (q !== env.HEALTHZ_TOKEN) {
          return new Response("Forbidden", { status: 403 });
        }
      }
      const info = {
        hasKV: !!(env && env.URLS),
        bindings: env ? Object.keys(env) : []
      };
      return addCORSHeaders(new Response(JSON.stringify(info), { status: 200, headers: { "Content-Type": "application/json" } }), request, env);
    }
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    ), request, env);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-xzjIZ6/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-xzjIZ6/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
