-- ============================================================
-- AI Resume Analyzer - PostgreSQL Database Setup Script
-- Run this ONCE to initialize your database
-- Usage: psql -U postgres -d resume_analyzer -f setup.sql
-- ============================================================

-- Create database (run as superuser if needed)
-- CREATE DATABASE resume_analyzer;

-- ── Users Table ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hashed
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Resumes Table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
  resume_text      TEXT NOT NULL,
  job_description  TEXT NOT NULL,
  file_name        VARCHAR(255),
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- ── Analysis Table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis (
  id              SERIAL PRIMARY KEY,
  resume_id       INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
  match_score     NUMERIC(5,2) NOT NULL,
  resume_skills   JSONB DEFAULT '[]',
  job_skills      JSONB DEFAULT '[]',
  matched_skills  JSONB DEFAULT '[]',
  missing_skills  JSONB DEFAULT '[]',
  suggestions     JSONB DEFAULT '[]',
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_resume_id ON analysis(resume_id);

-- Verify
SELECT 'Database setup complete!' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
