/*
  middleware/errorMiddleware.js — Centralized Error Handling

  WHAT IS A GLOBAL ERROR HANDLER IN EXPRESS?
  An error-handling middleware in Express is defined with FOUR parameters:
    (err, req, res, next) => { ... }
  Express recognizes a function with 4 arguments as an error handler.

  WHY IS THIS GOOD FOR INTERVIEWS?
  Instead of duplicating try/catch formatting or sending ugly 500 HTML stacks
  when Mongoose fails to parse an ObjectId (CastError), this middleware:
    1. Intercepts CastError (e.g. invalid MongoDB ID format) and returns a clean 400
    2. Catches unhandled 404 routes
    3. Guarantees every API error response returns a consistent JSON object:
       { message: "..." }
*/

// Middleware for handling non-existent API routes (404)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Global error handler for catching thrown errors or errors passed to next(err)
const errorHandler = (err, req, res, next) => {
  // Default status code: 500 (Internal Server Error) unless a custom status was set
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message || 'Server error'

  // Handle Mongoose CastError (e.g. invalid ObjectId format like /api/projects/123)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400
    message = 'Invalid ID format'
  }

  // Handle duplicate key error (MongoDB error code 11000)
  if (err.code === 11000) {
    statusCode = 400
    message = 'Duplicate field value entered'
  }

  console.error(`Error [${statusCode}]: ${message}`)

  res.status(statusCode).json({
    message,
    // Only include stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
}

module.exports = { notFound, errorHandler }
