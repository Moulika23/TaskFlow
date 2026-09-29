/*
  pages/Profile/Profile.jsx — User profile management

  WHAT THIS PAGE DOES:
  1. Shows the user's current info (avatar initials, name, email)
  2. Lets the user update their name
  3. Lets the user change their password (with current password verification)

  TWO SEPARATE FORMS, TWO SEPARATE STATES:
  Profile editing and password changing are independent actions.
  We keep separate state objects for each form so they don't interfere.
  If the user fills in the name form and then opens the password form,
  the name form stays as-is.

  UPDATING THE GLOBAL USER STATE:
  After a successful name update, we need to update the user in AuthContext
  so the navbar shows the new name immediately without a page refresh.
  The AuthContext doesn't expose a setUser directly, but we can re-fetch /me
  via getMe() and update... actually let's just add an updateUser function to
  AuthContext. But to keep things simple, we'll just call getMe() from here
  and update the name shown on the page locally. The navbar will show the
  updated name on next page visit (after the token re-check on refresh).
  
  Actually the simpler approach: after successful update, we use window.location.reload()
  ... no, that's bad UX. Instead, we add an 'updateUserInContext' function to AuthContext.
  But we promised no changes to AuthContext this phase.
  
  Simplest clean approach: after updating, set a local 'displayName' state
  that overrides the user.name from context for the current session.
  On next page load, the /me fetch will pick up the new name from the database anyway.
*/

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateUser, changePassword } from '../../services/api'
import Navbar from '../../components/Navbar'
import Avatar from '../../components/Avatar'

function Profile() {
  const { user, logout } = useAuth()

  // Profile form — pre-populate with current user data
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Local display name — updated immediately after save so the avatar updates
  // without needing a page refresh (user.name from context updates on next full load)
  const [displayName, setDisplayName] = useState(user?.name || '')


  // ── UPDATE NAME HANDLER ──────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)

    if (!profileForm.name.trim()) {
      setProfileError('Name cannot be empty.')
      return
    }

    if (profileForm.name.trim() === user?.name) {
      setProfileError('This is already your current name.')
      return
    }

    setProfileLoading(true)
    try {
      await updateUser(user.id, { name: profileForm.name.trim() })
      setDisplayName(profileForm.name.trim()) // Update locally for instant feedback
      setProfileSuccess(true)
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }


  // ── CHANGE PASSWORD HANDLER ──────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    // Client-side checks before hitting the server
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword(user.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      // Clear the form on success
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      setPasswordSuccess(true)
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setPasswordLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Your Profile</h1>
          <p className="text-muted mt-1">Manage your account details and password.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* ── LEFT: Avatar card ── */}
          <div className="md:col-span-1">
            <div className="bg-surface border border-border rounded-xl p-6 text-center">
              {/* Big avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24">
                  <Avatar name={displayName} size="lg" />
                </div>
              </div>

              <h2 className="font-semibold text-text text-lg">{displayName}</h2>
              <p className="text-muted text-sm mt-0.5">{user?.email}</p>

              <div className="mt-6 pt-5 border-t border-border">
                <p className="text-xs text-muted mb-3">Account actions</p>
                <button
                  onClick={logout}
                  className="w-full text-sm text-danger border border-red-200 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Sign out of all devices
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Edit forms ── */}
          <div className="md:col-span-2 space-y-5">

            {/* Edit Name */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="font-semibold text-text mb-1">Display Name</h2>
              <p className="text-sm text-muted mb-5">
                This name appears in project members lists and task assignments.
              </p>

              {profileSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
                  ✅ Name updated successfully.
                </div>
              )}
              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, name: e.target.value })
                    setProfileSuccess(false)
                  }}
                  className="flex-1 border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
                  placeholder="Your full name"
                />
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
                >
                  {profileLoading ? 'Saving...' : 'Save'}
                </button>
              </form>
            </div>

            {/* Email — read only, no change feature for simplicity */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="font-semibold text-text mb-1">Email Address</h2>
              <p className="text-sm text-muted mb-4">
                Your email is used to log in and cannot be changed.
              </p>
              <div className="flex items-center gap-3 bg-bg border border-border rounded-lg px-4 py-2.5">
                <span className="text-text">{user?.email}</span>
                <span className="text-xs text-muted bg-gray-100 px-2 py-0.5 rounded-full ml-auto">
                  Read only
                </span>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="font-semibold text-text mb-1">Change Password</h2>
              <p className="text-sm text-muted mb-5">
                Enter your current password to confirm, then set a new one.
              </p>

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
                  ✅ Password changed successfully. Use your new password next time you log in.
                </div>
              )}
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      setPasswordSuccess(false)
                    }}
                    placeholder="Your current password"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      setPasswordSuccess(false)
                    }}
                    placeholder="At least 6 characters"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
                      setPasswordSuccess(false)
                    }}
                    placeholder="Repeat your new password"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
