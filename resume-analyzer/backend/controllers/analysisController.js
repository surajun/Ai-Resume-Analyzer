const { pool } = require('../models/db');
const { analyzeWithAI } = require('../services/aiService');

/**
 * POST /api/analyze
 * Runs AI analysis on a previously uploaded resume.
 * Body: { resume_id }
 */
const analyzeResume = async (req, res, next) => {
  try {
    const { resume_id } = req.body;

    if (!resume_id) {
      return res.status(400).json({ error: 'resume_id is required.' });
    }

    // ── Fetch resume (ensure it belongs to requesting user) ───────────────────
    const resumeResult = await pool.query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2',
      [resume_id, req.user.id]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found or access denied.' });
    }

    const resume = resumeResult.rows[0];

    // ── Call AI Service ───────────────────────────────────────────────────────
    const aiResult = await analyzeWithAI(resume.resume_text, resume.job_description);

    // ── Store analysis results ────────────────────────────────────────────────
    const analysisResult = await pool.query(
      `INSERT INTO analysis
         (resume_id, match_score, resume_skills, job_skills, matched_skills, missing_skills, suggestions)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        resume.id,
        aiResult.match_score,
        JSON.stringify(aiResult.resume_skills),
        JSON.stringify(aiResult.job_skills),
        JSON.stringify(aiResult.matched_skills),
        JSON.stringify(aiResult.missing_skills),
        JSON.stringify(aiResult.suggestions),
      ]
    );

    const analysis = analysisResult.rows[0];

    res.status(201).json({
      message: 'Analysis complete.',
      analysis_id: analysis.id,
      resume_id: resume.id,
      file_name: resume.file_name,
      match_score: parseFloat(analysis.match_score),
      resume_skills: analysis.resume_skills,
      job_skills: analysis.job_skills,
      matched_skills: analysis.matched_skills,
      missing_skills: analysis.missing_skills,
      suggestions: analysis.suggestions,
      created_at: analysis.created_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/results/:id
 * Fetches a specific analysis result by analysis ID.
 */
const getResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, r.file_name, r.job_description, r.created_at as resume_created_at
       FROM analysis a
       JOIN resumes r ON a.resume_id = r.id
       WHERE a.id = $1 AND r.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis result not found.' });
    }

    const row = result.rows[0];
    res.json({
      analysis_id: row.id,
      resume_id: row.resume_id,
      file_name: row.file_name,
      match_score: parseFloat(row.match_score),
      resume_skills: row.resume_skills,
      job_skills: row.job_skills,
      matched_skills: row.matched_skills,
      missing_skills: row.missing_skills,
      suggestions: row.suggestions,
      job_description: row.job_description,
      created_at: row.created_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/history
 * Returns the analysis history for the authenticated user.
 */
const getHistory = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT a.id as analysis_id, a.match_score, a.created_at,
              r.id as resume_id, r.file_name, r.job_description
       FROM analysis a
       JOIN resumes r ON a.resume_id = r.id
       WHERE r.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    const history = result.rows.map((row) => ({
      analysis_id: row.analysis_id,
      resume_id: row.resume_id,
      file_name: row.file_name,
      match_score: parseFloat(row.match_score),
      job_snippet: row.job_description?.slice(0, 120) + '...',
      created_at: row.created_at,
    }));

    res.json({ history, total: history.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { analyzeResume, getResult, getHistory };
