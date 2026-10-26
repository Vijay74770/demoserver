// Catches errors thrown/forwarded by controllers so each route doesn't need its own try/catch boilerplate.
function errorHandler(err, req, res, next) {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}

module.exports = errorHandler;
