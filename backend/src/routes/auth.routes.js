const { Router } = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { AppError } = require("../middleware/error.middleware");
const authService = require("../services/auth.service");

const router = Router();

const REFRESH_COOKIE = "hippa_refresh";
const refreshCookieOpts = {
  httpOnly: true,
  sameSite: "strict",
  // Secure flag only in non-development — local dev uses http://
  secure: process.env.NODE_ENV === "production",
  path: "/api/v1/auth",
  // 7 days in ms (matches default refresh TTL); refresh cookie itself carries its own expiry
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post("/auth/register", async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !password || !firstName || !lastName) {
      throw new AppError("All fields are required", 400);
    }
    const data = await authService.registerUser(email, password, firstName, lastName, role);
    if (data.refreshToken) res.cookie(REFRESH_COOKIE, data.refreshToken, refreshCookieOpts);
    res.status(201).json({
      success: true,
      data: { user: data.user, token: data.token, accessToken: data.accessToken },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError("Email and password required", 400);
    const data = await authService.loginUser(email, password);
    res.cookie(REFRESH_COOKIE, data.refreshToken, refreshCookieOpts);
    res.json({
      success: true,
      data: { user: data.user, token: data.token, accessToken: data.accessToken },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/refresh", async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const rt = cookies[REFRESH_COOKIE];
    const data = await authService.refreshSession(rt);
    res.cookie(REFRESH_COOKIE, data.refreshToken, refreshCookieOpts);
    res.json({ success: true, data: { accessToken: data.accessToken, token: data.accessToken } });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout", (req, res) => {
  res.clearCookie(REFRESH_COOKIE, refreshCookieOpts);
  res.json({ success: true });
});

router.get("/auth/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/change-password", authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

function parseCookies(raw) {
  const out = {};
  raw.split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i < 0) return;
    out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

module.exports = router;
