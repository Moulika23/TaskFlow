/*
  components/PrivateRoute.jsx — Protects pages that require login

  WHAT IS THIS?
  A "guard" component. You wrap any page that requires authentication with it.
  If the user is logged in → show the page.
  If the user is NOT logged in → redirect them to /login.

  HOW IT'S USED (in App.jsx):
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
  
  WHY NOT CHECK THIS IN EVERY PAGE COMPONENT?
  We could put the redirect logic inside each page, but that's repetitive.
  Wrapping with PrivateRoute keeps each page component focused on its own job.
  This follows the same idea as the backend's authMiddleware — one place handles
  the auth check, everything else just uses it.

  <Navigate to="/login" replace />
  The 'replace' prop means the redirect replaces the current history entry.
  So when the user logs in and gets redirected to /dashboard, pressing the
  back button won't send them back to /login — it would go to wherever they
  were before they tried to access the protected page.
*/

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function PrivateRoute({ children }) {
  const { token } = useAuth()

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Token exists — render whatever page was passed as children
  return children
}

export default PrivateRoute
