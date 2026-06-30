# 🤖 AI Resume Analyzer & Job Match Platform

A full-stack AI-powered platform that analyzes resumes against job descriptions, calculates ATS match scores, and generates actionable improvement suggestions using GPT-4o-mini via OpenRouter API.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-black?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-GPT--4o--mini-orange)

---

## 📋 Overview

This system allows users to upload their resume and a target job description. The platform extracts text, analyzes it using AI, compares skills, calculates a realistic match score, and returns personalized improvement suggestions — all stored in a structured database for future reference.

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
resume-analyzer/
├── backend/
│   ├── controllers/        # Route logic (auth, upload, analysis)
│   ├── middleware/         # JWT auth, file upload, error handling
│   ├── models/             # PostgreSQL connection & schema
│   ├── routes/             # API route definitions
│   ├── services/           # AI integration & file parsing logic
│   ├── server.js           # Application entry point
│   └── setup.sql           # Database schema
│
└── frontend/
├── src/
│   ├── context/         # Auth context (global state)
│   ├── pages/            # Login, Dashboard, Results pages
│   ├── services/        # Axios API service layer
│   └── App.jsx           # Route configuration
└── public/
