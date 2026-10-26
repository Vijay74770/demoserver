const express = require('express');
const checkApiKey = require('../middleware/auth');
const {
  createReading,
  getLatestReading,
  getReadings,
} = require('../controllers/readingsController');

const router = express.Router();

router.post('/', checkApiKey, createReading);
router.get('/latest', getLatestReading);
router.get('/', getReadings);

module.exports = router;
