/** Global error handler — must be registered last */
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path}`, err);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/** Wrap async route handlers to forward errors to errorHandler */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
