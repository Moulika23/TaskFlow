/*
  models/User.js — The User schema (blueprint for a user in MongoDB)

  WHAT IS A SCHEMA?
  Think of a schema like a form template. It defines what fields a user document
  can have, what type each field is, and whether each field is required.
  Mongoose will reject any data that doesn't match this shape.

  WHAT IS A MODEL?
  A model is the actual tool we use to interact with the database.
  mongoose.model('User', userSchema) creates a User model that gives us methods like:
    User.find()         → find all users
    User.findById(id)   → find one user by their _id
    User.create(data)   → create a new user document
    user.save()         → save changes to an existing user

  WHY IS THE PASSWORD NOT HASHED HERE?
  Hashing happens in the controller (authController.js) before we save the user.
  We keep the schema simple — it just stores whatever password string we give it.
  The controller is responsible for making sure that string is always a hash.
*/

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Mongoose will throw an error if name is missing
      trim: true,     // Removes leading/trailing whitespace automatically
    },

    email: {
      type: String,
      required: true,
      unique: true,   // MongoDB creates an index to ensure no two users share an email
      lowercase: true, // Stores email as lowercase so "User@Test.com" == "user@test.com"
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Avatar stores either a URL (from an external image) or a file path
    // (for locally uploaded profile pictures via Multer in Phase 9)
    avatar: {
      type: String,
      default: '', // Empty string means no avatar set yet
    },

    // These arrays store the MongoDB ObjectIDs of projects this user owns or joined.
    // "ref: 'Project'" tells Mongoose "this ID refers to a document in the Project collection"
    // This lets us use .populate() later to automatically fill in the full project data.
    projectsCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],

    projectsJoined: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
  },
  {
    // timestamps: true automatically adds two fields:
    //   createdAt — when the document was first created
    //   updatedAt — the last time the document was modified
    // Mongoose manages these for us — we never set them manually.
    timestamps: true,
  }
)

// mongoose.model() compiles the schema into a Model class.
// The first argument 'User' is the model name.
// Mongoose will automatically look for (or create) a collection called 'users' (lowercase plural).
const User = mongoose.model('User', userSchema)

module.exports = User
