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
        <div className="landing-hero">
          <div className="landing-badge">
            <span className="badge-icon">⚡</span>
            <span>Powered by Cloudflare Edge</span>
          </div>
          
          <h1 className="landing-title">
            Transform Your Links
            <br />
            <span className="gradient-text">At Lightning Speed</span>
          </h1>
          
          <p className="landing-subtitle">
            Create shortened URLs or encrypted links instantly with our serverless,
            <br />
            globally distributed edge network. Fast, secure, and beautifully simple.
          </p>

          <button className="get-started-btn" onClick={onGetStarted}>
            <span>Get Started</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.16669 10H15.8334M15.8334 10L10 4.16669M15.8334 10L10 15.8334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Blazing Fast</h3>
            <p>Edge computing ensures your links work at lightning speed, anywhere in the world</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure by Default</h3>
            <p>AES-GCM encryption and Firebase authentication keep your links protected</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Analytics</h3>
            <p>Track clicks, monitor performance, and gain insights into your link activity</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Global CDN</h3>
            <p>Deployed on 300+ edge locations worldwide for maximum availability</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Encrypted Links</h3>
            <p>Create stateless encrypted URLs that don't require database storage</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Serverless Architecture</h3>
            <p>Zero maintenance, infinite scalability, pay only for what you use</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="tech-stack">
          <p className="tech-title">Built with cutting-edge technology</p>
          <div className="tech-badges">
            <span className="tech-badge">Cloudflare Workers</span>
            <span className="tech-badge">React</span>
            <span className="tech-badge">Firebase Auth</span>
            <span className="tech-badge">AES-GCM</span>
            <span className="tech-badge">WebGL</span>
          </div>
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
