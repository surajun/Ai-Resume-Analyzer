const { Pool } = require('pg');

// ─── Connection Pool ───────────────────────────────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'resume_analyzer',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// ─── Initialize Tables ────────────────────────────────────────────────────────
const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        resume_text TEXT NOT NULL,
        job_description TEXT NOT NULL,
        file_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS analysis (
        id SERIAL PRIMARY KEY,
        resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
        match_score NUMERIC(5,2) NOT NULL,
        resume_skills JSONB DEFAULT '[]',
        job_skills JSONB DEFAULT '[]',
        matched_skills JSONB DEFAULT '[]',
        missing_skills JSONB DEFAULT '[]',
        suggestions JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('❌ DB initialization error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

// Run init on startup
initDB().catch(console.error);

module.exports = { pool };
