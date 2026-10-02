import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: false },
    image: { type: String, required: false },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ removed `default: true` – it stamped every order without a number with
    // the string "true", which then collided on the unique index.
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    products: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["mpesa"],
      default: "mpesa",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      county: { type: String, required: true },
      area: { type: String, required: true },
      landmark: { type: String, default: "" },
      houseNumber: { type: String, default: "" },
    },

    // sparse + unique: Safaricom retries callbacks, this stops duplicate orders
    mpesaCheckoutRequestId: { type: String, unique: true, sparse: true },
    mpesaReceiptNumber: { type: String, unique: true, sparse: true },
    mpesaPhoneNumber: String, // number that paid (needed for reversals)

    transactionId: String,

    estimatedDeliveryDate: Date,

    cancelledAt: Date,
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
