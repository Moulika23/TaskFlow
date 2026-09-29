/*
  controllers/taskController.js — Task CRUD + automatic progress recalculation

  ENDPOINTS:
    GET    /api/tasks/:projectId  → getTasksByProject
    POST   /api/tasks             → createTask
    PUT    /api/tasks/:id         → updateTask
    DELETE /api/tasks/:id         → deleteTask

  THE KEY IDEA — recalculateProgress():
  After EVERY task change (create, update status, delete), we call this helper.
  It counts all tasks for the project, counts how many are 'done',
  and saves the percentage to the Project document.

  This means the Project's progress field is always up to date.
  The formula is simple:  (doneTasks / totalTasks) * 100

  WHY A HELPER FUNCTION INSTEAD OF A MONGOOSE HOOK?
  We could use a Mongoose 'post save' hook on the Task schema to auto-run this.
  But that would be "magic" — code that runs invisibly in the background.
  A plain helper function is more explicit: you can see exactly when and why
  progress is recalculated just by reading the controller. Easier to explain.

  AUTHORIZATION:
  We check that the user is a member or owner of the project before
  letting them interact with tasks. We do this by looking up the project
  and verifying req.user.id is in it.
*/

const Task = require('../models/Task')
const Project = require('../models/Project')


// ─────────────────────────────────────────────
// HELPER: Recalculate and save project progress
// Called after every task create/update/delete
// ─────────────────────────────────────────────
const recalculateProgress = async (projectId) => {
  // Get all tasks for this project
  const tasks = await Task.find({ projectId })

  let progress = 0

  if (tasks.length > 0) {
    const doneTasks = tasks.filter((task) => task.status === 'done').length
    // Round to a whole number — no one wants to see "33.333...%"
    progress = Math.round((doneTasks / tasks.length) * 100)
  }

  // Save the calculated progress to the Project document
  await Project.findByIdAndUpdate(projectId, { progress })
}


// ─────────────────────────────────────────────
// HELPER: Check if user is a member or owner of the project
// Returns the project if authorized, null if not found, false if not authorized
// ─────────────────────────────────────────────
const getProjectIfAuthorized = async (projectId, userId) => {
  const project = await Project.findById(projectId)
  if (!project) return null

  const isOwner = project.owner.toString() === userId
  const isMember = project.members.some((m) => m.toString() === userId)

  if (!isOwner && !isMember) return false
  return project
}


// ─────────────────────────────────────────────
// GET /api/tasks/:projectId
// Get all tasks for a project
// ─────────────────────────────────────────────
const getTasksByProject = async (req, res) => {
  try {
    // First check the user is allowed to see this project's tasks
    const project = await getProjectIfAuthorized(req.params.projectId, req.user.id)

    if (project === null) {
      return res.status(404).json({ message: 'Project not found' })
    }
    if (project === false) {
      return res.status(403).json({ message: 'You do not have access to this project' })
    }

    // Fetch all tasks for this project, with assignedTo user details populated
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 }) // Newest first

    res.json(tasks)
  } catch (error) {
    console.error('getTasksByProject error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


// ─────────────────────────────────────────────
// POST /api/tasks
// Create a new task
// Body: { title, description, projectId, assignedTo, priority, deadline }
// ─────────────────────────────────────────────
const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo, priority, deadline } = req.body

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' })
  }
  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' })
  }

  try {
    const project = await getProjectIfAuthorized(projectId, req.user.id)

    if (project === null) {
      return res.status(404).json({ message: 'Project not found' })
    }
    if (project === false) {
      return res.status(403).json({ message: 'You do not have access to this project' })
    }

    const task = await Task.create({
      title,
      description: description || '',
      projectId,
      assignedTo: assignedTo || null,
      priority: priority || 'medium',
      deadline: deadline || null,
      status: 'todo', // All new tasks start as 'todo'
    })

    // Recalculate project progress after adding a task
    // (A new todo task will lower the percentage if there were done tasks before)
    await recalculateProgress(projectId)

    // Populate the assignedTo field before sending back
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')

    res.status(201).json(populatedTask)
  } catch (error) {
    console.error('createTask error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


// ─────────────────────────────────────────────
// PUT /api/tasks/:id
// Update a task (change title, status, priority, assignee, etc.)
// ─────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Check the user has access to the project this task belongs to
    const project = await getProjectIfAuthorized(task.projectId, req.user.id)

    if (project === null || project === false) {
      return res.status(403).json({ message: 'You do not have access to this task' })
    }

    // Update only the fields that were sent
    const { title, description, status, priority, assignedTo, deadline } = req.body

    if (title !== undefined) task.title = title
    if (description !== undefined) task.description = description
    if (status !== undefined) task.status = status
    if (priority !== undefined) task.priority = priority
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null
    if (deadline !== undefined) task.deadline = deadline || null

    await task.save()

    // Recalculate progress whenever a task is updated
    // This matters most when status changes (e.g. todo → done)
    await recalculateProgress(task.projectId)

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')

    res.json(populatedTask)
  } catch (error) {
    console.error('updateTask error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


// ─────────────────────────────────────────────
// DELETE /api/tasks/:id
// Delete a task
// ─────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const project = await getProjectIfAuthorized(task.projectId, req.user.id)

    if (project === null || project === false) {
      return res.status(403).json({ message: 'You do not have access to this task' })
    }

    const projectId = task.projectId // Save before deleting
    await task.deleteOne()

    // Recalculate progress after deleting a task
    await recalculateProgress(projectId)

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('deleteTask error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


module.exports = { getTasksByProject, createTask, updateTask, deleteTask }
