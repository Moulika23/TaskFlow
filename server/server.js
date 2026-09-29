/*
  server.js — Entry point for TaskFlow Express Server

  SUMMARY OF SERVER WORKFLOW:
  1. Load environment variables (.env)
  2. Validate required env variables (FAIL EARLY if missing)
  3. Connect to MongoDB (config/db.js)
  4. Initialize Express & apply middleware (CORS, JSON parser)
  5. Mount API routes (/api/auth, /api/projects, /api/tasks, /api/users)
  6. Mount global error middleware (404 and errorHandler)
  7. Start listening on PORT (5000)
*/

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

// Load environment variables from .env file
dotenv.config()

// ─────────────────────────────────────────────
// ENVIRONMENT VARIABLE VALIDATION
// Fail-fast principle: If essential credentials/secrets are missing,
// shut down immediately with a helpful error message instead of failing cryptically later.
// ─────────────────────────────────────────────
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET']
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key])

if (missingEnvVars.length > 0) {
  console.error(
    `❌ FATAL ERROR: Missing environment variables: ${missingEnvVars.join(', ')}`
  )
  console.error(`Please check your server/.env file. Aborting server start.`)
  process.exit(1) // Exit process with failure code 1
}

// Connect to MongoDB Database
connectDB()

const app = express()

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
// CORS: Allows frontend (running on localhost:5173) to communicate with backend
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)

// JSON Body Parser: Parses incoming JSON payloads in req.body
app.use(express.json())

// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/projects', require('./routes/projectRoutes'))
app.use('/api/tasks', require('./routes/taskRoutes'))
app.use('/api/users', require('./routes/userRoutes'))

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// ─────────────────────────────────────────────
// ERROR HANDLING MIDDLEWARE
// Must be registered AFTER all routes
// ─────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})
