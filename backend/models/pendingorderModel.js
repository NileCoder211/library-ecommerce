import mongoose from "mongoose";

const pendingOrderSchema = new mongoose.Schema(
  {
    checkoutRequestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    couponCode: {
      type: String,
      default: null,
    },
    products: [
      {
        // ✅ field is "product" — matches what mpesaController saves
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
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

      landmark: String,

      houseNumber: String,
    },
    // Written by the callback once Safaricom confirms
    trnxId: {
      type: String,
      default: null,
    },
    // ✅ Written by callback once order is created — confirmMpesaOrder reads this
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true },
);

// Auto-delete 2 hours after creation — enough time for any polling to finish
pendingOrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

const PendingOrder = mongoose.model("PendingOrder", pendingOrderSchema);

export default PendingOrder;