import express from "express";
import {
  stkPush,
  mpesaCallback,
  confirmMpesaOrder,
} from "../controllers/mpesaController.js";

import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/stkpush", protectRoute, stkPush);

router.post("/confirm", confirmMpesaOrder);

router.post("/callback", mpesaCallback);

export default router;
