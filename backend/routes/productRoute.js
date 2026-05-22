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
	updateProductStock
} from "../controllers/productController.js";
import { adminRoute, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.get("/:id", getProductById)
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.get("/out-of-stock", protectRoute, adminRoute, getOutOfStockProducts);
router.patch("/:id/stock", protectRoute, adminRoute, updateProductStock);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;