const { sendError } = require('../utils/apiResponse');

/**
 * Role-based access control middleware.
 * Usage: requireRole('admin') | requireRole('faculty') | requireRole('student')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', [], 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Access denied. Required role: ${roles.join(' or ')}.`, [], 403);
    }
    next();
  };
};

module.exports = requireRole;
