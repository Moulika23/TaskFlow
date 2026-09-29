/*
  pages/CreateProject/CreateProject.jsx — Form to create a new project

  MEMBER INVITE APPROACH:
  We use a simple "add one at a time" pattern:
  - User types an email into an input and clicks "Add"
  - We display added emails as removable tags
  - On form submit, we send the final array of emails to the backend
  This is simpler than a comma-separated input and easier to validate.

  FORM STATE:
  'formData' holds the core fields.
  'memberEmail' is a separate state just for the current email being typed.
  'memberEmails' is the final list of emails that have been confirmed.
*/

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../../services/api'
import Navbar from '../../components/Navbar'

function CreateProject() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  })

  const [memberEmail, setMemberEmail] = useState('')   // Current email being typed
  const [memberEmails, setMemberEmails] = useState([]) // Confirmed email list
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Add the typed email to the list
  const handleAddEmail = () => {
    setEmailError('')
    const email = memberEmail.trim().toLowerCase()

    if (!email) return

    // Basic email format check — just look for @ and a dot after it
    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email address.')
      return
    }

    if (memberEmails.includes(email)) {
      setEmailError('This email has already been added.')
      return
    }

    setMemberEmails([...memberEmails, email])
    setMemberEmail('') // Clear the input after adding
  }

  // Allow pressing Enter in the email field to add it
  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Don't submit the whole form
      handleAddEmail()
    }
  }

  const handleRemoveEmail = (emailToRemove) => {
    setMemberEmails(memberEmails.filter((e) => e !== emailToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Project title is required.')
      return
    }

    setIsLoading(true)

    try {
      const res = await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline || null,
        memberEmails: memberEmails,
      })

      // Redirect to the newly created project's workspace
      navigate(`/projects/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Create New Project</h1>
          <p className="text-muted mt-1">
            Fill in the details below to set up your project.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-xl p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text mb-1.5">
                Project Title <span className="text-danger">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Company Website Redesign"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is this project about? What are the goals?"
                rows={3}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
              />
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-text mb-1.5">
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Invite Members by Email */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Invite Members
                <span className="text-muted font-normal ml-1">(optional — add by email)</span>
              </label>

              {/* Email input + Add button */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="teammate@example.com"
                  className="flex-1 border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="bg-primary-light text-primary font-medium px-4 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  Add
                </button>
              </div>

              {emailError && (
                <p className="text-red-600 text-xs mt-1.5">{emailError}</p>
              )}

              {/* Added email tags */}
              {memberEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {memberEmails.map((email) => (
                    <span
                      key={email}
                      className="flex items-center gap-1.5 bg-primary-light text-primary text-sm px-3 py-1 rounded-full"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="hover:text-danger transition-colors font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted mt-2">
                Members must already have a TaskFlow account. They'll see this project after logging in.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-5 py-2.5 border border-border rounded-lg text-muted hover:text-text hover:border-text transition-colors"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}

export default CreateProject
