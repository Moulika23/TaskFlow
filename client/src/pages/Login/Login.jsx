/*
  pages/Login/Login.jsx — Login form

  WHAT THIS PAGE DOES:
  - Shows a form with email + password fields
  - Validates inputs manually with simple if-checks
  - Calls login() from AuthContext on submit
  - On success: redirects to /dashboard
  - On failure: shows the error message from the server inline

  FORM STATE PATTERN:
  We use a single state object 'formData' to hold all form field values.
  When a user types in a field, we update just that field using the spread operator:
    setFormData({ ...formData, email: 'new value' })
  This is the simple, standard React pattern for forms.

  WHY NOT USE REACT HOOK FORM OR ZOD?
  For a form this small (2 fields), those libraries add complexity without benefit.
  A plain useState + if-check is easier to read, easier to explain, and does the job.
*/

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Login() {
  // All form fields in one state object
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')       // Error message to show under the form
  const [isLoading, setIsLoading] = useState(false) // True while the API call is happening

  const { login } = useAuth()
  const navigate = useNavigate() // useNavigate gives us a function to redirect programmatically

  // Generic change handler — works for any input field
  // e.target.name matches the name attribute on each <input>
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent the browser's default form submission (page reload)
    setError('')        // Clear any previous error

    // Manual validation — simple and explicit
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)

    // Call the login function from AuthContext
    const result = await login(formData.email, formData.password)

    setIsLoading(false)

    if (result.success) {
      navigate('/dashboard') // Redirect to dashboard on success
    } else {
      setError(result.message) // Show the error message from the server
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            <span className="text-2xl font-bold text-primary">TaskFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-text mt-4">Welcome back</h1>
          <p className="text-muted mt-1">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">

          {/* Error message — only shown when 'error' state is not empty */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Link to register */}
          <p className="text-center text-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
