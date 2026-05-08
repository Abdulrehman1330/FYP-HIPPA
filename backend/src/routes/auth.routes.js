const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { AppError } = require('../middleware/error.middleware');
const authService = require('../services/auth.service');

const router = Router();

router.post('/auth/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('All fields are required', 400);
    }
    const data = await authService.registerUser(email, password, firstName, lastName);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password required', 400);
    const data = await authService.loginUser(email, password);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/auth/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
