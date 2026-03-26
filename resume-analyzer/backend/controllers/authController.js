const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../models/db');

/**
 * POST /api/auth/register
 * Creates a new user account.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // ── Check if email already exists ────────────────────────────────────────
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // ── Hash password ────────────────────────────────────────────────────────
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ── Insert user ──────────────────────────────────────────────────────────
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );
    const user = result.rows[0];

    // ── Generate JWT ─────────────────────────────────────────────────────────
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticates an existing user and returns JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // ── Find user ─────────────────────────────────────────────────────────────
    const result = await pool.query(
      'SELECT id, name, email, password FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // ── Verify password ───────────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // ── Generate JWT ──────────────────────────────────────────────────────────
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
