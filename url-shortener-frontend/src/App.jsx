import { useState, useEffect } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import ServicesPage from './components/ServicesPage'
import AuthModal from './components/AuthModal'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

function App() {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [idToken, setIdToken] = useState(null)
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const token = await currentUser.getIdToken()
        setIdToken(token)
        // User is authenticated, go to services page
        setShowLanding(false)
        setShowAuthModal(false)
      } else {
        setIdToken(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleGetStarted = () => {
    if (user) {
      // Already authenticated, go directly to services
      setShowLanding(false)
    } else {
      // Show auth modal
      setShowAuthModal(true)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setShowLanding(true)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <>
      {showLanding ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : (
        <ServicesPage 
          user={user} 
          onLogout={handleLogout}
          idToken={idToken}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}

export default App
