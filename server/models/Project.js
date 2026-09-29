/*
  models/Project.js — The Project schema

  DESIGN DECISION: How to store members?
  We store the owner separately from members. This makes it easy to check
  "is this person the owner?" without looping through an array:
    if (project.owner.toString() !== req.user.id) → not the owner
  
  Members is just an array of User ObjectIDs.
  We use .populate() when fetching to fill in their name/email/avatar.

  WHAT IS $or IN QUERIES?
  When we fetch projects for a user, we need projects where:
    - The user IS the owner, OR
    - The user IS in the members array
  MongoDB's $or operator handles this in one query.

  PROGRESS FIELD:
  Stored as a number 0-100. We'll recalculate it in the Task controller (Phase 7)
  whenever a task's status changes: (completedTasks / totalTasks) * 100
  For now it defaults to 0.
*/

const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    // The user who created the project — they have full control
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Array of user IDs who are members of this project
    // The owner is NOT automatically in this array — we track them separately
    // This makes the owner check simple: project.owner.toString() === req.user.id
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    deadline: {
      type: Date,
      default: null,
    },

    // Progress percentage: 0 to 100
    // Calculated as: (number of completed tasks / total tasks) * 100
    // Updated automatically when tasks are created/completed (Phase 7)
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
)

const Project = mongoose.model('Project', projectSchema)

module.exports = Project
