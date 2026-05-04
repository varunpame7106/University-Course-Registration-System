/**
 * Wraps an async route handler to eliminate try/catch boilerplate.
 * Any thrown error is forwarded to Express's next(err) error handler.
 */
const asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncWrapper;
