import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: false,
    },

    image: {
      type: String,
      required: false,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderNumber: {
      type: String,
      unique: true,
      default: true,
    },

    products: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["stripe", "mpesa"],
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
      fullName: {
        type: String,
        required: true,
      },

      phoneNumber: {
        type: String,
        required: true,
      },

      county: {
        type: String,
        required: true,
      },

      area: {
        type: String,
        required: true,
      },

      landmark: {
        type: String,
        default: "",
      },

      houseNumber: {
        type: String,
        default: "",
      },
    },

    stripeSessionId: { type: String, sparse: true, unique: true },
    stripePaymentIntentId: String,

    mpesaCheckoutRequestId: String,
    mpesaReceiptNumber: String,

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