import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  getRecommendedProducts,
  toggleFeaturedProduct,
  getOutOfStockProducts,
  updateProductStock,
} from "../controllers/productController.js";
import { adminRoute, protectRoute } from "../middleware/authMiddleware.js";
import { searchProducts, suggestProducts } from "../controllers/ProductSearchController.js";

const router = express.Router();

// ── Fixed-path GET routes FIRST. Anything after "/:id" would be swallowed by it
//    (e.g. "/out-of-stock" was being treated as a product id → 500 CastError).
router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/out-of-stock", protectRoute, adminRoute, getOutOfStockProducts);
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);


router.get("/search/suggestions", suggestProducts); // public, no protectRoute
router.get("/search", searchProducts);              // public, no protectRoute
router.get("/:id", getProductById);                 // must stay AFTER the two above


// ── Param routes LAST ─────────────────────────────────────────────────────────
router.get("/:id", getProductById);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.patch("/:id/stock", protectRoute, adminRoute, updateProductStock);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
