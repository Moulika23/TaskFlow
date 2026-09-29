/*
  services/api.js — Configured Axios instance for all backend calls

  WHAT IS AN AXIOS INSTANCE?
  Instead of using the raw axios library everywhere, we create a customised
  version with axios.create(). This lets us set:
    - baseURL: so we only write '/auth/login' instead of the full URL everywhere
    - interceptors: code that runs on every request or response automatically

  WHAT IS AN INTERCEPTOR?
  An interceptor is like middleware but for the frontend — it runs before
  a request is sent. We use it to attach the JWT token to every request
  automatically. Without it, we'd have to manually write:
    axios.get('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
  ...on every single API call. The interceptor does this once for all calls.
*/

import axios from 'axios'

// Create our custom axios instance
// baseURL: '/api' means all requests will go to /api/...
// Since we set up a Vite proxy in vite.config.js, /api requests are
// automatically forwarded to http://localhost:5000/api
const api = axios.create({
  baseURL: '/api',
})

// REQUEST INTERCEPTOR
// This function runs automatically before every single request we make
api.interceptors.request.use((config) => {
  // Read the token from localStorage
  const token = localStorage.getItem('token')

  // If a token exists, attach it to the Authorization header
  // The backend's authMiddleware reads this header to verify the user
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config // Return the modified config so axios can send the request
})

export default api

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')

// ─────────────────────────────────────────────
// PROJECTS (Phase 5)
// ─────────────────────────────────────────────
export const getProjects = () => api.get('/projects')
export const getProjectById = (id) => api.get(`/projects/${id}`)
export const createProject = (data) => api.post('/projects', data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)
export const addMember = (id, data) => api.post(`/projects/${id}/members`, data)
export const removeMember = (id, userId) => api.delete(`/projects/${id}/members/${userId}`)

// ─────────────────────────────────────────────
// TASKS (Phase 7)
// ─────────────────────────────────────────────
export const getTasksByProject = (projectId) => api.get(`/tasks/${projectId}`)
export const createTask = (data) => api.post('/tasks', data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)

// ─────────────────────────────────────────────
// USERS (Phase 9)
// ─────────────────────────────────────────────
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const changePassword = (id, data) => api.put(`/users/${id}/password`, data)
