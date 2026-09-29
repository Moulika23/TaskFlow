/*
  models/Task.js — The Task schema

  WHAT A TASK LOOKS LIKE:
  A task belongs to one project (projectId) and can be optionally
  assigned to one user (assignedTo). It has a status that moves
  through: todo → in-progress → done.

  HOW PROGRESS WORKS:
  We don't calculate progress in the schema. Instead, after every
  task create/update/delete, the taskController calls a helper function
  that counts (done tasks / total tasks) * 100 and saves it to the Project.
  This keeps the schema simple and the logic explicit and easy to follow.

  WHY SEPARATE 'status' AND 'priority'?
  Status tracks WHERE the task is in the workflow (todo, in-progress, done).
  Priority tracks HOW IMPORTANT it is (low, medium, high).
  They answer different questions and change independently.
*/

const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
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

    // Which project this task belongs to
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    // The team member this task is assigned to (optional)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
