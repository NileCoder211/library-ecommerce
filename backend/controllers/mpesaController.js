import Coupon from "../models/couponModel.js";
import Order from "../models/orderModel.js";
import PendingOrder from "../models/pendingorderModel.js";
import Product from "../models/productModel.js";
import { generateOrderNumber } from "../lib/generateOrderNumber.js";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const generateToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } },
  );

  const data = await response.json();
  return data.access_token;
};

const getTimestamp = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0") +
    String(d.getSeconds()).padStart(2, "0")
  );
};

const normalisePhone = (phone) => {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("0")) return `254${cleaned.substring(1)}`;
  if (cleaned.startsWith("+")) return cleaned.substring(1);
  return cleaned;
};

const calculateOrderTotals = async (products) => {
  let total = 0;
  const validatedProducts = [];

  for (const item of products) {
    // In calculateOrderTotals — make it handle both
    const product = await Product.findById(item._id || item.id);

    if (!product) throw new Error("Product not found");

    if (product.stock < item.quantity) {
      throw new Error(`${product.name} is out of stock`);
    }

    total += product.price * item.quantity;

    validatedProducts.push({
      product: product._id, // ✅ matches PendingOrder schema field name
      quantity: item.quantity,
      price: product.price,
    });
  }

  return { total, validatedProducts };
};

const reduceStock = async (products) => {
  for (const item of products) {
    const productId = item.product || item.id; // handle both field names safely
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -item.quantity },
    });
  }
};

// ─────────────────────────────────────────────────────────────
// STK PUSH
// ─────────────────────────────────────────────────────────────

export const stkPush = async (req, res) => {
  try {
    const { phone, products, couponCode, shippingAddress } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    const { total, validatedProducts } = await calculateOrderTotals(products);

    let finalTotal = total;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        finalTotal -= (finalTotal * coupon.discountPercentage) / 100;
      }
    }

    finalTotal = Math.round(finalTotal);

    const token = await generateToken();
    const timestamp = getTimestamp();
    const shortcode = process.env.SHORT_CODE;
    const passkey = process.env.PASSKEY;
    const password = Buffer.from(shortcode + passkey + timestamp).toString(
      "base64",
    );
    const phoneNumber = normalisePhone(phone);
    console.log("CALLBACK_URL being sent:", process.env.CALLBACK_URL);

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: finalTotal,
          PartyA: phoneNumber,
          PartyB: shortcode,
          PhoneNumber: phoneNumber,
          CallBackURL: process.env.CALLBACK_URL,
          AccountReference: "Furniture Order",
          TransactionDesc: "Furniture Payment",
        }),
      },
    );

    const data = await response.json();

    if (!data.CheckoutRequestID) {
      return res.status(400).json({ message: "STK push failed", error: data });
    }

    await PendingOrder.create({
      checkoutRequestId: data.CheckoutRequestID,
      userId: req.user._id,
      products: validatedProducts,
      totalAmount: finalTotal,
      couponCode,
      shippingAddress,
      phone: phoneNumber,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      CheckoutRequestID: data.CheckoutRequestID,
      totalAmount: finalTotal,
    });
  } catch (error) {
    console.error("stkPush error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// MPESA CALLBACK
// ─────────────────────────────────────────────────────────────

export const mpesaCallback = async (req, res) => {
   console.log("=== SAFARICOM CALLBACK ===");
   console.log("Headers:", JSON.stringify(req.headers, null, 2));
   console.log("Body:", JSON.stringify(req.body, null, 2));
   console.log("=========================");
  try {
    console.log("🔔 Safaricom callback:", JSON.stringify(req.body));

    const callback = req.body?.Body?.stkCallback;

    if (!callback) {
      return res.status(400).json({ message: "Invalid callback" });
    }

    const checkoutRequestId = callback.CheckoutRequestID;

    // Payment failed / cancelled
    if (!callback.CallbackMetadata) {
      console.log("Payment failed:", callback.ResultDesc);

      // ✅ findOneAndUpdate — avoids full document validation
      await PendingOrder.findOneAndUpdate(
        { checkoutRequestId },
        { status: "failed" },
      );

      return res.status(200).json({ message: "ok" });
    }

    const items = callback.CallbackMetadata.Item;
    const getValue = (name) => items.find((i) => i.Name === name)?.Value;

    const receipt = getValue("MpesaReceiptNumber");
    const amount = getValue("Amount");
    const phone = getValue("PhoneNumber");

    const pending = await PendingOrder.findOne({ checkoutRequestId });

    if (!pending) {
      console.warn("No PendingOrder for:", checkoutRequestId);
      return res.status(200).json({ message: "ok" });
    }

    // Duplicate protection
    const existingOrder = await Order.findOne({ transactionId: receipt });
    if (existingOrder) {
      // Mark completed so confirmMpesaOrder returns the right order
      await PendingOrder.findOneAndUpdate(
        { checkoutRequestId },
        { status: "completed", orderId: existingOrder._id, trnxId: receipt },
      );
      return res.status(200).json({ message: "ok" });
    }
    if (pending.status === "completed") {
      return res.json({
        ResultCode: 0,
        ResultDesc: "Already processed",
      });
    }

    const orderNumber = await generateOrderNumber("mpesa");

    const order = await Order.create({
      user: pending.userId,
      products: pending.products.map((p) => ({
        product: p.product || p.id,
        quantity: p.quantity,
        price: p.price,
      })),
      totalAmount: pending.totalAmount,
      paymentMethod: "mpesa",
      paymentStatus: "paid",
      orderStatus: "processing",
      transactionId: receipt,
      orderNumber,
      shippingAddress: pending.shippingAddress,
      phoneNumber: pending.phone,
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await reduceStock(pending.products);

    // ✅ findOneAndUpdate — skips full product array validation
    await PendingOrder.findOneAndUpdate(
      { checkoutRequestId },
      { status: "completed", orderId: order._id, trnxId: receipt },
    );

    console.log("✅ M-Pesa order created:", order._id);
    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error("mpesaCallback error:", error);
    res.status(200).json({ message: "ok" }); // always 200 so Safaricom doesn't retry
  }
};

// ─────────────────────────────────────────────────────────────
// CONFIRM MPESA ORDER
// Called by MpesaPendingPage polling every 4 seconds
// ─────────────────────────────────────────────────────────────

export const confirmMpesaOrder = async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ error: "checkoutRequestId is required" });
    }

    console.log("confirmMpesaOrder called with:", req.body.checkoutRequestId);
    const pending = await PendingOrder.findOne({ checkoutRequestId });
     console.log("PendingOrder found:", pending?.status, pending?.orderId);

    if (!pending) {
      return res.status(404).json({
        error:
          "Session expired or not found. Contact support if money was deducted.",
      });
    }

    // ── Safaricom confirmed payment failed ────────────────────────────────────
    if (pending.status === "failed") {
      return res.status(400).json({
        error: "Payment was cancelled or failed. Please try again.",
      });
    }

    // ── Callback completed successfully ───────────────────────────────────────
    if (pending.status === "completed" && pending.orderId) {
      return res.status(200).json({
        success: true,
        orderId: pending.orderId,
        message: "Payment confirmed",
      });
    }

    // ── Still waiting for Safaricom callback ──────────────────────────────────
    return res.status(202).json({
      pending: true,
      message: "Waiting for Safaricom to confirm...",
    });
  } catch (error) {
    console.error("confirmMpesaOrder error:", error);
    res
      .status(500)
      .json({ message: "Confirmation failed", error: error.message });
  }
};
