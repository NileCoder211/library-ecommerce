import express from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  getProfile,
  googleCallback,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import passport from "passport";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);


// Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google callback
router.get(
    "/google/callback", 
    passport.authenticate("google", {
    session: false,
    failureRedirect:
      process.env.CLIENT_URL +
      "/login",
  }),

  googleCallback
);

export default router;