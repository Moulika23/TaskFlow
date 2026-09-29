/*
  config/db.js — Database connection logic.
  
  What this file does:
  - Connects to our MongoDB Atlas database using Mongoose
  - If the connection fails, it logs the error and stops the server
  
  WHY PUT THIS IN A SEPARATE FILE?
  We could write this code directly in server.js, but separating it
  keeps server.js clean. Also, if we ever switch databases, we only
  change this one file.
  
  WHY process.exit(1) ON FAILURE?
  If the database doesn't connect, our entire app is broken — every
  request that touches the DB will fail. It's better to crash loudly
  and immediately so the developer (or deployment platform) knows something is wrong,
  rather than silently running a broken server.
  
  process.exit(1) means "exit with an error code" (1 = error, 0 = success).
*/

const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB connected: ${connection.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    process.exit(1) // Stop the server — there's no point running without a DB
  }
}

module.exports = connectDB
