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

    // ── Categorization ───────────────────────────────────────────────────────
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ name: "text", description: "text", category: "text" });
const Product = mongoose.model("Product", productSchema);

export default Product;
