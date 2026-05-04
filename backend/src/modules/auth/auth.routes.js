const { Router } = require('express');
const { loginController, refreshController, logoutController, meController } = require('./auth.controller');
const rateLimit = require('express-rate-limit');
const verifyToken = require('../../middleware/auth');

const router = Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, error: 'Too many login attempts, please try again after a minute.' },
});

router.post('/login', authLimiter, loginController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.get('/me', verifyToken, meController);

module.exports = router;
