const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

const login = async (user_id, password, role) => {
  let user = null;
  let entity_id = null;
  let name = null;

  if (role === 'admin') {
    user = await prisma.administrator.findUnique({ where: { user_id } });
    if (user) { entity_id = user.admin_id; name = user.user_id; }
  } else if (role === 'faculty') {
    user = await prisma.faculty.findUnique({ where: { user_id } });
    if (user) { entity_id = user.faculty_id; name = `${user.first_name} ${user.last_name}`; }
  } else if (role === 'student') {
    user = await prisma.student.findUnique({ where: { user_id } });
    if (user) { entity_id = user.student_id; name = `${user.first_name} ${user.last_name}`; }
  } else {
    throw Object.assign(new Error('Invalid role'), { statusCode: 400 });
  }

  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const payload = { userId: user_id, role, entity_id };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return {
    accessToken,
    refreshToken,
    user: { user_id, role, entity_id, name },
  };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw Object.assign(new Error('Refresh token required'), { statusCode: 400 });

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
  }

  const payload = { userId: decoded.userId, role: decoded.role, entity_id: decoded.entity_id };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken: newRefreshToken };
};

module.exports = { login, refresh };
