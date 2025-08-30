import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [shortLink, setShortLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const WORKER_URL = 'http://127.0.0.1:8787' // Cloudflare Worker local development URL

  const handleShorten = async () => {
    if (!url.trim()) return

    setLoading(true)
    setError('')
    setShortLink('')

    try {
      const response = await fetch(`${WORKER_URL}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL')
      }

      setShortLink(data.shortUrl)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      console.error('Error shortening URL:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleShorten()
    }
  }

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">URL Shortener</h1>
        <div className="input-container">
          <input
            type="url"
            placeholder="Paste your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="url-input"
            disabled={loading}
          />
          <button 
            onClick={handleShorten}
            disabled={!url.trim() || loading}
            className="shorten-button"
          >
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>
        
        {error && (
          <div className="error-container">
            <p className="error-message">❌ {error}</p>
          </div>
        )}

        {shortLink && (
          <div className="result-container">
            <p className="result-label">Your shortened URL:</p>
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
                title="Test the short link"
              >
                🔗 Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
