const express = require("express");
const passport = require("../config/passport");
const {
  register,
  login,
  me,
  googleCallback,
  googleFailed,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/protect");
const { authRateLimiter } = require("../middleware/rateLimiter");
const { createError } = require("../utils/errors");

const router = express.Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/me", protect, me);
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    return next(createError(500, "Google OAuth is not configured"));
  }
  return passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/v1/auth/google/failed" }),
  googleCallback,
);
router.get("/google/failed", googleFailed);

module.exports = router;
