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




// add temporarily to any backend route file
router.get("/fix-mpesa-orders", async (req, res) => {
  const orders = await Order.find({ 
    paymentMethod: "mpesa",
    "products.name": { $exists: false }  // only unfixed orders
  });

  for (const order of orders) {
    for (const item of order.products) {
      if (!item.name || !item.image) {
        const product = await Product.findById(item.product);
        if (product) {
          item.name = product.name;
          item.image = product.images?.[0]?.url;
        }
      }
    }
    await order.save();
  }

  res.json({ fixed: orders.length });
});