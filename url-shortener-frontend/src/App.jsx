import { useState } from 'react'
import './App.css'
import Prism from './components/Prism'

function App() {
  const [url, setUrl] = useState('')
  const [shortLink, setShortLink] = useState('')
  const [service, setService] = useState('shorten') // 'shorten' | 'encrypt'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [decryptResult, setDecryptResult] = useState('')

  // API base configured via Vite env (fallback to local Worker in dev)
  const WORKER_URL = (import.meta.env?.VITE_API_BASE || 'http://127.0.0.1:8787').replace(/\/$/, '')

  const handleAction = async () => {
    if (!url.trim()) return

    setLoading(true)
    setError('')
    setShortLink('')
    setDecryptResult('')

    try {
      let endpoint = ''
      if (service === 'shorten') {
        endpoint = '/shorten'
      } else {
        endpoint = '/encrypt'
      }
      const response = await fetch(`${WORKER_URL}${endpoint}?url=${encodeURIComponent(url.trim())}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Request failed')
      if (service === 'shorten') {
        setShortLink(data.shortUrl)
      } else {
        setShortLink(data.encryptedUrl)
      }
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
    setLoading(true)
    setError('')
    setShortLink('')
    setDecryptResult('')
    try {
      let code = ''
      try {
        const u = new URL(url.trim())
        const path = u.pathname
        code = path.startsWith('/e/') ? path.slice(3) : path.replace(/^\/+/, '')
      } catch {
        code = url.trim().replace(/^\s+|\s+$/g, '')
      }
      const res = await fetch(`${WORKER_URL}/decrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to decrypt')
      setDecryptResult(data.url)
    } catch (err) {
      setError(err.message || 'Failed to decrypt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      {/* Background Prism Effect */}
      <div className="prism-background">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.3}
          glow={1}
        />
      </div>
      
      <div className="card">
        <h1 className="title">URL Tools</h1>
        <div className="service-toggle" role="tablist" aria-label="Services">
          <button className={`service-btn ${service==='shorten' ? 'active' : ''}`} onClick={()=>setService('shorten')}>
            Shorten
          </button>
          <button className={`service-btn ${service==='encrypt' ? 'active' : ''}`} onClick={()=>setService('encrypt')}>
            Encrypt
          </button>
        </div>
        <div className="input-container">
          <input
            type="url"
            placeholder={service==='shorten' ? 'Paste your long URL to shorten...' : 'Paste your long URL to encrypt...' }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="url-input"
            disabled={loading}
          />
          <button 
            onClick={handleAction}
            disabled={!url.trim() || loading}
            className="shorten-button"
          >
            {loading ? (service==='shorten' ? 'Shortening...' : 'Encrypting...') : (service==='shorten' ? 'Shorten' : 'Encrypt')}
          </button>
          {service==='encrypt' && (
            <button
              onClick={handleDecrypt}
              disabled={!url.trim() || loading}
              className="secondary-button"
              title="Decrypt an encrypted URL or code"
            >
              {loading ? 'Working...' : 'Decrypt'}
            </button>
          )}
        </div>
        
        {error && (
          <div className="error-container">
            <p className="error-message">❌ {error}</p>
          </div>
        )}

        {shortLink && (
          <div className="result-container">
            <p className="result-label">{service==='shorten' ? 'Your shortened URL:' : 'Your encrypted link:'}</p>
            <a
              href={shortLink}
              target="_blank"
              rel="noopener noreferrer"
              className="short-link"
            >
              {shortLink}
            </a>
            <div className="button-group">
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
                title={service==='shorten' ? 'Test the short link' : 'Open encrypted link (will auto-decrypt)'}
              >
                🔗 Test
              </button>
            </div>
          </div>
        )}

        {service==='encrypt' && decryptResult && (
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

export default App
