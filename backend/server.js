import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors"
import passport from "./lib/passport.js";

import authRoutes from "./routes/authRoute.js";
import productRoutes from "./routes/productRoute.js";
import cartRoutes from "./routes/cartRoute.js";
import couponRoutes from "./routes/couponRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import analyticsRoutes from "./routes/analyticsRoute.js";
import mpesaRoutes from "./routes/mpesaRoute.js";
import orderRoutes from "./routes/orderRoute.js"
import wishlistRoutes from "./routes/wishlistRoute.js";
import chatbotRouter from "./routes/chatbotRoute.js";




 
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(passport.initialize());

app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
app.use(cookieParser());
app.use(cors({
  origin: "https://library-ecommerce.onrender.com/",
  credentials: true
}))

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chatbot", chatbotRouter);

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "frontend/dist");

  app.use(express.static(frontendPath));

  // ✅ Catch-all WITHOUT using path-to-regexp
  app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} 


app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});
