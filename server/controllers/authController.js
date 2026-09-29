/*
  controllers/authController.js — Handles user registration, login, and profile fetch

  WHAT IS A CONTROLLER?
  A controller is just a JavaScript function that:
    1. Reads data from the request (req.body, req.params, req.user, etc.)
    2. Does some work (DB queries, password hashing, etc.)
    3. Sends a response (res.json)

  WHY SEPARATE CONTROLLERS FROM ROUTES?
  Routes just say "when this URL is hit, run this function."
  Controllers contain the actual logic. Keeping them separate means:
  - The route file stays clean and easy to read
  - The controller can be tested independently
  - The same controller function could be reused in multiple routes if needed

  WHAT IS A JWT (JSON Web Token)?
  A JWT is a string that looks like: xxxxx.yyyyy.zzzzz
  It has 3 parts separated by dots:
    - Header: says what type of token it is
    - Payload: the data we stored (e.g. { id: "abc123" })
    - Signature: a hash of the above two parts using our JWT_SECRET
  
  When a user logs in, we give them this token. On every future request,
  they send it back in the header. We verify the signature to confirm
  the token hasn't been tampered with. If it's valid, we know who they are.

  WHY STORE THE TOKEN IN localStorage?
  localStorage is simple and easy to understand for a learning project.
  The tradeoff: it's accessible by JavaScript, so if there's an XSS attack
  (malicious script injected into the page), the token could be stolen.
  The more secure alternative is an httpOnly cookie — the browser stores it
  but JavaScript can't read it. For interviews, say: "I used localStorage
  for simplicity. In production I'd use httpOnly cookies."
*/

const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// ─────────────────────────────────────────────
// HELPER: Generate a JWT token for a given user ID
// We pull this out so we don't repeat the same jwt.sign() call
// in both register and login.
// ─────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },        // The payload — what we store inside the token
    process.env.JWT_SECRET, // The secret key used to sign it
    { expiresIn: '7d' }    // Token expires after 7 days — user must log in again after that
  )
}


// ─────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Create a new user account
// @access  Public (no token needed)
// ─────────────────────────────────────────────
const register = async (req, res) => {
  // Step 1: Read what the user sent us
  const { name, email, password } = req.body

  // Step 2: Simple validation — check required fields are present
  // We do this manually with plain if-checks (no Yup/Zod needed)
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  try {
    // Step 3: Check if a user with this email already exists
    // We check BEFORE trying to save, so we can give a clear error message
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' })
    }

    // Step 4: Hash the password
    // bcrypt.hash(password, 10) — the 10 is the "salt rounds"
    // Salt rounds = how many times bcrypt runs its hashing algorithm
    // More rounds = slower (harder to brute force) but takes more CPU
    // 10 is the industry standard — secure but fast enough for a web app
    // IMPORTANT: We NEVER store the plain text password — only the hash
    const hashedPassword = await bcrypt.hash(password, 10)

    // Step 5: Create the new user document in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Store the HASH, not the original password
    })

    // Step 6: Generate a JWT token so the user is "logged in" immediately after registering
    const token = generateToken(user._id)

    // Step 7: Send back the token + basic user info
    // We send back user info so the frontend can store it and show "Welcome, John"
    // We explicitly do NOT send back the password (even though it's hashed)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Register error:', error.message)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
}


// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Log in with email + password, get a token back
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' })
  }

  try {
    // Step 1: Find the user by email
    const user = await User.findOne({ email })

    // Step 2: If user not found, return a vague error
    // WHY VAGUE? If we say "email not found", an attacker learns which emails
    // are registered. "Invalid credentials" gives nothing away.
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Step 3: Compare the password they typed with the stored hash
    // bcrypt.compare() hashes the plain password and checks if it matches the stored hash
    // It returns true or false — we never "decrypt" the hash
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Step 4: Password matched — generate a token and send it back
    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
}


// ─────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get the currently logged-in user's info
// @access  Private (requires a valid token)
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  // By the time we reach this function, authMiddleware has already:
  //   1. Verified the JWT token
  //   2. Attached the decoded user info to req.user
  // So we just use req.user.id to look up the full user document.
  try {
    // .select('-password') fetches all fields EXCEPT the password
    // The minus sign means "exclude this field"
    const user = await User.findById(req.user.id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('GetMe error:', error.message)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
}


module.exports = { register, login, getMe }
