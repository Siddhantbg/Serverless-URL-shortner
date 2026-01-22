import PixelSnow from './PixelSnow'
import ElectricBorder from './ElectricBorder'
import PixelCard from './PixelCard'
import './LandingPage.css'

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-container">
      {/* Background PixelSnow Effect */}
      <div className="landing-background">
        <PixelSnow
          color="#ffffff"
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1.25}
          density={0.3}
          direction={125}
          brightness={1}
          depthFade={8}
          farPlane={20}
          gamma={0.4545}
          variant="square"
        />
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
          <div className="info-stack">
            <PixelCard variant="blue" className="info-pixel-card">
              <div className="info-card-content">
                <div className="info-icon">☁️</div>
                <h3>Zero Infrastructure</h3>
                <p>Cloudflare Workers execute on demand at the edge. No servers, VMs, or containers to manage.</p>
              </div>
            </PixelCard>

            <PixelCard variant="blue" className="info-pixel-card">
              <div className="info-card-content">
                <div className="info-icon">🌍</div>
                <h3>Global Distribution</h3>
                <p>Deployed across 300+ edge locations worldwide for minimal latency and maximum availability.</p>
              </div>
            </PixelCard>

            <PixelCard variant="blue" className="info-pixel-card">
              <div className="info-card-content">
                <div className="info-icon">📈</div>
                <h3>Auto-Scaling</h3>
                <p>Handles millions of requests seamlessly. Pay only for what you use with no idle costs.</p>
              </div>
            </PixelCard>

            <PixelCard variant="blue" className="info-pixel-card">
              <div className="info-card-content">
                <div className="info-icon">⚡</div>
                <h3>Edge Storage</h3>
                <p>Cloudflare KV provides globally replicated key-value storage with eventual consistency.</p>
              </div>
            </PixelCard>
          </div>
        </div>

        {/* Two Services Section */}
        <div className="services-showcase">
          <h2 className="section-title">Two Powerful Services</h2>
          <div className="services-grid">
            <ElectricBorder
              color="#7df9ff"
              speed={1}
              chaos={0.12}
              borderRadius={20}
              className="electric-card"
            >
              <div className="service-showcase-card">
                <div className="service-header">
                  <div className="service-number">01</div>
                  <div className="service-diamond">◆</div>
                </div>
                <h3>URL Shortening</h3>
                <p className="service-description">Create compact 6-character Base62 codes backed by Cloudflare KV. Each short URL includes:</p>
                <ul className="service-features">
                  <li>✓ Real-time click tracking and analytics</li>
                  <li>✓ Global 302 redirects at edge locations</li>
                  <li>✓ User attribution (Firebase Auth)</li>
                  <li>✓ Public stats endpoint for monitoring</li>
                </ul>
                <div className="service-badge">Persistent Storage</div>
              </div>
            </ElectricBorder>

            <ElectricBorder
              color="#7df9ff"
              speed={1}
              chaos={0.12}
              borderRadius={20}
              className="electric-card"
            >
              <div className="service-showcase-card">
                <div className="service-header">
                  <div className="service-number">02</div>
                  <div className="service-diamond">◆</div>
                </div>
                <h3>Encrypted Links</h3>
                <p className="service-description">Stateless encryption using AES-GCM cryptography. No database storage required:</p>
                <ul className="service-features">
                  <li>✓ 256-bit AES-GCM with 12-byte IV</li>
                  <li>✓ Base64url encoded for URL safety</li>
                  <li>✓ Decrypt on-the-fly at redirect time</li>
                  <li>✓ Zero storage overhead</li>
                </ul>
                <div className="service-badge">Cryptographically Secure</div>
              </div>
            </ElectricBorder>
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
            <PixelCard variant="default" className="endpoint-pixel-card">
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
            </PixelCard>

            <PixelCard variant="default" className="endpoint-pixel-card">
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
            </PixelCard>
          </div>
          <p className="api-note">
            <strong>Note:</strong> Protected endpoints require <code>Authorization: Bearer &lt;Firebase-ID-Token&gt;</code> header
          </p>
        </div>

        {/* Tech Stack */}
        <div className="tech-stack-section">
          <h2 className="section-title">Built with Cutting-Edge Technology</h2>
          <div className="tech-categories">
            <ElectricBorder
              color="#7df9ff"
              speed={1}
              chaos={0.12}
              borderRadius={20}
              className="tech-electric-card"
            >
              <div className="tech-category">
                <h4>Frontend</h4>
                <div className="tech-badges">
                  <span className="tech-badge">React 19</span>
                  <span className="tech-badge">Vite 7</span>
                  <span className="tech-badge">Three.js</span>
                  <span className="tech-badge">Firebase Auth</span>
                </div>
              </div>
            </ElectricBorder>

            <ElectricBorder
              color="#7df9ff"
              speed={1}
              chaos={0.12}
              borderRadius={20}
              className="tech-electric-card"
            >
              <div className="tech-category">
                <h4>Backend</h4>
                <div className="tech-badges">
                  <span className="tech-badge">Cloudflare Workers</span>
                  <span className="tech-badge">Cloudflare KV</span>
                  <span className="tech-badge">Wrangler v4</span>
                </div>
              </div>
            </ElectricBorder>

            <ElectricBorder
              color="#7df9ff"
              speed={1}
              chaos={0.12}
              borderRadius={20}
              className="tech-electric-card"
            >
              <div className="tech-category">
                <h4>Security</h4>
                <div className="tech-badges">
                  <span className="tech-badge">AES-GCM 256</span>
                  <span className="tech-badge">JWT Tokens</span>
                  <span className="tech-badge">CORS</span>
                </div>
              </div>
            </ElectricBorder>
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
