import express from "express";
import {
  signup,
  verifyOtp,
  login,
  logout,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  sendResponseWithToken,
  getCurrentUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyUsers.js";
import rateLimit from "express-rate-limit";
import User from "../models/userModel.js";
import { verifyGoogleToken } from "../utils/googleOAuth.js";

const router = express.Router();

// Rate limiting for login route
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after a minute",
});

const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

const updateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many update requests, please try again later",
});

const resetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many password reset requests, please try again after a minute",
});

// Manual routes
router.route("/user/get/me").get(verifyToken, getCurrentUser);
router.route("/user/signup").post(signup);
router.route("/user/verify-otp").post(verifyOtp);
router.route("/user/login").post(loginLimiter, login);
router.route("/user/logout").get(logout);
router
  .route("/user/update-profile")
  .patch(verifyToken, updateLimiter, updateProfile);
router
  .route("/user/update-password")
  .patch(verifyToken, updateLimiter, updatePassword);
router.route("/user/forgot-password").post(resetLimiter, forgotPassword);
router.route("/user/reset-password/:token").post(resetLimiter, resetPassword);

router.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await verifyGoogleToken(token);
    const { email, given_name, family_name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        firstName: given_name,
        lastName: family_name,
        email,
        avatar: picture,
        provider: "google",
        googleId: payload.sub,
      });
      await user.save();
    }

    // Use sendResponseWithToken to handle the token and response
    sendResponseWithToken(user, res);
  } catch (error) {
    console.error("Authentication failed:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

export default router;
