import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Coupon from "../models/couponModel.js";
import { stripe } from "../lib/stripe.js";
import {generateOrderNumber} from "../lib/generateOrderNumber.js"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// Generates ORD-STR-2026-0001 / ORD-MPS-2026-0001 without a separate Counter model


const reduceStock = async (products) => {
  for (const item of products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }
};
const handleCouponLogic = async (userId, couponCode, totalAmount) => {
  // deactivate used coupon
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: couponCode, userId },
      { isActive: false }
    );
  }

  // give reward coupon
  if (totalAmount >= 20000) {
    await Coupon.findOneAndUpdate(
      { userId },
      {
        $set: {
          code:
            "GIFT" +
            Math.random().toString(36).substring(2, 8).toUpperCase(),
          discountPercentage: 10,
          expirationDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ),
          isActive: true,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/checkout-success
// Called by PurchaseSuccessPage after Stripe redirects back
// ─────────────────────────────────────────────────────────────────────────────
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Missing sessionId" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // ── Duplicate guard ───────────────────────────────────────────────────────
 const existing = await Order.findOne({ stripeSessionId: sessionId });
    if (existing) {
      return res.status(200).json({ success: true, order: existing });
    }

    // ── Parse metadata ────────────────────────────────────────────────────────
    const rawProducts = session.metadata?.products
      ? JSON.parse(session.metadata.products)
      : [];

    if (!rawProducts.length) {
      return res.status(400).json({ message: "No products in session metadata" });
    }

    // Fetch product names/images from DB (metadata only stores IDs)
    const productIds = rawProducts.map((p) => p.product || p._id || p.id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const orderProducts = rawProducts.map((item) => {
      const productId = item.product || item._id || item.id;
      const db = dbProducts.find((p) => p._id.toString() === productId.toString());
      return {
        product: productId,
        name: db?.name || item.name || "Product",
        image: db?.images?.[0]?.url || item.image || "",
        price: item.price,
        quantity: item.quantity,
      };
    });

    // ── Parse shipping ────────────────────────────────────────────────────────
    let shippingAddress = {};
    try {
      shippingAddress = session.metadata?.shippingAddress
        ? JSON.parse(session.metadata.shippingAddress)
        : {};
    } catch (_) {}

    const phoneNumber = session.metadata?.phoneNumber || "";
    const userId = session.metadata?.userId || req.user._id;
    const couponCode = session.metadata?.couponCode || null;

    // ── Generate order number ─────────────────────────────────────────────────
    const orderNumber = await generateOrderNumber("stripe");

    // ── Create order ──────────────────────────────────────────────────────────
    // ── Atomic upsert — safe against concurrent requests ─────────────────────────
const order = await Order.findOneAndUpdate(
  { stripeSessionId: session.id },
  {
    $setOnInsert: {
      user: userId,
      orderNumber,
      products: orderProducts,
      totalAmount: session.amount_total / 100,
      paymentMethod: "stripe",
      paymentStatus: "paid",
      orderStatus: "processing",
      stripeSessionId: session.id,
      transactionId: session.payment_intent,
      shippingAddress,
      phoneNumber,
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);

    // ── Reduce stock + coupon ─────────────────────────────────────────────────
    await reduceStock(orderProducts);
    await handleCouponLogic(userId, couponCode, session.amount_total / 100);

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("checkoutSuccess error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my-orders
// ─────────────────────────────────────────────────────────────────────────────
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product", "name images")
      .sort({ createdAt: -1 });

    // ✅ Return { orders } so the Zustand store can read res.data.orders
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("getUserOrders error:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getSingleOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product", "name images");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("getSingleOrder error:", error);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/cancel  (user can cancel pending/paid orders)
// ─────────────────────────────────────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const cancellable = ["pending", "paid"];
    if (!cancellable.includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Cannot cancel an order that is already ${order.orderStatus}`,
      });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();
    return res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    console.error("cancelOrder error:", error);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
// orderController.js — updateOrderStatus
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // ✅ Use findByIdAndUpdate — no full-document validation
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: { orderStatus },
        ...(orderStatus === "cancelled" ? { $set: { orderStatus, cancelledAt: new Date() } } : {}),
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Restore stock if cancelled
    if (orderStatus === "cancelled") {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({ message: "Failed to update order" });
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/orders/:id  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();
    return res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    console.error("deleteOrder error:", error);
    return res.status(500).json({ message: "Failed to delete order" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders  (admin — all orders with pagination + analytics)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.orderStatus = req.query.status;

    // Search by orderNumber, customer name, or phone
    if (req.query.search) {
      const s = req.query.search;
      query.$or = [
        { orderNumber: { $regex: s, $options: "i" } },
        { phoneNumber: { $regex: s, $options: "i" } },
      ];
    }

    const [orders, totalOrders, revenueData] = await Promise.all([
      Order.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: "$paymentMethod",
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

   const stripeData = revenueData.find((r) => r._id === "stripe");
const mpesaData  = revenueData.find((r) => r._id === "mpesa");
    const totalRevenue = (stripeData?.total || 0) + (mpesaData?.total || 0);

    return res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
      analytics: {
        totalRevenue,
        totalOrders,
        stripeRevenue: stripeData?.total  || 0,
        mpesaRevenue:  mpesaData?.total   || 0,
        stripeOrders:  stripeData?.count  || 0,
        mpesaOrders:   mpesaData?.count   || 0,
      },
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};