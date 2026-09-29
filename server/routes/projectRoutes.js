/*
  routes/projectRoutes.js — Maps /api/projects/* URLs to controller functions

  ALL project routes require authentication — every route uses the protect middleware.
  Authorization (owner-only checks) is handled inside the controller functions themselves.

  ROUTE ORDER MATTERS:
  '/new' must be defined BEFORE '/:id' — otherwise Express would treat the word "new"
  as an :id parameter and try to find a project with id="new".
  (We handle /projects/new on the frontend, but good habit to know this rule.)
*/

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController')

// All routes require a valid JWT token
router.get('/', protect, getProjects)
router.post('/', protect, createProject)
router.get('/:id', protect, getProjectById)
router.put('/:id', protect, updateProject)
router.delete('/:id', protect, deleteProject)

// Member management routes
router.post('/:id/members', protect, addMember)
router.delete('/:id/members/:userId', protect, removeMember)

module.exports = router
