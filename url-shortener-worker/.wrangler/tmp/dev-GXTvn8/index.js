var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-HjHp5G/checked-fetch.js
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

// .wrangler/tmp/bundle-HjHp5G/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/index.js
var urlDatabase = {};
var BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
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
function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}
__name(handleCORS, "handleCORS");
function addCORSHeaders(response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
__name(addCORSHeaders, "addCORSHeaders");
async function handleShortenRequest(request) {
  try {
    const body = await request.json();
    if (!body || !body.url) {
      return addCORSHeaders(new Response(
        JSON.stringify({ error: "URL is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      ));
    }
    const originalUrl = body.url.trim();
    if (!isValidUrl(originalUrl)) {
      return addCORSHeaders(new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      ));
    }
    let shortCode;
    let attempts = 0;
    do {
      shortCode = generateShortCode();
      attempts++;
    } while (urlDatabase[shortCode] && attempts < 10);
    if (attempts >= 10) {
      return addCORSHeaders(new Response(
        JSON.stringify({ error: "Failed to generate unique code" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      ));
    }
    urlDatabase[shortCode] = {
      url: originalUrl,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      clicks: 0
    };
    const shortUrl = `${new URL(request.url).origin}/${shortCode}`;
    return addCORSHeaders(new Response(
      JSON.stringify({
        shortUrl,
        shortCode,
        originalUrl
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    ));
  } catch (error) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    ));
  }
}
__name(handleShortenRequest, "handleShortenRequest");
function handleRedirectRequest(shortCode) {
  const urlData = urlDatabase[shortCode];
  if (!urlData) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "Short URL not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    ));
  }
  urlData.clicks++;
  urlData.lastAccessed = (/* @__PURE__ */ new Date()).toISOString();
  return Response.redirect(urlData.url, 302);
}
__name(handleRedirectRequest, "handleRedirectRequest");
function handleStatsRequest(shortCode) {
  const urlData = urlDatabase[shortCode];
  if (!urlData) {
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "Short URL not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    ));
  }
  return addCORSHeaders(new Response(
    JSON.stringify({
      shortCode,
      originalUrl: urlData.url,
      clicks: urlData.clicks,
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
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;
    if (method === "OPTIONS") {
      return handleCORS();
    }
    if (method === "POST" && pathname === "/shorten") {
      return handleShortenRequest(request);
    }
    if (method === "GET" && pathname.startsWith("/stats/")) {
      const shortCode = pathname.substring(7);
      return handleStatsRequest(shortCode);
    }
    if (method === "GET" && pathname.length > 1) {
      const shortCode = pathname.substring(1);
      if (/^[0-9A-Za-z]{6}$/.test(shortCode)) {
        return handleRedirectRequest(shortCode);
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

          <p><small>Database contains ${Object.keys(urlDatabase).length} short URLs.</small></p>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }
    return addCORSHeaders(new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    ));
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

// .wrangler/tmp/bundle-HjHp5G/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-HjHp5G/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
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
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
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
