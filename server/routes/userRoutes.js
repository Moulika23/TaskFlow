/*
  routes/userRoutes.js — Maps /api/users/* URLs to user controller

  Both routes require authentication (protect middleware).
  The controller itself also checks that req.params.id === req.user.id
  so users can only edit their own profile — two layers of protection.
*/

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { updateUser, changePassword } = require('../controllers/userController')

// PUT /api/users/:id — update name
router.put('/:id', protect, updateUser)

// PUT /api/users/:id/password — change password
// NOTE: The '/password' route must be defined AFTER '/:id' would normally catch it,
// but because '/password' is a specific suffix and '/:id/password' is a distinct pattern,
// Express handles this correctly — '/password' only matches the more specific path.
router.put('/:id/password', protect, changePassword)

module.exports = router
