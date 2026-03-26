const express = require('express');
const router = express.Router();
const { uploadResume } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');

// POST /api/upload  (protected)
// Accepts: multipart/form-data with 'resume' file + 'job_description' text field
router.post('/upload', authenticate, upload.single('resume'), uploadResume);

module.exports = router;
