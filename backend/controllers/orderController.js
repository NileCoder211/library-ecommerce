import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Coupon from "../models/couponModel.js";
import { redis } from "../lib/redis.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (exported so mpesaController can reuse them)
// ─────────────────────────────────────────────────────────────────────────────

// Stock changes must also clear the cached product lists, otherwise the
// storefront keeps showing stale stock / out-of-stock items.
const invalidateStockCaches = async () => {
  try {
    await redis.del("out_of_stock_products", "featured_products");
  } catch (error) {
    console.error("Stock cache invalidation failed:", error.message);
  }
};
export const reduceStock = async (products) => {
  for (const item of products) {
    // Never goes below 0. The customer has already paid by now, so if two
    // people bought the last item we log it instead of failing.
    const before = await Product.findOneAndUpdate(
      { _id: item.product },
      [
        {
          $set: {
            stock: { $max: [0, { $subtract: ["$stock", item.quantity] }] },
          },
        },
      ],
      { returnDocument: "before", updatePipeline: true },
    );
    if (before && before.stock < item.quantity) {
      console.warn(
        `OVERSOLD: ${before.name} had ${before.stock}, order needed ${item.quantity}`,
      );
    }
  }
  await invalidateStockCaches();
};

export const restoreStock = async (products) => {
  for (const item of products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }
  await invalidateStockCaches();
};

export const handleCouponLogic = async (userId, couponCode, totalAmount) => {
  // deactivate used coupon
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: couponCode, userId },
      { isActive: false },
    );
  }

  // give reward coupon
  if (totalAmount >= 20000) {
    await Coupon.findOneAndUpdate(
      { userId },
      {
        $set: {
          code:
            "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          discountPercentage: 10,
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  }
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my-orders
// ─────────────────────────────────────────────────────────────────────────────
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product", "name images")
      .sort({ createdAt: -1 });

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

    // order.user can be null if the user account was deleted
    const isOwner = order.user?._id?.toString() === req.user._id.toString();
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
// PATCH /api/orders/:id/cancel  (customer can cancel until it is shipped)
// NOTE: M-Pesa has no automatic refund. If paymentStatus is "paid", the refund
// (reversal) must be handled manually / via the Safaricom reversal API.
// ─────────────────────────────────────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const existing = await Order.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Order not found" });

    if (existing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // "paid" is a paymentStatus, not an orderStatus – paid orders sit in "processing"
    const cancellable = ["pending", "processing"];
    if (!cancellable.includes(existing.orderStatus)) {
      return res.status(400).json({
        message: `Cannot cancel an order that is already ${existing.orderStatus}`,
      });
    }

    // Atomic transition – guarantees stock is restored only once
    const order = await Order.findOneAndUpdate(
      { _id: existing._id, orderStatus: { $in: cancellable } },
      { $set: { orderStatus: "cancelled", cancelledAt: new Date() } },
      { new: true },
    );

    if (!order) {
      return res
        .status(400)
        .json({ message: "Order status changed, please refresh" });
    }

    await restoreStock(order.products);

    return res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    console.error("cancelOrder error:", error);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const allowed = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const update = { orderStatus };
    if (orderStatus === "cancelled") update.cancelledAt = new Date();

    // Cancelled orders are final (their stock was already restored), and the
    // filter makes the transition atomic so stock can't be restored twice.
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, orderStatus: { $ne: "cancelled" } },
      { $set: update },
      { new: true },
    );

    if (!order) {
      const exists = await Order.exists({ _id: req.params.id });
      return exists
        ? res.status(400).json({ message: "Order is already cancelled" })
        : res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus === "cancelled") {
      await restoreStock(order.products);
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

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
// GET /api/orders/all  (admin — all orders with pagination + analytics)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.orderStatus = req.query.status;

    // Search by orderNumber or phone (escaped – user input must never be a raw regex)
    if (req.query.search) {
      const s = escapeRegex(String(req.query.search));
      query.$or = [
        { orderNumber: { $regex: s, $options: "i" } },
        { "shippingAddress.phoneNumber": { $regex: s, $options: "i" } },
        { "shippingAddress.fullName": { $regex: s, $options: "i" } },
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
        // cancelled orders shouldn't count as revenue
        {
          $match: { paymentStatus: "paid", orderStatus: { $ne: "cancelled" } },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const paidOrders = revenueData[0]?.count || 0;

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
        // kept under the old mpesa names so the admin dashboard keeps working
        mpesaRevenue: totalRevenue,
        mpesaOrders: paidOrders,
      },
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};
