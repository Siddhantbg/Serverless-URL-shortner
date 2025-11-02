import { useState } from 'react'
import Prism from './Prism'
import './LandingPage.css'

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-container">
      {/* Background Prism Effect */}
      <div className="landing-prism-background">
        <Prism
          animationType="rotate"
          timeScale={0.3}
          height={4}
          baseWidth={6}
          scale={4}
          hueShift={0}
          colorFrequency={1}
          noise={0.4}
          glow={1.2}
        />
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
