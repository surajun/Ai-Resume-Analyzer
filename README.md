# 🤖 AI Resume Analyzer & Job Match Platform

A full-stack AI-powered platform that analyzes resumes against job descriptions, calculates ATS match scores, and generates actionable improvement suggestions using GPT-4o-mini via OpenRouter API.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-black?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-GPT--4o--mini-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Overview

This system allows users to upload their resume and a target job description. The platform extracts text from the resume, analyzes it against the job description using AI, compares skills, calculates a realistic match score, and returns personalized improvement suggestions — all stored in a structured database for future reference.

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based auth with bcrypt password hashing
- 📄 **Resume Parsing** — Supports PDF and DOCX formats using `pdf-parse` and `mammoth`
- 🤖 **AI-Powered Analysis** — Uses OpenRouter API (GPT-4o-mini) to extract skills and calculate match scores
- 📊 **Match Score Visualization** — Real-time animated score circle with progress indicators
- ✅ **Skill Gap Analysis** — Clearly shows matched vs missing skills
- 💡 **Smart Suggestions** — AI-generated, actionable resume improvement tips
- 🕒 **Analysis History** — Tracks and displays all past resume analyses per user
- 🛡️ **Production-Grade Security** — Parameterized SQL queries, input validation, CORS protection

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Axios, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **AI Integration** | OpenRouter API → GPT-4o-mini |
| **Authentication** | JWT, bcrypt |
| **File Handling** | Multer, pdf-parse, mammoth |
| **Deployment** | Vercel (Frontend), Render (Backend + Database) |

---

## 🗂️ Project Structure

```
resume-analyzer/
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Register, login, getMe
│   │   ├── uploadController.js      # Resume upload & text extraction
│   │   └── analysisController.js    # AI analysis, results, history
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── errorHandler.js          # Global error handling
│   │   └── uploadMiddleware.js      # Multer file upload config
│   │
│   ├── models/
│   │   └── db.js                    # PostgreSQL connection pool & schema init
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── analysisRoutes.js
│   │
│   ├── services/
│   │   ├── parserService.js         # PDF/DOCX text extraction logic
│   │   └── aiService.js             # OpenRouter API integration
│   │
│   ├── uploads/                     # Temporary file storage (auto-cleared)
│   ├── .env                         # Environment variables (not committed)
│   ├── .env.example                 # Environment variable template
│   ├── package.json
│   ├── server.js                    # Application entry point
│   └── setup.sql                    # Database schema script
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx   # Route guard for authenticated pages
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state management
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login / Register page
│   │   │   ├── DashboardPage.jsx    # Upload resume + job description
│   │   │   └── ResultPage.jsx       # Match score & analysis results
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with interceptors
│   │   │
│   │   ├── App.jsx                  # Route configuration
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # Tailwind base styles
│   │
│   ├── .env                         # Frontend environment variables
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## ⚙️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (React)                         │
│   Login Page  →  Dashboard Page  →  Results Page                │
│        ↓ Axios (JWT attached automatically via interceptor)     │
└───────────────────────────┬───────────────────────────────────-─┘
                             │ HTTPS / REST API
┌────────────────────────────▼──────────────────────────────────-─┐
│                    SERVER (Node.js + Express)                   │
│                                                                  │
│   Routes → Middleware (Auth, Multer, Error) → Controllers       │
│                                                                  │
│   ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐     │
│   │ authController│   │uploadController│   │analysisController│  │
│   └─────────────┘   └──────┬───────┘   └─────────┬──────────┘   │
│                             │                     │              │
│                    ┌────────▼────────┐   ┌────────▼─────────┐   │
│                    │ parserService.js │   │  aiService.js     │   │
│                    │ (pdf-parse,       │   │ (OpenRouter API   │   │
│                    │  mammoth)         │   │  → GPT-4o-mini)   │   │
│                    └───────────────────┘   └───────────────────┘   │
└───────────────────────────┬──────────────────────────────────-──┘
                             │ pg (node-postgres)
┌────────────────────────────▼──────────────────────────────────-─┐
│                     DATABASE (PostgreSQL)                       │
│                                                                  │
│   users  ──1:N──▶  resumes  ──1:1──▶  analysis                  │
│                                                                  │
└──────────────────────────────────────────────────────────────-──┘
```

### Request Flow
```
1. User registers/logs in        → JWT token issued & stored in localStorage
2. User uploads resume + job desc → Multer validates & saves file temporarily
3. parserService extracts text    → pdf-parse / mammoth
4. Resume + job desc saved to DB  → resumes table
5. aiService calls OpenRouter API → GPT-4o-mini analyzes both texts
6. AI returns structured JSON     → skills, match score, suggestions
7. Response safely parsed         → strips markdown, validates fields
8. Result saved to DB             → analysis table
9. React fetches & displays       → animated score, skill tags, suggestions
```

---

## 🗄️ Database Schema

```sql
┌─────────────────────┐
│       users          │
├─────────────────────┤
│ id            (PK)   │
│ name                 │
│ email        (UNIQUE)│
│ password   (hashed)  │
│ created_at           │
└──────────┬───────────┘
           │ 1
           │
           │ N
┌──────────▼───────────┐
│      resumes          │
├───────────────────────┤
│ id             (PK)   │
│ user_id        (FK)   │
│ resume_text            │
│ job_description        │
│ file_name              │
│ created_at              │
└──────────┬─────────────┘
           │ 1
           │
           │ 1
┌──────────▼─────────────┐
│       analysis          │
├─────────────────────────┤
│ id              (PK)    │
│ resume_id       (FK)    │
│ match_score              │
│ resume_skills   (JSONB) │
│ job_skills      (JSONB) │
│ matched_skills  (JSONB) │
│ missing_skills  (JSONB) │
│ suggestions     (JSONB) │
│ created_at                │
└──────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- OpenRouter API key — [Get one here](https://openrouter.ai)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resume_analyzer
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_jwt_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
FRONTEND_URL=http://localhost:3000
```

Create the database:
```bash
psql -U postgres -c "CREATE DATABASE resume_analyzer;"
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
npm start
```

App runs at `http://localhost:3000` 🎉

---

## 🔌 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login & receive JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `POST` | `/api/upload` | ✅ | Upload resume + job description |
| `POST` | `/api/analyze` | ✅ | Run AI analysis on resume |
| `GET` | `/api/results/:id` | ✅ | Fetch a specific analysis result |
| `GET` | `/api/history` | ✅ | Get user's analysis history |
| `GET` | `/api/health` | ❌ | Health check endpoint |

---

## 🤖 AI Response Format

```json
{
  "resume_skills": ["React", "Node.js", "SQL"],
  "job_skills": ["React", "TypeScript", "AWS"],
  "matched_skills": ["React", "Node.js"],
  "missing_skills": ["TypeScript", "AWS"],
  "match_score": 68,
  "suggestions": [
    "Add AWS certification to strengthen cloud skills",
    "Highlight TypeScript projects in your portfolio"
  ]
}
```

---

## 🛡️ Security Implementation

- ✅ JWT authentication with 7-day token expiry
- ✅ bcrypt password hashing (12 salt rounds)
- ✅ Parameterized SQL queries — prevents SQL injection
- ✅ File type & size validation (PDF/DOCX, max 5MB)
- ✅ User-scoped data access — users can only view their own analyses
- ✅ Environment variables for all sensitive credentials
- ✅ CORS configured for specific frontend origin
- ✅ Temporary files deleted from server after text extraction

---

## 🌐 Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | [Vercel](https://vercel.com) | Auto-deploys from `main` branch |
| Backend | [Render](https://render.com) | Free tier, sleeps after 15 min inactivity |
| Database | [Render PostgreSQL](https://render.com) | Free tier, 90-day retention |

**Live Demo:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com/api/health`

---

## 📈 Future Improvements

- [ ] PDF export of analysis report
- [ ] AI-powered resume rewrite suggestions
- [ ] Multi-job comparison for a single resume
- [ ] Score history tracking with charts
- [ ] Support for LinkedIn profile import
- [ ] Email notifications for analysis completion

---

## 👨‍💻 Author

**Suraj Kumar**
Full-Stack Developer | Computer Science (Cyber Security)

- 💼 LinkedIn: [your-linkedin-url](#)
- 💻 GitHub: [@your-username](#)
- 📧 Email: surajsolanki8847@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">⭐ If you found this project useful, consider giving it a star!</p>
