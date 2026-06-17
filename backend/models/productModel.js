import mongoose from "mongoose";

const KES_TO_USD = 1 / 130; // 1 USD = 130 KES

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    // ── Pricing (KES) ────────────────────────────────────────────────────────
    price: {
      type: Number,
      min: 0,
      required: true,
    },

    // ── Media ────────────────────────────────────────────────────────────────
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
      },
    ],

    // ── Categorisation ───────────────────────────────────────────────────────
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ── Payment method availability ──────────────────────────────────────────
    availablePaymentMethods: {
      type: [String],
      enum: ["stripe", "mpesa"],
      default: ["stripe", "mpesa"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Helper: Stripe line-item shape (converts KES → USD) ──────────────────────
productSchema.methods.toStripeLineItem = function (quantity = 1) {
  return {
    price_data: {
      currency: "usd",
      product_data: {
        name: this.name,
        images: this.images.map((img) => img.url),
      },
      unit_amount: Math.round(this.price * KES_TO_USD * 100), // KES → USD cents
    },
    quantity,
  };
};

const Product = mongoose.model("Product", productSchema);

export default Product;