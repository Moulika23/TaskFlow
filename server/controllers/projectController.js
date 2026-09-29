/*
  controllers/projectController.js — All project-related business logic

  ENDPOINTS HANDLED HERE:
    GET    /api/projects              → getProjects    (all projects for logged-in user)
    POST   /api/projects              → createProject
    GET    /api/projects/:id          → getProjectById
    PUT    /api/projects/:id          → updateProject  (owner only)
    DELETE /api/projects/:id          → deleteProject  (owner only)
    POST   /api/projects/:id/members  → addMember      (owner only, add by email)
    DELETE /api/projects/:id/members/:userId → removeMember (owner only)

  AUTHORIZATION PATTERN:
  For owner-only actions we always do this check:
    if (project.owner.toString() !== req.user.id)
  
  WHY .toString()?
  project.owner is a MongoDB ObjectId object. req.user.id is a plain string.
  Comparing them directly (===) would always return false even when they match,
  because they're different types. .toString() converts the ObjectId to a string
  so the comparison works correctly.

  WHAT IS .populate()?
  When we store members in the Project document, we only store their ObjectId.
  .populate('members', 'name email avatar') tells Mongoose: "replace each ObjectId
  in the members array with the actual User document, but only give me name, email, avatar."
  This is called a JOIN in SQL terms — in MongoDB it's done at query time with populate.
*/

const Project = require('../models/Project')
const User = require('../models/User')
const Task = require('../models/Task')


// ─────────────────────────────────────────────
// GET /api/projects
// Returns all projects where the logged-in user is the owner OR a member
// ─────────────────────────────────────────────
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      // $or is a MongoDB query operator: "match documents where field A OR field B is true"
      $or: [
        { owner: req.user.id },   // User is the owner
        { members: req.user.id }, // User is in the members array
      ],
    })
      .populate('owner', 'name email avatar')   // Replace owner ObjectId with user data
      .populate('members', 'name email avatar') // Replace each member ObjectId with user data
      .sort({ createdAt: -1 }) // Newest projects first

    res.json(projects)
  } catch (error) {
    console.error('getProjects error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


// ─────────────────────────────────────────────
// GET /api/projects/:id
// Returns one project by its ID
// ─────────────────────────────────────────────
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check the user is either the owner or a member — not just anyone with the ID
    const isMember = project.members.some(
      (member) => member._id.toString() === req.user.id
    )
    const isOwner = project.owner._id.toString() === req.user.id

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'You do not have access to this project' })
    }

    res.json(project)
  } catch (error) {
    next(error)
  }
}


// ─────────────────────────────────────────────
// POST /api/projects
// Create a new project — the logged-in user becomes the owner
// ─────────────────────────────────────────────
const createProject = async (req, res) => {
  const { title, description, deadline, memberEmails } = req.body

  if (!title) {
    return res.status(400).json({ message: 'Project title is required' })
  }

  try {
    // If the creator provided member emails, look up those users
    let memberIds = []
    if (memberEmails && memberEmails.length > 0) {
      // Normalize emails to lowercase and trim spaces
      const normalizedEmails = memberEmails.map((e) => e.toLowerCase().trim())
      // Find all users whose email is in the normalized array
      const foundUsers = await User.find({ email: { $in: normalizedEmails } })
      memberIds = foundUsers.map((u) => u._id)
    }

    const project = await Project.create({
      title,
      description: description || '',
      owner: req.user.id,  // The creator is automatically the owner
      members: memberIds,
      deadline: deadline || null,
    })

    // Add this project to the owner's projectsCreated list
    await User.findByIdAndUpdate(req.user.id, {
      $push: { projectsCreated: project._id },
    })

    // Add this project to each member's projectsJoined list
    if (memberIds.length > 0) {
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $push: { projectsJoined: project._id } }
      )
    }

    // Populate and return the full project so the frontend has complete data
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')

    res.status(201).json(populatedProject)
  } catch (error) {
    console.error('createProject error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


// ─────────────────────────────────────────────
// PUT /api/projects/:id
// Update project details — owner only
// ─────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // AUTHORIZATION CHECK — is the requester the owner?
    // We use .toString() because project.owner is an ObjectId object, not a string
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can edit this project' })
    }

    // Only update the fields that were actually sent — ignore the rest
    // This way the frontend can send a partial update without wiping other fields
    const { title, description, deadline, status } = req.body

    if (title !== undefined) project.title = title
    if (description !== undefined) project.description = description
    if (deadline !== undefined) project.deadline = deadline
    if (status !== undefined) project.status = status

    const updatedProject = await project.save()

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')

    res.json(populatedProject)
  } catch (error) {
    console.error('updateProject error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


// ─────────────────────────────────────────────
// DELETE /api/projects/:id
// Delete a project and all its tasks — owner only
// ─────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can delete this project' })
    }

    await project.deleteOne()

    // Delete all tasks that belong to this project
    await Task.deleteMany({ projectId: project._id })

    // Clean up: remove this project from all users' lists
    await User.updateMany(
      {},
      {
        $pull: {
          projectsCreated: project._id,
          projectsJoined: project._id,
        },
      }
    )

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('deleteProject error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


// ─────────────────────────────────────────────
// POST /api/projects/:id/members
// Add a member by email — owner only
// Body: { email: "someone@example.com" }
// ─────────────────────────────────────────────
const addMember = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can add members' })
    }

    // Find the user by the email provided (normalized to lowercase)
    const normalizedEmail = email.toLowerCase().trim()
    const userToAdd = await User.findOne({ email: normalizedEmail })

    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with that email address' })
    }

    // Don't add the owner as a member (they're already the owner)
    if (userToAdd._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You are already the owner of this project' })
    }

    // Check if they're already a member — avoid duplicates
    const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === userToAdd._id.toString()
    )
    if (alreadyMember) {
      return res.status(400).json({ message: 'This user is already a member of this project' })
    }

    // Add the user to the project's members array
    project.members.push(userToAdd._id)
    await project.save()

    // Add the project to the user's projectsJoined list
    await User.findByIdAndUpdate(userToAdd._id, {
      $push: { projectsJoined: project._id },
    })

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')

    res.json(populatedProject)
  } catch (error) {
    console.error('addMember error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


// ─────────────────────────────────────────────
// DELETE /api/projects/:id/members/:userId
// Remove a member — owner only
// ─────────────────────────────────────────────
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can remove members' })
    }

    const userIdToRemove = req.params.userId

    // Can't remove the owner
    if (userIdToRemove === req.user.id) {
      return res.status(400).json({ message: 'You cannot remove yourself as the owner' })
    }

    // $pull removes all elements from an array that match the condition
    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userIdToRemove
    )
    await project.save()

    // Remove the project from the user's projectsJoined list
    await User.findByIdAndUpdate(userIdToRemove, {
      $pull: { projectsJoined: project._id },
    })

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')

    res.json(populatedProject)
  } catch (error) {
    console.error('removeMember error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}


module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
}
