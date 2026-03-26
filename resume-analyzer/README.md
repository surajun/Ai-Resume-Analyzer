# 🤖 AI Resume Analyzer & Job Match Platform

A full-stack application that analyzes resumes against job descriptions using AI, calculates match scores, and provides actionable improvement suggestions.

---

## 🗂️ Project Structure

```
resume-analyzer/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   ├── uploadController.js    # Resume file upload & parse
│   │   └── analysisController.js  # AI analysis, results, history
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   ├── errorHandler.js        # Global error handling
│   │   └── uploadMiddleware.js    # Multer config
│   ├── models/
│   │   └── db.js                  # PostgreSQL pool + table init
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── analysisRoutes.js
│   ├── services/
│   │   ├── parserService.js       # PDF/DOCX text extraction
│   │   └── aiService.js           # OpenRouter API integration
│   ├── uploads/                   # Temp file storage (auto-created)
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── setup.sql                  # DB initialization script
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── ResultsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenRouter API key

---

### 1. Clone & Setup

```bash
git clone <your-repo>
cd resume-analyzer
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resume_analyzer
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini
FRONTEND_URL=http://localhost:3000
```

---

### 3. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE resume_analyzer;"

# Run schema (or let the app auto-create on first start)
psql -U postgres -d resume_analyzer -f setup.sql
```

---

### 4. Start Backend

```bash
npm run dev
# Server starts at http://localhost:5000
# Test: curl http://localhost:5000/api/health
```

---

### 5. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
# .env already set to http://localhost:5000/api
npm start
# App opens at http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/upload` | ✅ | Upload resume file |
| POST | `/api/analyze` | ✅ | Run AI analysis |
| GET | `/api/results/:id` | ✅ | Get one result |
| GET | `/api/history` | ✅ | Get all history |
| GET | `/api/health` | ❌ | Health check |

---

## 🧪 Testing the API (cURL)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Login (save token)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' | jq -r .token)

# Upload resume
RESUME_ID=$(curl -s -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@/path/to/resume.pdf" \
  -F "job_description=We are looking for a Senior React developer..." | jq -r .resume_id)

# Analyze
curl -X POST http://localhost:5000/api/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"resume_id\": $RESUME_ID}"

# Get history
curl http://localhost:5000/api/history \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🤖 AI Integration

Uses **OpenRouter API** → `openai/gpt-4o-mini`

The AI returns structured JSON:
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

## 🚀 Deployment

### Backend (Railway / Render / Heroku)
1. Set all env vars in platform dashboard
2. Set `NODE_ENV=production`
3. Deploy from `/backend` directory

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Set build command: `npm run build`
3. Set publish dir: `build`

---

## 🛡️ Security Features

- ✅ JWT authentication (7-day expiry)
- ✅ bcrypt password hashing (12 rounds)
- ✅ File type validation (PDF/DOCX only)
- ✅ File size limit (5MB)
- ✅ SQL parameterized queries (no injection)
- ✅ Environment variables for all secrets
- ✅ CORS configured per environment
- ✅ Temp files deleted after parsing

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| AI | OpenRouter → GPT-4o-mini |
| Auth | JWT + bcrypt |
| File Parse | pdf-parse, mammoth |
| Upload | Multer |
