/*
  pages/Dashboard/Dashboard.jsx — The home page after login

  WHAT THIS PAGE SHOWS:
  1. A welcome message with the user's name
  2. Three stat cards: Total / Created / Joined project counts
  3. A list of the 4 most recent projects (quick access)

  DATA FLOW:
  1. On mount (useEffect), fetch all projects from the API
  2. Store them in local state with useState
  3. Calculate stats from the fetched data using simple .filter() + .length
  4. Render everything

  WHY NOT FETCH STATS FROM THE BACKEND?
  For a project this size, it's simpler to fetch all projects once
  and calculate counts client-side with JavaScript. The backend already
  returns projects filtered to the current user, so the data is right there.
  At huge scale (thousands of projects) you'd want backend aggregation,
  but that's overkill here.
*/

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProjects } from '../../services/api'
import Navbar from '../../components/Navbar'
import Avatar from '../../components/Avatar'

// Status badge colors
const STATUS_COLORS = {
  planning: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  'on-hold': 'bg-orange-100 text-orange-700',
  completed: 'bg-blue-100 text-blue-700',
}

function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects()
        setProjects(res.data)
      } catch (error) {
        console.error('Failed to load projects:', error.message)
      } finally {
        // 'finally' runs whether the try succeeded or the catch ran
        // Always stop the loading spinner after the fetch attempt
        setLoading(false)
      }
    }

    fetchProjects()
  }, []) // Empty array = run once when component mounts

  // Calculate stats from the fetched data — plain JavaScript, no backend needed
  const totalCount = projects.length
  const createdCount = projects.filter(
    (p) => p.owner._id === user?.id || p.owner._id?.toString() === user?.id
  ).length
  const joinedCount = totalCount - createdCount

  // Overall progress: average of all project progress values
  const overallProgress =
    totalCount > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalCount)
      : 0

  // Show only the 4 most recent projects (API already returns newest first)
  const recentProjects = projects.slice(0, 4)

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── WELCOME HEADER ── */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text">
            Good to see you, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted mt-1">
            Here's a summary of your work across all projects.
          </p>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Projects" value={totalCount} icon="📁" />
          <StatCard label="Created by You" value={createdCount} icon="✏️" />
          <StatCard label="Joined" value={joinedCount} icon="👥" />
          <StatCard label="Overall Progress" value={`${overallProgress}%`} icon="📊" />
        </div>

        {/* ── RECENT PROJECTS ── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-text">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-sm text-primary font-medium hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          /* EMPTY STATE — shown when user has no projects yet */
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg font-semibold text-text mb-1">No projects yet</p>
            <p className="text-muted mb-6">Create your first project to get started.</p>
            <Link
              to="/projects/new"
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Create a project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project._id} project={project} userId={user?.id} />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

// ── STAT CARD COMPONENT ──────────────────────────────────
// Small component defined in the same file since it's only used here
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-sm text-muted mt-0.5">{label}</p>
    </div>
  )
}

// ── PROJECT CARD COMPONENT ───────────────────────────────
function ProjectCard({ project, userId }) {
  const isOwner = project.owner._id === userId || project.owner._id?.toString() === userId

  return (
    <Link
      to={`/projects/${project._id}`}
      className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-shadow block"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-text line-clamp-1">{project.title}</h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ml-2 ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}
        >
          {project.status}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-muted mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer row: members + role badge */}
      <div className="flex items-center justify-between">
        {/* Stacked member avatars */}
        <div className="flex -space-x-2">
          {/* Show the owner first */}
          <Avatar name={project.owner.name} size="sm" />
          {/* Then up to 2 members */}
          {project.members.slice(0, 2).map((member) => (
            <Avatar key={member._id} name={member.name} size="sm" />
          ))}
          {/* "+N more" indicator */}
          {project.members.length > 2 && (
            <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-muted font-medium">
              +{project.members.length - 2}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          {project.deadline && (
            <span>📅 {new Date(project.deadline).toLocaleDateString()}</span>
          )}
          <span className={isOwner ? 'text-primary font-medium' : ''}>
            {isOwner ? 'Owner' : 'Member'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default Dashboard
