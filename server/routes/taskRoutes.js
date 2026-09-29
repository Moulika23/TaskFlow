/*
  routes/taskRoutes.js — Maps /api/tasks/* URLs to controller functions

  ROUTE STRUCTURE NOTE:
  GET  /api/tasks/:projectId  — uses projectId to fetch ALL tasks in a project
  POST /api/tasks             — projectId comes from req.body, not the URL
  PUT  /api/tasks/:id         — uses the task's own _id
  DELETE /api/tasks/:id       — uses the task's own _id

  This means ":projectId" and ":id" are on different routes (GET vs PUT/DELETE),
  so they don't conflict with each other.
*/

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController')

router.get('/:projectId', protect, getTasksByProject)
router.post('/', protect, createTask)
router.put('/:id', protect, updateTask)
router.delete('/:id', protect, deleteTask)

module.exports = router
