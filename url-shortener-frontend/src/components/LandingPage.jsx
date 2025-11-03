import ColorBends from './ColorBends'
import './LandingPage.css'

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-container">
      {/* Background ColorBends Effect - Multiple Layers */}
      <div className="landing-colorbends-background">
        {/* Left corner arc */}
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={30}
          speed={0.15}
          scale={1.2}
          frequency={1.4}
          warpStrength={1.2}
          mouseInfluence={0.8}
          parallax={0.6}
          noise={0.08}
          transparent
          brightness={1.85}
          alpha={1.35}
          additive
          autoRotate={2}
        />
        {/* Right corner arc */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <ColorBends
            colors={["#8a5cff", "#00ffd1", "#ff5c7a"]}
            rotation={-45}
            speed={0.12}
            scale={1.3}
            frequency={1.5}
            warpStrength={1.3}
            mouseInfluence={0.7}
            parallax={0.5}
            noise={0.06}
            transparent
            brightness={1.7}
            alpha={1.2}
            additive
            autoRotate={-1.5}
          />
        </div>
        {/* Top-center arc */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <ColorBends
            colors={["#00ffd1", "#ff5c7a", "#8a5cff"]}
            rotation={120}
            speed={0.18}
            scale={1.1}
            frequency={1.3}
            warpStrength={1.4}
            mouseInfluence={0.9}
            parallax={0.7}
            noise={0.07}
            transparent
            brightness={1.6}
            alpha={1.1}
            additive
            autoRotate={1.8}
          />
        </div>
        {/* Bottom-right arc */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <ColorBends
            colors={["#ff5c7a", "#00ffd1", "#8a5cff"]}
            rotation={-120}
            speed={0.14}
            scale={1.25}
            frequency={1.35}
            warpStrength={1.25}
            mouseInfluence={0.75}
            parallax={0.55}
            noise={0.09}
            transparent
            brightness={1.75}
            alpha={1.25}
            additive
            autoRotate={-2.2}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="landing-content">
        {/* Hero Section */}
        <div className="landing-hero">
          <div className="landing-badge">
            <span className="badge-icon">⚡</span>
            <span>Powered by Cloudflare Edge</span>
          </div>
          
          <h1 className="landing-title">
            Serverless URL Shortener
            <br />
            <span className="gradient-text">Transform Your Links at Lightning Speed</span>
          </h1>
          
          <p className="landing-subtitle">
            A modern, fully serverless URL utility offering two powerful services:
            <strong> URL Shortening</strong> with real-time analytics and 
            <strong> Encrypted Links</strong> using AES-GCM cryptography.
            <br />
            Built on Cloudflare Workers, deployed globally, scales automatically.
          </p>

          <div className="hero-buttons">
            <button className="get-started-btn primary" onClick={onGetStarted}>
              <span>Get Started</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.16669 10H15.8334M15.8334 10L10 4.16669M15.8334 10L10 15.8334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <a href="https://github.com/Siddhantbg/Serverless-URL-shortner" target="_blank" rel="noopener noreferrer" className="get-started-btn secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        {/* Why Serverless Section */}
        <div className="info-section">
          <h2 className="section-title">Why Serverless?</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">☁️</div>
              <h3>Zero Infrastructure</h3>
              <p>Cloudflare Workers execute on demand at the edge. No servers, VMs, or containers to manage.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🌍</div>
              <h3>Global Distribution</h3>
              <p>Deployed across 300+ edge locations worldwide for minimal latency and maximum availability.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📈</div>
              <h3>Auto-Scaling</h3>
              <p>Handles millions of requests seamlessly. Pay only for what you use with no idle costs.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h3>Edge Storage</h3>
              <p>Cloudflare KV provides globally replicated key-value storage with eventual consistency.</p>
            </div>
          </div>
        </div>

        {/* Two Services Section */}
        <div className="services-showcase">
          <h2 className="section-title">Two Powerful Services</h2>
          <div className="services-grid">
            <div className="service-showcase-card">
              <div className="service-number">01</div>
              <div className="service-icon">�</div>
              <h3>URL Shortening</h3>
              <p>Create compact 6-character Base62 codes backed by Cloudflare KV. Each short URL includes:</p>
              <ul className="service-features">
                <li>✓ Real-time click tracking and analytics</li>
                <li>✓ Global 302 redirects at edge locations</li>
                <li>✓ User attribution (Firebase Auth)</li>
                <li>✓ Public stats endpoint for monitoring</li>
              </ul>
              <div className="service-badge">Persistent Storage</div>
            </div>

            <div className="service-showcase-card">
              <div className="service-number">02</div>
              <div className="service-icon">�</div>
              <h3>Encrypted Links</h3>
              <p>Stateless encryption using AES-GCM cryptography. No database storage required:</p>
              <ul className="service-features">
                <li>✓ 256-bit AES-GCM with 12-byte IV</li>
                <li>✓ Base64url encoded for URL safety</li>
                <li>✓ Decrypt on-the-fly at redirect time</li>
                <li>✓ Zero storage overhead</li>
              </ul>
              <div className="service-badge">Cryptographically Secure</div>
            </div>
          </div>
        </div>

        {/* Architecture Section */}
        <div className="architecture-section">
          <h2 className="section-title">System Architecture</h2>
          <div className="architecture-grid">
            <div className="arch-card">
              <h4>🎨 Frontend</h4>
              <ul>
                <li>React 19 + Vite 7</li>
                <li>Firebase Auth (Email + Google OAuth)</li>
                <li>Three.js WebGL backgrounds</li>
                <li>Glassmorphic UI design</li>
              </ul>
            </div>
            <div className="arch-card">
              <h4>⚙️ Backend</h4>
              <ul>
                <li>Cloudflare Workers (Edge Runtime)</li>
                <li>KV for persistent URL mappings</li>
                <li>Firebase ID token verification</li>
                <li>RESTful API endpoints</li>
              </ul>
            </div>
            <div className="arch-card">
              <h4>🔐 Security</h4>
              <ul>
                <li>JWT authentication on protected endpoints</li>
                <li>CORS with origin whitelisting</li>
                <li>AES-GCM encryption for stateless links</li>
                <li>User-scoped URL ownership</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Endpoints Section */}
        <div className="api-section">
          <h2 className="section-title">API Endpoints</h2>
          <div className="endpoint-grid">
            <div className="endpoint-category">
              <h4>🔗 Shortening (Protected)</h4>
              <div className="endpoint-item">
                <span className="http-method post">POST</span>
                <code>/shorten</code>
                <p>Create short URL (requires auth)</p>
              </div>
              <div className="endpoint-item">
                <span className="http-method get">GET</span>
                <code>/:code</code>
                <p>Redirect to original URL</p>
              </div>
              <div className="endpoint-item">
                <span className="http-method get">GET</span>
                <code>/stats/:code</code>
                <p>Get URL statistics</p>
              </div>
            </div>

            <div className="endpoint-category">
              <h4>🔐 Encryption (Protected)</h4>
              <div className="endpoint-item">
                <span className="http-method post">POST</span>
                <code>/encrypt</code>
                <p>Encrypt URL (requires auth)</p>
              </div>
              <div className="endpoint-item">
                <span className="http-method get">GET</span>
                <code>/e/:code</code>
                <p>Decrypt and redirect</p>
              </div>
              <div className="endpoint-item">
                <span className="http-method post">POST</span>
                <code>/decrypt</code>
                <p>Decrypt to JSON</p>
              </div>
            </div>
          </div>
          <p className="api-note">
            <strong>Note:</strong> Protected endpoints require <code>Authorization: Bearer &lt;Firebase-ID-Token&gt;</code> header
          </p>
        </div>

        {/* Tech Stack */}
        <div className="tech-stack-section">
          <h2 className="section-title">Built with Cutting-Edge Technology</h2>
          <div className="tech-categories">
            <div className="tech-category">
              <h4>Frontend</h4>
              <div className="tech-badges">
                <span className="tech-badge">React 19</span>
                <span className="tech-badge">Vite 7</span>
                <span className="tech-badge">Three.js</span>
                <span className="tech-badge">Firebase Auth</span>
              </div>
            </div>
            <div className="tech-category">
              <h4>Backend</h4>
              <div className="tech-badges">
                <span className="tech-badge">Cloudflare Workers</span>
                <span className="tech-badge">Cloudflare KV</span>
                <span className="tech-badge">Wrangler v4</span>
              </div>
            </div>
            <div className="tech-category">
              <h4>Security</h4>
              <div className="tech-badges">
                <span className="tech-badge">AES-GCM 256</span>
                <span className="tech-badge">JWT Tokens</span>
                <span className="tech-badge">CORS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="getting-started-section">
          <h2 className="section-title">Quick Start</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Clone & Install</h4>
              <pre className="code-block">
git clone https://github.com/Siddhantbg/Serverless-URL-shortner
cd Serverless-URL-shortner
cd url-shortener-worker && npm install
cd ../url-shortener-frontend && npm install
              </pre>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Configure Firebase</h4>
              <p>Create a Firebase project and add credentials to <code>.env.local</code>:</p>
              <pre className="code-block">
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
              </pre>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Set Encryption Key</h4>
              <pre className="code-block">
# Generate key
node -e "console.log(require('crypto')
  .randomBytes(32).toString('base64url'))"

# Add to .dev.vars
ENCRYPTION_KEY="your_generated_key"
              </pre>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h4>Run Development Servers</h4>
              <pre className="code-block">
# Terminal 1: Worker
cd url-shortener-worker && npm run dev

# Terminal 2: Frontend
cd url-shortener-frontend && npm run dev
              </pre>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="final-cta">
          <h2>Ready to Transform Your Links?</h2>
          <p>Join the serverless revolution. Create short and encrypted URLs with zero infrastructure.</p>
          <button className="get-started-btn primary large" onClick={onGetStarted}>
            <span>Launch Application</span>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.16669 10H15.8334M15.8334 10L10 4.16669M15.8334 10L10 15.8334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  )
}

export default LandingPage
