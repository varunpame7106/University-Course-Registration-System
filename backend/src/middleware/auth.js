const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return sendError(res, 'Access denied. No token provided.', [], 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, entity_id }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired.', [], 401);
    }
    return sendError(res, 'Invalid token.', [], 401);
  }
};

module.exports = verifyToken;
