/*
  context/AuthContext.jsx — Global authentication state

  WHAT IS THE CONTEXT API?
  Imagine you have user info (name, email) that many different components need —
  the navbar, the dashboard, the profile page, etc.
  Without Context, you'd have to pass the user down as a prop through every
  component in between — this is called "prop drilling" and gets messy fast.

  Context is React's solution: you store the data at the top level and any
  component anywhere in the tree can read it directly.

  HOW IT WORKS (3 steps):
  1. createContext() — creates the "container" for the shared data
  2. <AuthContext.Provider value={...}> — wraps the app, making the data available
  3. useContext(AuthContext) — any component reads the data with this hook

  We also export a custom hook called useAuth() which is just a shortcut
  for useContext(AuthContext) — so components write useAuth() instead of
  useContext(AuthContext) everywhere. Just cleaner.

  THE LOADING STATE:
  When the app first loads, we check localStorage for a saved token.
  If one exists, we call /api/auth/me to verify it and get the user data.
  During this check, 'loading' is true — we show a spinner so the app
  doesn't flash the login page for a split second before redirecting.
*/

import { createContext, useContext, useState, useEffect } from 'react'
import { registerUser, loginUser, getMe } from '../services/api'

// Step 1: Create the context container
const AuthContext = createContext()

// AuthProvider is the component that wraps the whole app.
// It holds the state and provides it to all children.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)   // The logged-in user object (or null)
  const [token, setToken] = useState(null) // The JWT token (or null)
  const [loading, setLoading] = useState(true) // True while we check localStorage on startup

  // This runs ONCE when the app first loads
  // If there's a token saved from a previous session, verify it's still valid
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')

      if (savedToken) {
        try {
          setToken(savedToken)
          const response = await getMe()
          const userData = response.data
          // Normalize: MongoDB returns _id, but login returns id.
          // We always store as 'id' so components can use user.id everywhere.
          setUser({
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar,
          })
        } catch (error) {
          // Token is expired or invalid — clear everything out
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }

      setLoading(false) // Done checking — let the app render
    }

    initAuth()
  }, []) // Empty array means "run only once on mount"


  // ─────────────────────────────────────────────
  // REGISTER
  // Called from the Register page
  // Returns { success: true } or { success: false, message: '...' }
  // We return an object instead of throwing, so the form component
  // can show the error message without a try/catch of its own
  // ─────────────────────────────────────────────
  const register = async (name, email, password) => {
    try {
      const response = await registerUser({ name, email, password })
      const { token: newToken, user: newUser } = response.data

      // Save token to localStorage so it persists across page refreshes
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(newUser)

      return { success: true }
    } catch (error) {
      // error.response.data.message is the message our backend sends back
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      return { success: false, message }
    }
  }


  // ─────────────────────────────────────────────
  // LOGIN
  // Called from the Login page
  // ─────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const response = await loginUser({ email, password })
      const { token: newToken, user: newUser } = response.data

      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(newUser)

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.'
      return { success: false, message }
    }
  }


  // ─────────────────────────────────────────────
  // LOGOUT
  // Called from the navbar or anywhere
  // ─────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    // Note: we don't need to call the backend for logout.
    // JWT tokens are stateless — we just stop sending the token.
    // The token will eventually expire on its own (after 7 days).
  }


  // The value object is what all consuming components receive from useAuth()
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  }

  // Step 2: Wrap children in the Provider
  // While we're checking localStorage, show a simple loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted text-sm">Loading TaskFlow...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Step 3: Custom hook — components call useAuth() instead of useContext(AuthContext)
// This is just a convenience shortcut
export function useAuth() {
  return useContext(AuthContext)
}
