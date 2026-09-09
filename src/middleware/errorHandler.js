const { AppError } = require('../errors');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // Unexpected error - don't leak internals, but do log for debugging.
  console.error(err); // eslint-disable-line no-console
  return res.status(500).json({ error: 'Internal server error' });
}

// Note: every route handler in this project is synchronous (in-memory
// repositories, no I/O), and Express 4 automatically forwards errors
// thrown by synchronous handlers to this middleware - no wrapper needed.
// If a route becomes async later (e.g. a real DB), wrap it with a small
// `(req,res,next) => handler(req,res,next).catch(next)` helper.

module.exports = { errorHandler };
