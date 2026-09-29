/*
  pages/NotFound/NotFound.jsx — 404 Fallback Page

  Catch-all fallback page for invalid paths (e.g. /some/bad/url).
*/

import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center text-4xl mb-6">
        🔍
      </div>
      <h1 className="text-4xl font-bold text-text mb-2">404 - Page Not Found</h1>
      <p className="text-muted max-w-md mb-8 text-lg">
        Oops! The page or project workspace you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  )
}

export default NotFound
