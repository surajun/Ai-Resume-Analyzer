const path = require('path');
const { extractTextFromFile, deleteFile } = require('../services/parserService');
const { pool } = require('../models/db');

/**
 * POST /api/upload
 * Accepts a resume file + job description, extracts text, stores in DB.
 * Returns resume_id for subsequent analysis.
 */
const uploadResume = async (req, res, next) => {
  const filePath = req.file ? req.file.path : null;

  try {
    // ── Validate inputs ───────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required.' });
    }

    const { job_description } = req.body;
    if (!job_description || job_description.trim().length < 50) {
      deleteFile(filePath);
      return res.status(400).json({
        error: 'Job description is required and must be at least 50 characters.',
      });
    }

    // ── Extract text from file ────────────────────────────────────────────────
    const resumeText = await extractTextFromFile(filePath);

    // ── Store in database ─────────────────────────────────────────────────────
    const result = await pool.query(
      `INSERT INTO resumes (user_id, resume_text, job_description, file_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, file_name, created_at`,
      [
        req.user.id,
        resumeText,
        job_description.trim(),
        req.file.originalname,
      ]
    );

    const resume = result.rows[0];

    // ── Clean up uploaded file after text extraction ───────────────────────────
    deleteFile(filePath);

    res.status(201).json({
      message: 'Resume uploaded and parsed successfully.',
      resume_id: resume.id,
      file_name: resume.file_name,
      text_length: resumeText.length,
    });
  } catch (err) {
    // Always clean up the file on error
    if (filePath) deleteFile(filePath);
    next(err);
  }
};

module.exports = { uploadResume };
