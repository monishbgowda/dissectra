function errorHandler(err, _req, res, _next) {
  console.error('[API ERROR]', err.message, err.stack || '');
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}
module.exports = errorHandler;
