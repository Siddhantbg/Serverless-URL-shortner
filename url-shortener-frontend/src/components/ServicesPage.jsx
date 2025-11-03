import { useState } from 'react'
import ColorBends from './ColorBends'
import './ServicesPage.css'

const ServicesPage = ({ user, onLogout, idToken }) => {
  const [url, setUrl] = useState('')
  const [shortLink, setShortLink] = useState('')
  const [service, setService] = useState('shorten')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [decryptResult, setDecryptResult] = useState('')

  const WORKER_URL = (import.meta.env?.VITE_API_BASE || 'http://127.0.0.1:8787').replace(/\/$/, '')

  const handleAction = async () => {
    if (!url.trim()) return

    setLoading(true)
    setError('')
    setShortLink('')
    setDecryptResult('')

    try {
      let endpoint = service === 'shorten' ? '/shorten' : '/encrypt'
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
      const response = await fetch(`${WORKER_URL}${endpoint}?url=${encodeURIComponent(url.trim())}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: url.trim() })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Request failed')
      setShortLink(service === 'shorten' ? data.shortUrl : data.encryptedUrl)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleAction()
    }
  }

  const handleDecrypt = async () => {
    if (!url.trim()) return
    
    // Check if the input is already a plain URL (not encrypted)
    try {
      const testUrl = new URL(url.trim())
      // If it's a valid URL and doesn't contain /e/ path, it's likely already decrypted
      if (!testUrl.pathname.includes('/e/')) {
        setError('⚠️ This appears to be a regular URL, not an encrypted link. Encrypted links have the format: domain/e/CODE')
        return
      }
    } catch {
      // If URL parsing fails, it might be just the code, continue with decryption
    }
    
    setLoading(true)
    setError('')
    setShortLink('')
    setDecryptResult('')
    try {
      const res = await fetch(`${WORKER_URL}/decrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedUrl: url.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        // Better error messages
        if (data.error && data.error.toLowerCase().includes('invalid code')) {
          throw new Error('❌ Invalid encrypted code. Please check the link and try again.')
        }
        throw new Error(data.error || 'Failed to decrypt')
      }
      setDecryptResult(data.url)
    } catch (err) {
      setError(err.message || 'Failed to decrypt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="services-container">
      {/* Background ColorBends Effect */}
      <div className="services-colorbends-background">
        <ColorBends
          colors={["#667eea", "#764ba2", "#f093fb"]}
          rotation={45}
          speed={0.25}
          scale={1.15}
          frequency={1.4}
          warpStrength={1.3}
          mouseInfluence={0.7}
          parallax={0.5}
          noise={0.06}
          transparent
          brightness={1.5}
          alpha={1.3}
        />
      </div>

      {/* Auth Header */}
      <div className="auth-header">
        {user && (
          <div className="user-info">
            <span className="user-email">👤 {user.email}</span>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>
      
      <div className="card">
        <h1 className="title">URL Tools</h1>
        <div className="service-toggle" role="tablist" aria-label="Services">
          <button 
            className={`service-btn ${service === 'shorten' ? 'active' : ''}`} 
            onClick={() => setService('shorten')}
            role="tab"
            aria-selected={service === 'shorten'}
          >
            Shorten URL
          </button>
          <button 
            className={`service-btn ${service === 'encrypt' ? 'active' : ''}`} 
            onClick={() => setService('encrypt')}
            role="tab"
            aria-selected={service === 'encrypt'}
          >
            Encrypt URL
          </button>
        </div>

        <p className="description">
          {service === 'shorten' 
            ? 'Transform long URLs into short, shareable links' 
            : 'Create secure, encrypted links that decode on-the-fly'}
        </p>

        <div className="input-group">
          <input
            type="url"
            placeholder="Enter your URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="url-input"
            aria-label="URL input"
          />
          <button
            onClick={handleAction}
            disabled={loading || !url.trim()}
            className="action-button"
            aria-label={service === 'shorten' ? 'Shorten URL' : 'Encrypt URL'}
          >
            {loading ? '⏳ Processing...' : (service === 'shorten' ? '🔗 Shorten' : '🔐 Encrypt')}
          </button>
        </div>

        {service === 'encrypt' && (
          <button
            onClick={handleDecrypt}
            disabled={loading || !url.trim()}
            className="secondary-button"
            aria-label="Decrypt URL"
          >
            🔓 Decrypt Link
          </button>
        )}

        {error && (
          <div className="error-message" role="alert">
            ❌ {error}
          </div>
        )}

        {shortLink && (
          <div className="result-container">
            <p className="result-label">
              {service === 'shorten' ? '✨ Your Short Link:' : '🔐 Your Encrypted Link:'}
            </p>
            <div className="result-box">
              <a
                href={shortLink}
                target="_blank"
                rel="noopener noreferrer"
                className="short-link"
              >
                {shortLink}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(shortLink)}
                className="copy-button"
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
              <button
                onClick={() => window.open(shortLink, '_blank')}
                className="test-button"
                title={service === 'shorten' ? 'Test the short link' : 'Open encrypted link (will auto-decrypt)'}
              >
                🔗 Test
              </button>
            </div>
          </div>
        )}

        {service === 'encrypt' && decryptResult && (
          <div className="result-container">
            <p className="result-label">Decrypted URL:</p>
            <a
              href={decryptResult}
              target="_blank"
              rel="noopener noreferrer"
              className="short-link"
            >
              {decryptResult}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServicesPage
