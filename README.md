# TaskFlow — Client Task Management System

<div align="center">

![TaskFlow Banner](docs/screenshots/dashboard.png)

**A secure, full-stack task management system built for teams.**  
Role-based access control · Smart Insights · Manager-controlled onboarding

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://task-flow-fronted.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://taskflow-backend-ynxi.onrender.com/api/health)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://cloud.mongodb.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Role Hierarchy](#-role-hierarchy)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Security](#-security)

---

## 🧠 Overview

TaskFlow is an internal team task management system designed to replicate real-world enterprise workflows. It features a strict role-based access control (RBAC) system where only managers can onboard new team members — no public self-registration. Smart Insights automatically analyze task patterns to surface project health, overdue alerts, and workload imbalances.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🌐 Frontend | https://task-flow-fronted.vercel.app |
| 🔧 Backend API | https://taskflow-backend-ynxi.onrender.com/api/health |

> **Note:** The backend is hosted on Render's free tier and may take ~30 seconds to wake up after inactivity.

---

## ✨ Features

### 🔐 Secure Authentication
- Login-only system — no public registration
- JWT-based authentication (7-day expiry)
- Passwords hashed with bcryptjs (10 salt rounds)
- All accounts created and managed by managers only

### 👥 Role-Based Access Control (RBAC)
- 4-tier role hierarchy enforced on both frontend and backend
- Route-level middleware protection
- UI conditionally renders based on role (no security through obscurity)

### ✅ Task Management
- Create, edit, delete tasks (role-restricted)
- Assign tasks to team members
- Set priority (Low / Medium / High) and deadlines
- Status tracking: Pending → In Progress → Done
- Overdue task detection and alerts

### 📊 Dashboard
- Real-time task statistics (Total, Completed, In Progress, Pending, Overdue)
- Completion rate progress bar
- Deadline alerts and high-priority warnings

### 🧠 Smart Insights
- Project health scoring
- Overdue task detection
- Workload imbalance analysis
- Completion rate trends

### 👨‍💼 Team Management (Manager+)
- Create user accounts with custom email/password
- Assign roles at account creation
- Promote/demote team members inline
- Remove team members (Super Manager only)

---

## 🏛️ Role Hierarchy

```
⭐ Super Manager  →  Full control. Promotes to Manager. Deletes accounts.
🔑 Manager        →  Creates developers. Promotes to Lead. Full task CRUD.
👨‍🏫 Lead           →  Creates & edits tasks. No user management.
👨‍💻 Developer      →  Updates status of own assigned tasks only.
```

| Permission | Developer | Lead | Manager | Super Manager |
|------------|:---------:|:----:|:-------:|:-------------:|
| View tasks | ✅ | ✅ | ✅ | ✅ |
| Update own task status | ✅ | ✅ | ✅ | ✅ |
| Create tasks | ❌ | ✅ | ✅ | ✅ |
| Edit any task | ❌ | ✅ | ✅ | ✅ |
| Delete tasks | ❌ | ❌ | ✅ | ✅ |
| Create user accounts | ❌ | ❌ | ✅ (developer only) | ✅ (any role) |
| Promote to Lead | ❌ | ❌ | ✅ | ✅ |
| Promote to Manager | ❌ | ❌ | ❌ | ✅ |
| Delete accounts | ❌ | ❌ | ❌ | ✅ |

---

## 📸 Screenshots

### Login Page
![Login](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Tasks Page — Manager View
![Tasks Manager](docs/screenshots/tasks_manager.png)

### Tasks Page — Developer View
![Tasks Developer](docs/screenshots/tasks_developer.png)

### Smart Insights
![Insights](docs/screenshots/insights.png)

### Team Management
![Team](docs/screenshots/team.png)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| CORS | Cross-origin security |
| dotenv | Environment config |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptor |
| Vanilla CSS | Custom glassmorphism design |

### Infrastructure
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database (free tier) |
| Render | Backend hosting (free tier) |
| Vercel | Frontend hosting (free tier) |
| GitHub | Source control & CI/CD |

---

## 📁 Project Structure

```
TaskFlow/
├── server/                     # Backend (Node.js + Express)
│   ├── controllers/
│   │   ├── authController.js   # Login, create user, promote, delete
│   │   ├── taskController.js   # Task CRUD with RBAC
│   │   └── insightController.js# Smart insights logic
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   └── checkRole.js        # RBAC role enforcement
│   ├── models/
│   │   ├── User.js             # User schema (4 roles)
│   │   └── Task.js             # Task schema
│   ├── routes/
│   │   ├── auth.js             # Auth routes
│   │   ├── tasks.js            # Task routes
│   │   └── insights.js         # Insight routes
│   ├── app.js                  # Express app entry point
│   ├── .env                    # Environment variables (gitignored)
│   └── package.json
│
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     # Navigation (role-aware)
│   │   │   ├── TaskModal.jsx   # Create/Edit task modal
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state + login/logout
│   │   └── pages/
│   │       ├── Login.jsx       # Login page
│   │       ├── Dashboard.jsx   # Stats + alerts
│   │       ├── Tasks.jsx       # Task table (RBAC-aware UI)
│   │       ├── Insights.jsx    # Smart insights
│   │       └── Team.jsx        # User management (manager+)
│   ├── .env                    # Frontend env (gitignored)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally or MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/sujalkumarchoudhary/TaskFlow.git
cd TaskFlow
```

### 2. Setup the Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task_management
JWT_SECRET=your_64_char_random_secret_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

### 5. Create your first Super Manager
Since there's no public registration, seed the first account:
```bash
cd server
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hash = await bcrypt.hash('Admin@123', 10);
  await mongoose.connection.collection('users').insertOne({
    name: 'Super Admin', email: 'admin@taskflow.com',
    password: hash, role: 'super_manager',
    createdAt: new Date(), updatedAt: new Date()
  });
  console.log('Done!');
  mongoose.disconnect();
});
"
```

Login with `admin@taskflow.com` / `Admin@123`, then create all other accounts from the **Team** page.

---

## 🔑 Environment Variables

### Backend (`server/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | 64-char random secret | `openssl rand -hex 64` |
| `CLIENT_URL` | Frontend URL (for CORS) | `https://your-app.vercel.app` |
| `NODE_ENV` | Environment | `production` |

### Frontend (`client/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://your-backend.onrender.com/api` |

---

## 📡 API Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/login` | ❌ | — | Login with email + password |
| `GET` | `/me` | ✅ | Any | Get current user |
| `POST` | `/create-user` | ✅ | Manager+ | Create new user account |
| `PUT` | `/promote/:id` | ✅ | Manager+ | Change user's role |
| `DELETE` | `/users/:id` | ✅ | Super Manager | Delete user account |

### Task Routes (`/api/tasks`)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/` | ✅ | Any | Get all tasks |
| `GET` | `/users` | ✅ | Any | Get all users (for assignment) |
| `POST` | `/` | ✅ | Lead+ | Create task |
| `PUT` | `/:id` | ✅ | Any* | Update task (*devs: status only on own tasks) |
| `DELETE` | `/:id` | ✅ | Manager+ | Delete task |

### Insight Routes (`/api/insights`)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/` | ✅ | Any | Get smart insights |

---

## 🚢 Deployment

See the full guide: [Production Deployment Guide](docs/deployment.md)

**Quick summary:**
1. **MongoDB Atlas** — cloud database (free tier)
2. **Render** — deploy `server/` as a Web Service
3. **Vercel** — deploy `client/` with Vite preset

Set `CLIENT_URL` on Render to your Vercel URL, and `VITE_API_URL` on Vercel to your Render URL.

---

## 🔒 Security

- ✅ No public registration — accounts created only by managers
- ✅ Passwords hashed with bcryptjs (salt rounds: 10)
- ✅ JWT authentication with 7-day expiry
- ✅ RBAC enforced on **both** frontend and backend
- ✅ CORS locked to specific origin (not `*`)
- ✅ `.env` files gitignored — no secrets in version control
- ✅ Password never returned in any API response
- ✅ Mongoose schema enums prevent invalid roles/statuses
- ✅ Self-demotion/self-deletion protection

---

## 👤 Author

**Sujal Kumar Choudhary**  
GitHub: [@sujalkumarchoudhary](https://github.com/sujalkumarchoudhary)

---

## 📄 License

This project is licensed under the ISC License.
