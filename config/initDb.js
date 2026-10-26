require('dotenv').config();
const pool = require('./db');

const SQL = `
CREATE TABLE IF NOT EXISTS readings (
  id SERIAL PRIMARY KEY,
  temperature NUMERIC NOT NULL,
  humidity NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_recorded_at ON readings (recorded_at DESC);
`;

(async () => {
  try {
    await pool.query(SQL);
    console.log('Database ready: "readings" table exists.');
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
