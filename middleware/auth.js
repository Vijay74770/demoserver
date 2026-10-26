const DEVICE_API_KEY = process.env.DEVICE_API_KEY;

function checkApiKey(req, res, next) {
  if (!DEVICE_API_KEY) return next(); // no key configured -> auth disabled
  const key = req.get('x-api-key');
  if (key !== DEVICE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

module.exports = checkApiKey;
