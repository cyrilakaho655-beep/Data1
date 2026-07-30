// Central Express error-handling middleware

function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);

  const status = err && err.statusCode ? err.statusCode : 500;
  const message = err && err.message ? err.message : 'Internal Server Error';

  const payload = { error: message };

  // In non-production include additional details
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err && err.stack ? err.stack : undefined;
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;
