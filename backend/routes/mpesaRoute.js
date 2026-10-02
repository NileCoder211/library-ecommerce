import express from "express";
import rateLimit from "express-rate-limit";
import {
  stkPush,
  mpesaCallback,
  confirmMpesaOrder,
} from "../controllers/mpesaController.js";

import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Max 5 STK pushes per minute PER USER. Keyed by user id (not IP): behind a
// proxy/host every visitor can share one IP, which would put the whole site on
// a single 5-per-minute limit.
const stkLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  keyGenerator: (req) => String(req.user._id),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many payment attempts. Please wait a minute and try again.",
  },
});

router.post("/stkpush", protectRoute, stkLimiter, stkPush);

// Needs protectRoute: confirmMpesaOrder checks the pending order belongs to req.user
router.post("/confirm", protectRoute, confirmMpesaOrder);

// Called by Safaricom – must stay public (protected by the ?secret= in CALLBACK_URL)
router.post("/callback", mpesaCallback);

export default router;
