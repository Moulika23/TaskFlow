/*
  pages/Projects/Projects.jsx — Full list of all projects for the logged-in user

  Similar to Dashboard but shows ALL projects (not just 4) in a larger grid.
  Also has a search/filter bar and a prominent "New Project" button.
*/

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProjects } from '../../services/api'
import Navbar from '../../components/Navbar'
import Avatar from '../../components/Avatar'
import { CardSkeleton } from '../../components/Skeleton'

const STATUS_COLORS = {
  planning: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  'on-hold': 'bg-orange-100 text-orange-700',
  completed: 'bg-blue-100 text-blue-700',
}

function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')   // Search input value
  const [filter, setFilter] = useState('all') // 'all' | 'mine' | 'joined'

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects()
        setProjects(res.data)
      } catch (error) {
        console.error('Failed to load projects:', error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // Filter projects based on search text and the active filter tab
  const filteredProjects = projects.filter((project) => {
    // Search filter: match title or description
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase())

    // Tab filter
    const isOwner = project.owner._id === user?.id || project.owner._id?.toString() === user?.id
    const matchesFilter =
      filter === 'all' ||
      (filter === 'mine' && isOwner) ||
      (filter === 'joined' && !isOwner)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── PAGE HEADER ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Projects</h1>
            <p className="text-muted mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link
            to="/projects/new"
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <span>+</span> New Project
          </Link>
        </div>

        {/* ── SEARCH + FILTER BAR ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search input */}
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-surface"
          />

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['all', 'mine', 'joined'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  filter === tab
                    ? 'bg-surface text-text shadow-sm'
                    : 'text-muted hover:text-text'
                }`}
              >
                {tab === 'mine' ? 'Created by me' : tab === 'joined' ? 'Joined' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* ── PROJECTS GRID ── */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 text-center">
            {projects.length === 0 ? (
              <>
                <p className="text-4xl mb-3">📋</p>
                <p className="text-lg font-semibold text-text mb-1">No projects yet</p>
                <p className="text-muted mb-6">Create your first project to get started.</p>
                <Link
                  to="/projects/new"
                  className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Create a project
                </Link>
              </>
            ) : (
              <>
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-lg font-semibold text-text mb-1">No results found</p>
                <p className="text-muted">Try a different search or filter.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} userId={user?.id} />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

// ── PROJECT CARD ─────────────────────────────────────────
function ProjectCard({ project, userId }) {
  const isOwner = project.owner._id === userId || project.owner._id?.toString() === userId
  const memberCount = project.members.length + 1 // +1 for owner

  return (
    <Link
      to={`/projects/${project._id}`}
      className="bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all block"
    >
      {/* Status badge + Owner indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}
        >
          {project.status}
        </span>
        {isOwner && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-light text-primary">
            Owner
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-text text-lg mb-1 line-clamp-1">{project.title}</h3>

      {/* Description */}
      <p className="text-sm text-muted mb-4 line-clamp-2 min-h-[2.5rem]">
        {project.description || 'No description provided.'}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>Progress</span>
          <span className="font-medium text-text">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        {/* Stacked avatars */}
        <div className="flex -space-x-2">
          <Avatar name={project.owner.name} size="sm" />
          {project.members.slice(0, 3).map((m) => (
            <Avatar key={m._id} name={m.name} size="sm" />
          ))}
          {project.members.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-muted font-medium">
              +{project.members.length - 3}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span>👤 {memberCount}</span>
          {project.deadline && (
            <span>📅 {new Date(project.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default Projects
