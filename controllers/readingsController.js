const pool = require('../config/db');

// POST /api/readings - controller device sends a new temperature/humidity reading
async function createReading(req, res, next) {
  const { temperature, humidity } = req.body;

  const temp = Number(temperature);
  const hum = Number(humidity);

  if (!Number.isFinite(temp) || !Number.isFinite(hum)) {
    return res.status(400).json({ error: 'temperature and humidity must be numbers' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO readings (temperature, humidity)
       VALUES ($1, $2)
       RETURNING id, temperature, humidity, recorded_at`,
      [temp, hum]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// GET /api/readings/latest - get the most recent reading
async function getLatestReading(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, temperature, humidity, recorded_at
       FROM readings
       ORDER BY recorded_at DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No readings yet' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// GET /api/readings?limit=N - recent history, handy for debugging/plots
async function getReadings(req, res, next) {
  const limit = Math.min(Number(req.query.limit) || 50, 500);
  try {
    const result = await pool.query(
      `SELECT id, temperature, humidity, recorded_at
       FROM readings
       ORDER BY recorded_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { createReading, getLatestReading, getReadings };
