import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/productModel.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    console.error("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error in getProductById controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    // if not in redis, fetch from mongodb
    // .lean() returns a plain JS object instead of a mongoose document — better performance
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts || featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    console.error("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, images, category, stock } = req.body;

    // ✅ Input validation
    if (!name || !description || !price || !category) {
      return res
        .status(400)
        .json({
          message: "name, description, price and category are required",
        });
    }
    if (Number(price) <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    // Normalize images input
    let normalizedImages = [];
    if (Array.isArray(images)) {
      normalizedImages = images.flat();
    } else if (typeof images === "string") {
      normalizedImages = [images];
    }

    if (normalizedImages.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // ✅ Use Promise.allSettled to handle partial upload failures gracefully
    const results = await Promise.allSettled(
      normalizedImages.map((img) =>
        cloudinary.uploader.upload(img, { folder: "products" }),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error(
        "Some images failed to upload:",
        failed.map((f) => f.reason),
      );
      return res
        .status(500)
        .json({
          message: "One or more images failed to upload. Please try again.",
        });
    }

    const formattedImages = results.map((r) => ({
      url: r.value.secure_url,
      public_id: r.value.public_id,
    }));

    const product = await Product.create({
      name,
      description,
      price,
      images: formattedImages,
      category,
      stock: stock || 0,
    });

    // ✅ Bust out-of-stock cache if new product has zero stock
    if (product.stock === 0) {
      await redis.del("out_of_stock_products");
    }

    if (product.isFeatured) {
      await updateFeaturedProductsCache();
    }

    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete all images from Cloudinary
    try {
      for (let img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    } catch (error) {
      console.error("Error deleting images from Cloudinary:", error.message);
    }

    await Product.findByIdAndDelete(req.params.id);
    await updateFeaturedProductsCache();
    await redis.del("out_of_stock_products");

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 4 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          images: 1,
          price: 1,
          stock: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.error("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.error("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;
    // ✅ Save first, then update cache once — not before save
    const updatedProduct = await product.save();
    await updateFeaturedProductsCache();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getOutOfStockProducts = async (req, res) => {
  try {
    let products = await redis.get("out_of_stock_products");

    if (products) {
      return res.json(JSON.parse(products));
    }

    products = await Product.find({ stock: 0 }).lean();

    await redis.set("out_of_stock_products", JSON.stringify(products));

    res.json(products);
  } catch (error) {
    console.error("Error in getOutOfStockProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: "Invalid stock value" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.stock = stock;
    await product.save();

    // Keep cache in sync
    await redis.del("out_of_stock_products");

    if (product.isFeatured) {
      await updateFeaturedProductsCache();
    }

    res.json(product);
  } catch (error) {
    console.error("Error in updateProductStock controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Cache error now logs the actual error message
async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.error("Error updating featured products cache:", error.message);
  }
}
