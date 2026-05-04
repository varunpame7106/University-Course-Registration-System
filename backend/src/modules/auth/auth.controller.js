const authService = require('./auth.service');
const asyncWrapper = require('../../utils/asyncWrapper');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const loginController = asyncWrapper(async (req, res) => {
  const { user_id, password, role } = req.body;
  if (!user_id || !password || !role) {
    return sendError(res, 'user_id, password, and role are required', [], 400);
  }
  const result = await authService.login(user_id, password, role);
  
  setAuthCookies(res, result.accessToken, result.refreshToken);
  
  return sendSuccess(res, result, 'Login successful');
});

const refreshController = asyncWrapper(async (req, res) => {
  const { refreshToken: bodyRefreshToken } = req.body;
  const refreshToken = bodyRefreshToken || req.cookies?.refreshToken;
  
  const result = await authService.refresh(refreshToken);
  
  setAuthCookies(res, result.accessToken, result.refreshToken);
  
  return sendSuccess(res, result, 'Token refreshed');
});

const meController = asyncWrapper(async (req, res) => {
  // The user is already attached to req by the auth middleware
  return sendSuccess(res, req.user, 'User profile fetched');
});

const logoutController = asyncWrapper(async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return sendSuccess(res, null, 'Logged out successfully');
});

module.exports = { loginController, refreshController, logoutController, meController };
