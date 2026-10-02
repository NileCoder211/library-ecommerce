import Product from "../models/productModel.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/products/search
//   ?q=corner+sofa&category=sofa&minPrice=20000&maxPrice=80000
//   &inStock=true&sort=relevance&page=1&limit=24
//
// `category` is the same string stored on the product (sofa, bed, dining,
// wardrobe, ...). Either `q` or `category` (or both) can be given.
export const searchProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort = "relevance",
      page = 1,
      limit = 24,
    } = req.query;

    const filter = {};

    const term = typeof q === "string" ? q.trim() : "";
    if (term) {
      // Needs a text index on the Product schema (see productModel.js)
      filter.$text = { $search: term };
    }

    if (typeof category === "string" && category.trim()) {
      filter.category = new RegExp(`^${escapeRegex(category.trim())}$`, "i");
    }

    if (inStock === "true") filter.stock = { $gt: 0 };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortStage = {};
    let projection = {};

    if (term && sort === "relevance") {
      // Sorting by textScore requires it in the projection too.
      projection = { score: { $meta: "textScore" } };
      sortStage = { score: { $meta: "textScore" } };
    } else {
      switch (sort) {
        case "price_asc":
          sortStage = { price: 1 };
          break;
        case "price_desc":
          sortStage = { price: -1 };
          break;
        default: // "newest" and anything else
          sortStage = { createdAt: -1 };
      }
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(60, Math.max(1, Number(limit) || 24));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(filter, projection)
        .sort(sortStage)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      query: {
        q: term || null,
        category: category || null,
        minPrice,
        maxPrice,
        inStock,
        sort,
      },
    });
  } catch (err) {
    console.error("searchProducts error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};

// GET /api/products/search/suggestions?q=sof
// Lightweight typeahead: substring match on name or category.
export const suggestProducts = async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(escapeRegex(q), "i");

    const suggestions = await Product.find(
      { $or: [{ name: regex }, { category: regex }] },
      { name: 1, price: 1, category: 1, images: { $slice: 1 } },
    )
      .limit(6)
      .lean();

    res.json({
      suggestions: suggestions.map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        category: p.category,
        image: p.images?.[0]?.url || null,
      })),
    });
  } catch (err) {
    console.error("suggestProducts error:", err);
    res.status(500).json({ message: "Suggestion lookup failed" });
  }
};
