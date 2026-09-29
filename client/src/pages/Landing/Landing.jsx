/*
  pages/Landing/Landing.jsx — The public home page

  This is the first thing users see when they visit the app.
  Its only job is to explain what TaskFlow is and direct users to sign up or log in.
*/

import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Feature data — putting content in an array keeps the JSX clean and DRY.
// Instead of copy-pasting the same card layout 3 times, we .map() over this array.
const features = [
  {
    icon: '📋',
    title: 'Organize Projects',
    description: 'Create projects, set deadlines, and track progress — all in one place.',
  },
  {
    icon: '✅',
    title: 'Manage Tasks',
    description: 'Break work into tasks, assign them to teammates, and mark them done.',
  },
  {
    icon: '👥',
    title: 'Collaborate',
    description: 'Invite team members by email and work together in a shared workspace.',
  },
]

function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-bg">

      {/* ── NAVBAR ───────────────────────────────── */}
      <nav className="bg-surface border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-primary">TaskFlow</span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-3">
            {user ? (
              // If already logged in, show Go to Dashboard
              <Link
                to="/dashboard"
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text font-medium px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────── */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Manage projects.<br />Ship faster.
          </h1>
          <p className="text-xl opacity-90 mb-10 max-w-xl mx-auto">
            TaskFlow helps you and your team organise work, track progress,
            and collaborate — without the complexity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary font-bold px-8 py-3 rounded-lg text-lg hover:bg-primary-light transition-colors"
            >
              Start for free
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-lg text-lg hover:bg-white hover:text-primary transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ─────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-text mb-4">
            Everything your team needs
          </h2>
          <p className="text-muted text-center mb-12 text-lg">
            Simple, focused tools to help you get work done.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────── */}
      <section className="bg-primary-light py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text mb-4">Ready to get started?</h2>
          <p className="text-muted mb-8">
            It's free. No credit card required.
          </p>
          <Link
            to="/register"
            className="bg-primary text-white font-bold px-8 py-3 rounded-lg text-lg hover:bg-primary-dark transition-colors inline-block"
          >
            Create your account →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6 text-center text-muted text-sm">
        <p>Built with React + Node.js + MongoDB · TaskFlow © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default Landing
