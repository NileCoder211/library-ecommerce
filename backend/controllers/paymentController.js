import Coupon from "../models/couponModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { stripe } from "../lib/stripe.js";
import { generateOrderNumber } from "../lib/generateOrderNumber.js";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const createNewCoupon = async (userId) => {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code:
      "GIFT" +
      Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ),
    userId,
  });

  await newCoupon.save();
};

const handleCouponLogic = async (
  userId,
  couponCode,
  totalAmount
) => {
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      {
        code: couponCode,
        userId,
      },
      {
        isActive: false,
      }
    );
  }

  if (totalAmount >= 20000) {
    await createNewCoupon(userId);
  }
};

const calculateOrderTotals = async (products) => {
  let total = 0;
  const validatedProducts = [];

  for (const item of products) {
    const product = await Product.findById(item._id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < item.quantity) {
      throw new Error(`${product.name} is out of stock`);
    }

    total += product.price * item.quantity;

    validatedProducts.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  return {
    total,
    validatedProducts,
  };
};

const reduceStock = async (products) => {
  for (const item of products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        stock: -item.quantity,
      },
    });
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE CHECKOUT SESSION
// ─────────────────────────────────────────────────────────────

export const createCheckoutSession = async (
  req,
  res
) => {
  try {
    const {
      products,
      couponCode,
      shippingAddress
    } = req.body;

    if (!products?.length) {
      return res.status(400).json({
        message: "Products are required",
      });
    }


    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phoneNumber ||
      !shippingAddress?.county ||
      !shippingAddress?.area
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required",
      });
    }

    const {
      total,
      validatedProducts,
    } = await calculateOrderTotals(products);

    let finalTotal = total;

    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon) {
        finalTotal -=
          (finalTotal * coupon.discountPercentage) / 100;
      }
    }

    const line_items = validatedProducts.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Furniture Product",
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      line_items,

      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,

      metadata: {
        userId: req.user._id.toString(),

        products: JSON.stringify(
          validatedProducts
        ),

        couponCode: couponCode || "",

        shippingAddress: JSON.stringify(
          shippingAddress
        ),
      },
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// STRIPE SUCCESS
// ─────────────────────────────────────────────────────────────
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
const existingOrder = await Order.findOne({ stripeSessionId: session.id });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        order: existingOrder,
      });
    }

    // ─────────────────────────────────────────────
    // Parse metadata safely
    // ─────────────────────────────────────────────
    const rawProducts = session.metadata?.products
      ? JSON.parse(session.metadata.products)
      : [];

    const productIds = rawProducts.map((p) => p.product);

    // fetch full products from DB
    const dbProducts = await Product.find({
      _id: { $in: productIds },
    });

    // rebuild COMPLETE order products (IMPORTANT FIX)
    const products = rawProducts.map((item) => {
      const dbProduct = dbProducts.find(
        (p) => p._id.toString() === item.product
      );

      return {
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        name: dbProduct?.name || "Product",
        image: dbProduct?.images?.[0]?.url || "",
      };
    });

    // prevent empty products
    if (!products.length) {
      return res.status(400).json({
        message: "No valid products found for order",
      });
    }

    // ─────────────────────────────────────────────
    // shipping (optional safe parsing)
    // ─────────────────────────────────────────────
    let shippingAddress = {};

    try {
      shippingAddress = session.metadata?.shippingAddress
        ? JSON.parse(session.metadata.shippingAddress)
        : {};
    } catch (err) {
      console.log("Shipping parse error:", err);
    }

    const orderNumber = await generateOrderNumber("stripe");

   const order = await Order.create({
     user: session.metadata?.userId,
     products,
     totalAmount: session.amount_total / 100,
     paymentMethod: "stripe",
     paymentStatus: "paid",
     orderStatus: "processing",
     transactionId: session.payment_intent,
     stripeSessionId: session.id,
     stripePaymentIntentId: session.payment_intent,
     orderNumber,
     shippingAddress,
   });

    await reduceStock(products);

    await handleCouponLogic(
      session.metadata?.userId,
      session.metadata?.couponCode,
      session.amount_total / 100
    );

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};