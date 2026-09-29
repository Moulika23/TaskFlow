/*
  controllers/userController.js — Update profile and change password

  ENDPOINTS:
    PUT /api/users/:id          → updateUser    (update name)
    PUT /api/users/:id/password → changePassword

  SELF-ONLY RULE:
  A user can only update their OWN profile.
  We check: req.params.id === req.user.id
  This prevents user A from editing user B's name or password.
  
  This is different from the project authorization check where the owner
  can manage other users. Here, it's strictly personal — only you can
  change your own name or password.

  CHANGE PASSWORD FLOW:
  1. Receive: { currentPassword, newPassword }
  2. Fetch user from DB (with password field — it's excluded by default with .select('-password'))
  3. Use bcrypt.compare() to verify the current password is correct
  4. Hash the new password and save it
  We never just overwrite the password without verifying the current one first.
*/

const User = require('../models/User')
const bcrypt = require('bcryptjs')


// ─────────────────────────────────────────────
// PUT /api/users/:id
// Update the logged-in user's name
// ─────────────────────────────────────────────
const updateUser = async (req, res) => {
  // Self-only check — make sure the user is updating their own profile
  if (req.params.id !== req.user.id) {
    return res.status(403).json({ message: 'You can only update your own profile' })
  }

  const { name } = req.body

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name cannot be empty' })
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { returnDocument: 'after' } // Updated for Mongoose 8+ compatibility
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('updateUser error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


// ─────────────────────────────────────────────
// PUT /api/users/:id/password
// Change the logged-in user's password
// Body: { currentPassword, newPassword }
// ─────────────────────────────────────────────
const changePassword = async (req, res) => {
  // Self-only check
  if (req.params.id !== req.user.id) {
    return res.status(403).json({ message: 'You can only change your own password' })
  }

  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both current and new password are required' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' })
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from current password' })
  }

  try {
    // We need the password field here, so we can't use .select('-password')
    // findById returns all fields by default
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify the current password is correct before allowing the change
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Hash the new password and save
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('changePassword error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


module.exports = { updateUser, changePassword }
