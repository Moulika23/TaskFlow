# ⚡ TaskFlow — Full-Stack MERN Project Management Platform

TaskFlow is a modern, responsive project management web application built using the **MERN** stack (MongoDB, Express.js, React, Node.js). Designed for teams and individuals to organize work, track progress, collaborate with team members, and manage task workflows smoothly.

![TaskFlow Tech Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## ✨ Features

- 🔐 **Authentication & Authorization**: Secure User Registration and Login using JWT (JSON Web Tokens) and `bcryptjs` password hashing. Protected routes across both frontend and backend API.
- 📁 **Project Workspace**: Create, update, and manage projects with titles, descriptions, status tags (`planning`, `active`, `on-hold`, `completed`), and deadlines.
- 👥 **Team Collaboration**: Invite existing registered users to projects by email. Automatic linking of shared project access across member accounts.
- ✅ **Task Management**: Create, prioritize (`low`, `medium`, `high`), assign, and cycle tasks through statuses (`todo` ➔ `in-progress` ➔ `done`).
- 📊 **Dynamic Progress Auto-Calculation**: Automatic recalculation of overall project completion percentage based on task completion status math: `(completed / total) * 100`.
- ⚙️ **Project Settings & Danger Zone**: Owner-only controls to edit project metadata or permanently delete projects with 2-step safety confirmations and cascade deletion of associated tasks.
- 👤 **User Profile Management**: Update display name, view registered email, and change passwords with current password verification.
- 🛡️ **Robust Error Handling**: Production-ready global error middleware handling Mongoose `CastError` (invalid ObjectIDs), 404 route fallbacks, environment variable validation, and toast notification alerts.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)** — Fast, component-driven Single Page Application (SPA).
- **React Router DOM v6** — Declarative client-side routing with `PrivateRoute` security guards.
- **Axios** — Centralized HTTP client configured with request interceptors for automatic JWT header attachment.
- **Tailwind CSS v4** — Modern utility-first styling with dark/light background tokens and responsive grid layouts.
- **Context API** — Lightweight state management using `AuthContext` (session state) and `ToastContext` (notifications).

### Backend
- **Node.js & Express.js** — RESTful API architecture.
- **MongoDB & Mongoose** — Document-oriented local database with schema models, `.populate()` reference joins, and `$or` query filtering.
- **JWT (jsonwebtoken)** — Stateless authentication using Bearer tokens.
- **Bcryptjs** — 10-round salted password hashing.
- **Nodemon** — Automated server auto-reloading during development.

---

## 📂 Project Structure

```text
Taskflow/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, GetMe
│   │   ├── projectController.js  # Project CRUD & Member Management
│   │   ├── taskController.js     # Task CRUD & Progress Recalculation
│   │   └── userController.js     # Profile & Password Management
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer Token verification
│   │   └── errorMiddleware.js    # Global 404 & Mongoose CastError handling
│   ├── models/
│   │   ├── User.js               # User Schema
│   │   ├── Project.js            # Project Schema (Owner & Members ref)
│   │   └── Task.js               # Task Schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── projectRoutes.js      # /api/projects routes
│   │   ├── taskRoutes.js         # /api/tasks routes
│   │   └── userRoutes.js         # /api/users routes
│   ├── .env                      # Environment Variables
│   ├── package.json
│   └── server.js                 # Express App entry point
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Avatar.jsx        # Deterministic initials avatar
    │   │   ├── Navbar.jsx        # Authenticated global navigation
    │   │   ├── PrivateRoute.jsx  # Auth guard component
    │   │   ├── Skeleton.jsx      # Shimmer loading placeholders
    │   │   └── Toast.jsx         # Global notifications
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Global User Authentication State
    │   │   └── ToastContext.jsx  # Notification Trigger Context
    │   ├── pages/
    │   │   ├── Landing/          # Public landing page
    │   │   ├── Login/            # Login form
    │   │   ├── Register/         # Account registration
    │   │   ├── Dashboard/        # User dashboard & summary statistics
    │   │   ├── Projects/         # All projects grid + search & filters
    │   │   ├── CreateProject/    # Project creation form with tag invites
    │   │   ├── ProjectWorkspace/ # Tabbed view (Overview, Tasks, Members, Settings)
    │   │   ├── Profile/          # Profile & password settings
    │   │   └── NotFound/         # 404 Fallback page
    │   ├── services/
    │   │   └── api.js            # Axios instance & API wrapper functions
    │   ├── App.jsx               # Routes setup & provider wrapping
    │   └── main.jsx
    └── package.json
```

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on `127.0.0.1:27017`

---

### 1. Environment Setup

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

### 2. Backend Setup & Run

Open a terminal window and run:

```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Start backend server with nodemon auto-reload
npm run dev
```

The server will start on `http://localhost:5000` and log:
```text
Server running in development mode on port 5000
MongoDB connected: 127.0.0.1
```

---

### 3. Frontend Setup & Run

Open a second terminal window and run:

```bash
# Navigate to the client folder
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The client will start on `http://localhost:5173`. Open your browser and navigate to **`http://localhost:5173`**.

---

## 📡 API Endpoint Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user & return JWT token |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials & return JWT token |
| `GET` | `/api/auth/me` | Private | Fetch logged-in user profile details |

### Projects (`/api/projects`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Private | Get all projects where user is owner or member |
| `POST` | `/api/projects` | Private | Create a new project |
| `GET` | `/api/projects/:id` | Private | Get detailed project by ID |
| `PUT` | `/api/projects/:id` | Owner Only | Update project details |
| `DELETE` | `/api/projects/:id` | Owner Only | Delete project & all associated tasks |
| `POST` | `/api/projects/:id/members` | Owner Only | Add team member by email |
| `DELETE` | `/api/projects/:id/members/:userId` | Owner Only | Remove member from project |

### Tasks (`/api/tasks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tasks/:projectId` | Private | Get all tasks belonging to a project |
| `POST` | `/api/tasks` | Private | Create a new task & update project progress |
| `PUT` | `/api/tasks/:id` | Private | Update task details/status & recalculate progress |
| `DELETE` | `/api/tasks/:id` | Private | Delete a task & recalculate project progress |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `PUT` | `/api/users/:id` | Self Only | Update logged-in user display name |
| `PUT` | `/api/users/:id/password` | Self Only | Change password with current password verification |

---

## 💡 Key Architectural & Interview Takeaways

1. **Explicit Architecture**: Kept business logic readable, linear, and easy to explain line-by-line without over-engineered abstractions.
2. **Stateless JWT Flow**: Handled authentication using signed tokens. Included client-side storage with an Axios Request Interceptor for clean API authorization headers.
3. **Cascading Cleanups**: Deleting a project triggers cascading cleanup, removing task documents (`Task.deleteMany`) and references in user documents (`$pull`).
4. **Resilient Error Handling**: Centralized error middleware traps invalid MongoDB ObjectIDs (`CastError`), returning standard 400 Bad Request responses instead of crashing the server.

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
