import mongoose from "mongoose";

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

    // ── Pricing ──────────────────────────────────────────────────────────────
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    // Price in KES for M-Pesa payments.
    // If your store operates in a single currency, remove this and convert
    // dynamically using an exchange-rate service instead.
    priceKES: {
      type: Number,
      min: 0,
      default: null, // null means "not separately set — derive from price"
    },

    // ── Media ────────────────────────────────────────────────────────────────
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String }, // Cloudinary public_id or similar
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
    // Lets admins enable/disable specific payment methods per product if needed.
    availablePaymentMethods: {
      type: [String],
      enum: ["stripe", "mpesa"],
      default: ["stripe", "mpesa"],
    },
  },
  { timestamps: true }
);

// ── Virtual: effective KES price ─────────────────────────────────────────────
// Returns priceKES if explicitly set, otherwise falls back to `price`.
// Useful when your base price is already in KES and you only use Stripe for USD.
productSchema.virtual("effectivePriceKES").get(function () {
  return this.priceKES != null ? this.priceKES : this.price;
});

// ── Helper: Stripe line-item shape ───────────────────────────────────────────
productSchema.methods.toStripeLineItem = function (quantity = 1) {
  return {
    price_data: {
      currency: "usd",
      product_data: {
        name: this.name,
        images: this.images.map((img) => img.url),
      },
      unit_amount: Math.round(this.price * 100), // cents
    },
    quantity,
  };
};

const Product = mongoose.model("Product", productSchema);

export default Product;