import express from "express";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity, clearCart } from "../controllers/cartController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";  // ← add this

const router = express.Router();
/* 
router.get("/clear-carts", async (req, res) => {  // ← move to top
  await User.updateMany({}, { $set: { cartItems: [] } });
  res.json({ success: true });
});
 */
router.get("/check-carts", async (req, res) => {
  const users = await User.find({}, { cartItems: 1 });
  res.json(users);
});
router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);
router.delete("/clear", protectRoute, clearCart);

export default router;