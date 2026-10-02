import crypto from "crypto";
import mongoose from "mongoose";
import Coupon from "../models/couponModel.js";
import Order from "../models/orderModel.js";
import PendingOrder from "../models/pendingorderModel.js"; // ⚠️ check filename casing on Linux
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { generateOrderNumber } from "../lib/generateOrderNumber.js";
import { reduceStock, handleCouponLogic } from "./orderController.js";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

// Read lazily so it works regardless of when dotenv.config() runs.
// Set MPESA_ENV=production when you go live.
const baseUrl = () =>
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const daraja = (path, options = {}) =>
  fetch(`${baseUrl()}${path}`, {
    ...options,
    signal: AbortSignal.timeout(15000),
  });

const ack = (res) =>
  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });

const generateToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  const response = await daraja(
    "/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error("Could not get M-Pesa access token");
  }
  return data.access_token;
};

// Daraja expects Nairobi time (EAT), not the server's timezone
const getTimestamp = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
};

// Returns 2547XXXXXXXX / 2541XXXXXXXX, or null when the number is invalid
const normalisePhone = (phone) => {
  let p = String(phone || "").replace(/[\s\-()]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  else if (p.startsWith("0")) p = `254${p.slice(1)}`;
  else if (/^[71]\d{8}$/.test(p)) p = `254${p}`;
  return /^254[71]\d{8}$/.test(p) ? p : null;
};

const cleanShippingAddress = (a) => {
  const required = ["fullName", "phoneNumber", "county", "area"];
  if (!a || required.some((k) => !String(a[k] ?? "").trim())) {
    throw new BadRequest(
      "Shipping address needs fullName, phoneNumber, county and area",
    );
  }
  return {
    fullName: String(a.fullName).trim(),
    phoneNumber: String(a.phoneNumber).trim(),
    county: String(a.county).trim(),
    area: String(a.area).trim(),
    landmark: String(a.landmark ?? "").trim(),
    houseNumber: String(a.houseNumber ?? "").trim(),
  };
};

// Prices ALWAYS come from the database, never from the client.
const calculateOrderTotals = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequest("Cart is empty");
  }

  // merge duplicate lines so the stock check is against the combined quantity
  const wanted = new Map();
  for (const item of items) {
    const id = String(item?._id || item?.id || item?.product || "");
    const qty = Number(item?.quantity);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequest("Invalid product in cart");
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      throw new BadRequest("Invalid quantity in cart");
    }
    wanted.set(id, (wanted.get(id) || 0) + qty);
  }

  const dbProducts = await Product.find({ _id: { $in: [...wanted.keys()] } });
  let total = 0;
  const validatedProducts = [];

  for (const [id, quantity] of wanted) {
    const product = dbProducts.find((p) => p._id.toString() === id);
    if (!product)
      throw new BadRequest("A product in your cart no longer exists");
    if (product.stock < quantity) {
      throw new BadRequest(`${product.name} is out of stock`);
    }
    total += product.price * quantity;
    validatedProducts.push({
      product: product._id,
      quantity,
      price: product.price,
    });
  }

  return { total, validatedProducts };
};

// Safaricom does not sign callbacks, so the callback URL carries a secret.
// stkPush appends ?secret=<MPESA_CALLBACK_SECRET> to CALLBACK_URL itself,
// so CALLBACK_URL in .env must be the PLAIN url (no query string).
const isValidCallbackSecret = (provided) => {
  const expected = process.env.MPESA_CALLBACK_SECRET;
  if (!expected) return false; // fail closed
  const a = Buffer.from(String(provided || ""));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// ─────────────────────────────────────────────────────────────
// STK PUSH
// ─────────────────────────────────────────────────────────────

export const stkPush = async (req, res) => {
  try {
    const { phone, products, couponCode, shippingAddress } = req.body;

    const phoneNumber = normalisePhone(phone);
    if (!phoneNumber) {
      return res
        .status(400)
        .json({ message: "Enter a valid Safaricom number, e.g. 0712345678" });
    }

    // Validate EVERYTHING before asking the customer to pay, otherwise the
    // order could fail to save after the money has already been taken.
    const address = cleanShippingAddress(shippingAddress);
    const { total, validatedProducts } = await calculateOrderTotals(products);

    let finalTotal = total;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: String(couponCode), // String() blocks {"$ne": null} style injection
        userId: req.user._id,
        isActive: true,
        expirationDate: { $gt: new Date() },
      });
      if (!coupon) throw new BadRequest("Coupon is invalid or expired");
      finalTotal -= (finalTotal * coupon.discountPercentage) / 100;
      appliedCouponCode = coupon.code;
    }

    finalTotal = Math.round(finalTotal);
    if (finalTotal < 1) throw new BadRequest("Order total is too low to pay");

    if (!process.env.CALLBACK_URL || !process.env.MPESA_CALLBACK_SECRET) {
      console.error("CALLBACK_URL or MPESA_CALLBACK_SECRET is not set");
      throw new Error("M-Pesa is not configured");
    }

    const token = await generateToken();
    const timestamp = getTimestamp();
    const shortcode = process.env.SHORT_CODE;
    const password = Buffer.from(
      shortcode + process.env.PASSKEY + timestamp,
    ).toString("base64");

    const response = await daraja("/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline", // use CustomerBuyGoodsOnline for a Till
        Amount: finalTotal,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        // CALLBACK_URL must be the plain URL; the secret is appended here
        CallBackURL: `${process.env.CALLBACK_URL}?secret=${encodeURIComponent(process.env.MPESA_CALLBACK_SECRET)}`,
        // Daraja limits: AccountReference 12 chars, TransactionDesc 13 chars
        AccountReference: "Furniture",
        TransactionDesc: "Payment",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (data.ResponseCode !== "0" || !data.CheckoutRequestID) {
      console.error("STK push rejected:", data);
      return res
        .status(400)
        .json({ message: "STK push failed. Please try again.", error: data });
    }

    try {
      await PendingOrder.create({
        checkoutRequestId: data.CheckoutRequestID,
        userId: req.user._id,
        products: validatedProducts,
        totalAmount: finalTotal,
        couponCode: appliedCouponCode,
        shippingAddress: address,
        phone: phoneNumber,
        status: "pending",
      });
    } catch (err) {
      // The customer already has the prompt on their phone – this must be seen
      console.error(
        "CRITICAL: STK sent but PendingOrder not saved",
        data.CheckoutRequestID,
        err,
      );
      throw err;
    }

    return res.status(200).json({
      success: true,
      CheckoutRequestID: data.CheckoutRequestID,
      totalAmount: finalTotal,
    });
  } catch (error) {
    console.error("stkPush error:", error);
    const status = error.status || 500;
    return res.status(status).json({
      message: status === 500 ? "Payment could not be started" : error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// MPESA CALLBACK  (public route – must NOT use protectRoute)
// ─────────────────────────────────────────────────────────────

export const mpesaCallback = async (req, res) => {
  try {
    if (!isValidCallbackSecret(req.query.secret)) {
      console.warn("M-Pesa callback rejected: bad or missing secret");
      return res.status(403).json({ message: "Forbidden" });
    }

    const callback = req.body?.Body?.stkCallback;
    const checkoutRequestId = callback?.CheckoutRequestID;

    if (!checkoutRequestId) {
      return res.status(400).json({ message: "Invalid callback" });
    }

    // Don't log the whole body/headers in production – it contains phone numbers
    console.log(
      "M-Pesa callback:",
      checkoutRequestId,
      callback.ResultCode,
      callback.ResultDesc,
    );

    // ── Payment failed / cancelled / timed out ───────────────────────────────
    if (Number(callback.ResultCode) !== 0) {
      // only touch orders that are still pending – never flip a completed one
      await PendingOrder.findOneAndUpdate(
        { checkoutRequestId, status: "pending" },
        { status: "failed" },
      );
      return ack(res);
    }

    const items = callback.CallbackMetadata?.Item || [];
    const getValue = (name) => items.find((i) => i.Name === name)?.Value;
    const receipt = getValue("MpesaReceiptNumber");
    const amount = getValue("Amount");

    if (!receipt) {
      console.error(
        "CRITICAL: success callback without receipt",
        checkoutRequestId,
      );
      return ack(res);
    }

    const pending = await PendingOrder.findOne({ checkoutRequestId });
    if (!pending) {
      console.error(
        "CRITICAL: paid but no PendingOrder",
        checkoutRequestId,
        receipt,
      );
      return ack(res);
    }

    if (pending.status === "completed") return ack(res); // duplicate callback

    if (Number(amount) !== pending.totalAmount) {
      console.error("CRITICAL: amount mismatch", {
        checkoutRequestId,
        receipt,
        paid: amount,
        expected: pending.totalAmount,
      });
      return ack(res);
    }

    // Snapshot name + image on the order (PendingOrder only stores ids)
    const dbProducts = await Product.find({
      _id: { $in: pending.products.map((p) => p.product) },
    }).select("name images");

    const orderNumber = await generateOrderNumber();

    let order;
    try {
      order = await Order.create({
        user: pending.userId,
        products: pending.products.map((p) => {
          const db = dbProducts.find((d) => d._id.equals(p.product));
          return {
            product: p.product,
            name: db?.name || "Product",
            image: db?.images?.[0]?.url || "",
            quantity: p.quantity,
            price: p.price,
          };
        }),
        totalAmount: pending.totalAmount,
        paymentMethod: "mpesa",
        paymentStatus: "paid",
        orderStatus: "processing",
        transactionId: receipt,
        mpesaReceiptNumber: receipt,
        mpesaCheckoutRequestId: checkoutRequestId,
        mpesaPhoneNumber: pending.phone,
        orderNumber,
        shippingAddress: pending.shippingAddress,
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch (err) {
      // Duplicate key = a concurrent/duplicate callback already created it.
      if (err.code === 11000) {
        const dup = await Order.findOne({
          mpesaCheckoutRequestId: checkoutRequestId,
        });
        if (dup) {
          await PendingOrder.findOneAndUpdate(
            { checkoutRequestId },
            { status: "completed", orderId: dup._id, trnxId: receipt },
          );
          return ack(res);
        }
      }
      throw err;
    }

    // Confirm to the polling page FIRST, so a later failure can't leave the
    // customer stuck on "waiting…" after they've been charged.
    await PendingOrder.findOneAndUpdate(
      { checkoutRequestId },
      { status: "completed", orderId: order._id, trnxId: receipt },
    );

    // Stock + coupons + cart cleanup only run for the callback that created the order
   try {
     await User.updateOne(
       { _id: pending.userId },
       {
         $pull: {
           cartItems: {
             productId: { $in: pending.products.map((p) => p.product) },
           },
         },
       },
     );
   } catch (err) {
     console.error("Cart cleanup failed for order", order._id, err);
   }

   try {
     await reduceStock(order.products);
   } catch (err) {
     console.error("reduceStock failed for order", order._id, err);
   }

   try {
     await handleCouponLogic(
       pending.userId,
       pending.couponCode,
       pending.totalAmount,
     );
   } catch (err) {
     console.error("Coupon logic failed for order", order._id, err);
   }
    console.log("M-Pesa order created:", order._id);
    return ack(res);
  } catch (error) {
    // Customer may have paid with no order saved – needs alerting/reconciliation
    console.error("CRITICAL mpesaCallback error:", error);
    return ack(res); // 200 so Safaricom doesn't keep hammering the endpoint
  }
};

// ─────────────────────────────────────────────────────────────
// CONFIRM MPESA ORDER
// Called by MpesaPendingPage polling every 4 seconds (route must use protectRoute)
// ─────────────────────────────────────────────────────────────

export const confirmMpesaOrder = async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ error: "checkoutRequestId is required" });
    }

    const pending = await PendingOrder.findOne({
      checkoutRequestId: String(checkoutRequestId),
    });

    // Same 404 for "not yours" so ids can't be probed
    if (!pending || pending.userId.toString() !== String(req.user?._id)) {
      return res.status(404).json({
        error:
          "Session expired or not found. Contact support if money was deducted.",
      });
    }

    if (pending.status === "completed" && pending.orderId) {
      return res.status(200).json({
        success: true,
        orderId: pending.orderId,
        message: "Payment confirmed",
      });
    }

    if (pending.status === "failed") {
      return res.status(400).json({
        error: "Payment was cancelled or failed. Please try again.",
      });
    }

    return res.status(202).json({
      pending: true,
      message: "Waiting for Safaricom to confirm...",
    });
  } catch (error) {
    console.error("confirmMpesaOrder error:", error);
    return res.status(500).json({ message: "Confirmation failed" });
  }
};
