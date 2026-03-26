/**
 * Global error handling middleware.
 * Catches errors passed via next(err) from route handlers.
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
  }

  // Multer unexpected file type
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: 'Invalid file type. Only PDF and DOCX allowed.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists.' });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
};

module.exports = { errorHandler };
