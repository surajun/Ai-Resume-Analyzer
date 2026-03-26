const express = require('express');
const router = express.Router();
const { analyzeResume, getResult, getHistory } = require('../controllers/analysisController');
const { authenticate } = require('../middleware/auth');

// POST /api/analyze  (protected)
router.post('/analyze', authenticate, analyzeResume);

// GET /api/results/:id  (protected)
router.get('/results/:id', authenticate, getResult);

// GET /api/history  (protected)
router.get('/history', authenticate, getHistory);

module.exports = router;
