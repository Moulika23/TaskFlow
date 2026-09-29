/*
  pages/ProjectWorkspace/ProjectWorkspace.jsx — Main project view with tabs

  WHAT THIS PAGE DOES:
  - Reads the project ID from the URL using useParams()
  - Fetches the project data from the API
  - Shows 4 tabs: Overview, Tasks, Members, Settings
  - Renders a different component based on the active tab

  TABS BUILT NOW:
  - Overview: project info + progress + member list  ✅
  - Tasks: create, update status, delete tasks       ✅
  - Members: full member list + add by email (owner only) ✅
  - Settings: placeholder — built in Phase 8  🔜

  useParams() EXPLAINED:
  In App.jsx we defined: <Route path="/projects/:id" ...>
  The ":id" part is a URL parameter. useParams() gives us an object with that value:
    const { id } = useParams()
  If the URL is /projects/abc123, then id = "abc123"
*/

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProjectById, addMember, removeMember, getTasksByProject, createTask, updateTask, deleteTask, updateProject, deleteProject } from '../../services/api'
import Navbar from '../../components/Navbar'
import Avatar from '../../components/Avatar'

const STATUS_COLORS = {
  planning: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  'on-hold': 'bg-orange-100 text-orange-700',
  completed: 'bg-blue-100 text-blue-700',
}

const TABS = ['Overview', 'Tasks', 'Members', 'Settings']

function ProjectWorkspace() {
  const { id } = useParams()       // Get the project ID from the URL
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  const [error, setError] = useState('')

  const fetchProject = async () => {
    try {
      const res = await getProjectById(id)
      setProject(res.data)
    } catch (err) {
      setError('Could not load this project.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-lg font-semibold text-text mb-2">Project not found</p>
          <p className="text-muted mb-6">{error}</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  // isOwner is used to conditionally show owner-only controls (Settings, add/remove members)
  const isOwner =
    project.owner._id === user?.id ||
    project.owner._id?.toString() === user?.id

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* ── PROJECT HEADER ── */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              {/* Back link */}
              <button
                onClick={() => navigate('/projects')}
                className="text-sm text-muted hover:text-text mb-2 flex items-center gap-1 transition-colors"
              >
                ← All Projects
              </button>
              <h1 className="text-2xl font-bold text-text">{project.title}</h1>
              {project.description && (
                <p className="text-muted mt-1 max-w-xl">{project.description}</p>
              )}
            </div>

            {/* Status + deadline */}
            <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}
              >
                {project.status}
              </span>
              {project.deadline && (
                <span className="text-xs text-muted">
                  📅 Due {new Date(project.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>Overall Progress</span>
              <span className="font-medium text-text">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'Overview' && (
          <OverviewTab project={project} isOwner={isOwner} />
        )}
        {activeTab === 'Tasks' && (
          <TasksTab project={project} user={user} onProgressUpdate={(p) => setProject(prev => ({ ...prev, progress: p }))} />
        )}
        {activeTab === 'Members' && (
          <MembersTab
            project={project}
            user={user}
            isOwner={isOwner}
            onProjectUpdate={setProject}
          />
        )}
        {activeTab === 'Settings' && (
          isOwner ? (
            <SettingsTab
              project={project}
              onProjectUpdate={setProject}
            />
          ) : (
            <PlaceholderTab
              icon="🔒"
              title="No Access"
              description="Only the project owner can access Settings."
            />
          )
        )}
      </div>
    </div>
  )
}


// ── OVERVIEW TAB ─────────────────────────────────────────
function OverviewTab({ project, isOwner }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Left: project details */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text mb-4">Project Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-muted w-24 shrink-0">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[project.status]}`}>
                {project.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted w-24 shrink-0">Owner</span>
              <div className="flex items-center gap-2">
                <Avatar name={project.owner.name} size="sm" />
                <span className="text-text">{project.owner.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted w-24 shrink-0">Members</span>
              <span className="text-text">{project.members.length + 1} people</span>
            </div>
            {project.deadline && (
              <div className="flex items-center gap-3">
                <span className="text-muted w-24 shrink-0">Deadline</span>
                <span className="text-text">
                  {new Date(project.deadline).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-muted w-24 shrink-0">Created</span>
              <span className="text-text">
                {new Date(project.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: member list */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text mb-4">Team</h2>
        <div className="space-y-3">
          {/* Owner */}
          <div className="flex items-center gap-3">
            <Avatar name={project.owner.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{project.owner.name}</p>
              <p className="text-xs text-muted">{project.owner.email}</p>
            </div>
            <span className="text-xs text-primary font-medium bg-primary-light px-2 py-0.5 rounded-full">
              Owner
            </span>
          </div>

          {/* Members */}
          {project.members.map((member) => (
            <div key={member._id} className="flex items-center gap-3">
              <Avatar name={member.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{member.name}</p>
                <p className="text-xs text-muted">{member.email}</p>
              </div>
              <span className="text-xs text-muted">Member</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


// ── MEMBERS TAB ──────────────────────────────────────────
function MembersTab({ project, user, isOwner, onProjectUpdate }) {
  const [emailInput, setEmailInput] = useState('')
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddMember = async () => {
    setAddError('')
    setAddSuccess('')
    const email = emailInput.trim().toLowerCase()
    if (!email) return

    setIsAdding(true)
    try {
      const res = await addMember(project._id, { email })
      onProjectUpdate(res.data) // Update the project in parent state
      setEmailInput('')
      setAddSuccess(`${email} was added to the project.`)
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add member.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return
    try {
      const res = await removeMember(project._id, memberId)
      onProjectUpdate(res.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.')
    }
  }

  return (
    <div className="max-w-2xl">

      {/* Add member — owner only */}
      {isOwner && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-text mb-4">Add a Member</h2>

          {addSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
              ✅ {addSuccess}
            </div>
          )}
          {addError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {addError}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              placeholder="member@example.com"
              className="flex-1 border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <button
              onClick={handleAddMember}
              disabled={isAdding}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
          </div>
          <p className="text-xs text-muted mt-2">
            The person must already have a TaskFlow account.
          </p>
        </div>
      )}

      {/* Member list */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text mb-4">
          Team Members ({project.members.length + 1})
        </h2>
        <div className="space-y-4">
          {/* Owner row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={project.owner.name} />
              <div>
                <p className="font-medium text-text">{project.owner.name}</p>
                <p className="text-sm text-muted">{project.owner.email}</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-primary-light text-primary rounded-full">
              Owner
            </span>
          </div>

          {/* Members */}
          {project.members.length === 0 && (
            <p className="text-muted text-sm py-2">No other members yet.</p>
          )}
          {project.members.map((member) => (
            <div key={member._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={member.name} />
                <div>
                  <p className="font-medium text-text">{member.name}</p>
                  <p className="text-sm text-muted">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">Member</span>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-xs text-danger hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


// ── TASKS TAB ────────────────────────────────────────────
/*
  PRIORITY CONFIG:
  We map each priority level to a color and label used across the task list.
  Storing this as an object at the top makes it easy to add a new priority later.

  STATUS CYCLING:
  Clicking the status button cycles:  todo → in-progress → done → todo
  We use an array and find the next index with modulo (%)
*/
const PRIORITY_CONFIG = {
  low:    { color: 'bg-green-100 text-green-700',  label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
  high:   { color: 'bg-red-100 text-red-700',      label: 'High' },
}

const STATUS_CYCLE = ['todo', 'in-progress', 'done']

const STATUS_STYLE = {
  'todo':        { label: 'Todo',        style: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: 'In Progress', style: 'bg-blue-100 text-blue-700' },
  'done':        { label: 'Done',        style: 'bg-green-100 text-green-700' },
}

function TasksTab({ project, user, onProgressUpdate }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    deadline: '',
  })
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // All team members (owner + members) as options for the assign dropdown
  const allMembers = [project.owner, ...project.members]

  const fetchTasks = async () => {
    try {
      const res = await getTasksByProject(project._id)
      setTasks(res.data)
    } catch (err) {
      console.error('Failed to fetch tasks:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [project._id])

  // Create a new task
  const handleCreateTask = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.title.trim()) {
      setFormError('Task title is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        assignedTo: formData.assignedTo || null,
        deadline: formData.deadline || null,
        projectId: project._id,
      })

      // Add the new task to the local list (no full re-fetch needed)
      setTasks([res.data, ...tasks])

      // Reset the form and hide it
      setFormData({ title: '', description: '', priority: 'medium', assignedTo: '', deadline: '' })
      setShowForm(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cycle the task status: todo → in-progress → done → todo
  const handleCycleStatus = async (task) => {
    const currentIndex = STATUS_CYCLE.indexOf(task.status)
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length]

    try {
      const res = await updateTask(task._id, { status: nextStatus })
      // Update the task in place within the list
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)))
      // The backend has already recalculated project progress — update it in the header
      // We do a quick re-fetch to get the updated progress value
      const projectRes = await getTasksByProject(project._id)
      // Calculate progress from task list
      const all = projectRes.data
      const done = all.filter(t => t.status === 'done').length
      const progress = all.length > 0 ? Math.round((done / all.length) * 100) : 0
      onProgressUpdate(progress)
      setTasks(all)
    } catch (err) {
      alert('Failed to update task status.')
    }
  }

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      const remaining = tasks.filter((t) => t._id !== taskId)
      setTasks(remaining)
      // Recalculate progress from remaining tasks
      const done = remaining.filter(t => t.status === 'done').length
      const progress = remaining.length > 0 ? Math.round((done / remaining.length) * 100) : 0
      onProgressUpdate(progress)
    } catch (err) {
      alert('Failed to delete task.')
    }
  }

  // Group tasks by status for display
  const grouped = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    done: tasks.filter((t) => t.status === 'done'),
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text">Tasks</h2>
          <p className="text-sm text-muted">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {grouped.done.length} done
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormError('') }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          {showForm ? '✕ Cancel' : '+ Add Task'}
        </button>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-text mb-4">New Task</h3>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 mb-4 text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleCreateTask} className="space-y-4">
            {/* Title */}
            <input
              type="text"
              placeholder="Task title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            {/* Description */}
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
            />
            {/* Priority + Assign + Deadline in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Priority */}
              <div>
                <label className="block text-xs text-muted mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              {/* Assign To */}
              <div>
                <label className="block text-xs text-muted mb-1">Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                >
                  <option value="">Unassigned</option>
                  {allMembers.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              {/* Deadline */}
              <div>
                <label className="block text-xs text-muted mb-1">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-border text-muted rounded-lg text-sm hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-14 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-semibold text-text mb-1">No tasks yet</p>
          <p className="text-muted text-sm">Click "Add Task" to create the first task for this project.</p>
        </div>
      )}

      {/* Task groups */}
      {tasks.length > 0 && (
        <div className="space-y-6">
          {STATUS_CYCLE.map((status) => (
            grouped[status].length > 0 && (
              <div key={status}>
                {/* Group header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[status].style}`}>
                    {STATUS_STYLE[status].label}
                  </span>
                  <span className="text-xs text-muted">{grouped[status].length}</span>
                </div>

                {/* Task cards */}
                <div className="space-y-2">
                  {grouped[status].map((task) => (
                    <div
                      key={task._id}
                      className={`bg-surface border rounded-lg px-4 py-3.5 flex items-start gap-3 group transition-shadow hover:shadow-sm ${
                        task.status === 'done' ? 'border-green-200 bg-green-50/30' : 'border-border'
                      }`}
                    >
                      {/* Status toggle button — click to cycle to next status */}
                      <button
                        onClick={() => handleCycleStatus(task)}
                        title={`Click to set: ${STATUS_CYCLE[(STATUS_CYCLE.indexOf(task.status) + 1) % STATUS_CYCLE.length]}`}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                          task.status === 'done'
                            ? 'bg-green-500 border-green-500 text-white'
                            : task.status === 'in-progress'
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {task.status === 'done' && <span className="text-xs">✓</span>}
                        {task.status === 'in-progress' && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                      </button>

                      {/* Task content */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${
                          task.status === 'done' ? 'line-through text-muted' : 'text-text'
                        }`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted mt-0.5 line-clamp-1">{task.description}</p>
                        )}

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {/* Priority badge */}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            PRIORITY_CONFIG[task.priority]?.color || 'bg-gray-100 text-gray-600'
                          }`}>
                            {PRIORITY_CONFIG[task.priority]?.label}
                          </span>

                          {/* Assigned to */}
                          {task.assignedTo && (
                            <span className="text-xs text-muted flex items-center gap-1">
                              <Avatar name={task.assignedTo.name} size="sm" />
                              {task.assignedTo.name}
                            </span>
                          )}

                          {/* Deadline */}
                          {task.deadline && (
                            <span className="text-xs text-muted">
                              📅 {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete button — only shows on hover */}
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none shrink-0 mt-0.5"
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}


// ── PLACEHOLDER TAB ──────────────────────────────────────
function PlaceholderTab({ icon, title, description }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-16 text-center max-w-md mx-auto">
      <p className="text-4xl mb-3">{icon}</p>
      <p className="text-lg font-semibold text-text mb-1">{title}</p>
      <p className="text-muted">{description}</p>
    </div>
  )
}


// ── SETTINGS TAB ─────────────────────────────────────────
/*
  This tab has two sections:
  1. Edit Project — update title, description, deadline, status
  2. Danger Zone — delete the project (irreversible)

  WHY A SEPARATE 'saved' STATE INSTEAD OF JUST CLEARING THE ERROR?
  After a successful save, we want to show a brief success message so
  the user knows the form submitted. A 'saved' boolean is cleaner than
  showing/hiding the error div with a success message inside it.

  DANGER ZONE PATTERN:
  We use a two-step confirmation:
  1. User clicks "Delete Project" → a warning message appears with a confirm button
  2. User clicks "Yes, delete it" → actual deletion fires
  This prevents accidental deletes from a single misclick.
*/
function SettingsTab({ project, onProjectUpdate }) {
  const navigate = useNavigate()

  // Pre-populate form with current project values
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    deadline: project.deadline
      ? new Date(project.deadline).toISOString().split('T')[0] // Format as YYYY-MM-DD for <input type="date">
      : '',
    status: project.status,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSaved(false) // Clear the "saved" banner when user edits again
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaved(false)

    if (!formData.title.trim()) {
      setSaveError('Project title cannot be empty.')
      return
    }

    setIsSaving(true)
    try {
      const res = await updateProject(project._id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline || null,
        status: formData.status,
      })

      // Update the project in the parent component so the header reflects the new title/status
      onProjectUpdate(res.data)
      setSaved(true)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(project._id)
      navigate('/projects') // Redirect after deletion — project no longer exists
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── EDIT PROJECT SECTION ── */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-text mb-5">Project Settings</h2>

        {/* Success banner */}
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
            ✅ Changes saved successfully.
          </div>
        )}

        {/* Error banner */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Project Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
              placeholder="What is this project about?"
            />
          </div>

          {/* Deadline + Status in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ── DANGER ZONE ── */}
      <div className="bg-surface border border-red-200 rounded-xl p-6">
        <h2 className="font-semibold text-danger mb-1">Danger Zone</h2>
        <p className="text-sm text-muted mb-5">
          These actions are permanent and cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="border border-danger text-danger px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Delete this project
          </button>
        ) : (
          /* Two-step confirmation — prevents accidental deletes */
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-medium text-danger mb-1">Are you absolutely sure?</p>
            <p className="text-sm text-muted mb-4">
              This will permanently delete <strong>{project.title}</strong> and all its tasks.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-danger text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete it'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="border border-border text-muted px-5 py-2 rounded-lg text-sm hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}


export default ProjectWorkspace

