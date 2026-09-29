/*
  routes/authRoutes.js — Maps /api/auth/* URLs to controller functions

  WHAT THIS FILE DOES:
  This file is intentionally simple — it just connects URLs to functions.
  All the actual logic is in authController.js.

  HOW ROUTING WORKS:
  In server.js we wrote:  app.use('/api/auth', authRoutes)
  So any request to /api/auth/* comes here.
  
  Then in this file, router.post('/register', register) handles POST /api/auth/register
  because Express combines the prefix '/api/auth' + '/register'

  WHY USE express.Router() INSTEAD OF app?
  We could do app.post('/api/auth/register', ...) in server.js
  but that would make server.js huge. Router() lets us group related
  routes in their own file and keep server.js clean.

  AUTHENTICATION vs AUTHORIZATION:
  - Authentication = "Who are you?" → register and login handle this
  - Authorization = "Are you allowed to do this?" → protect middleware handles this
  The /me route uses protect because it requires you to already be authenticated.
*/

const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// POST /api/auth/register — anyone can register (no token needed)
router.post('/register', register)

// POST /api/auth/login — anyone can try to log in (no token needed)
router.post('/login', login)

// GET /api/auth/me — only logged-in users can call this
// protect runs first — if token is invalid, the request stops there
// if token is valid, protect calls next() and getMe runs
router.get('/me', protect, getMe)

module.exports = router
