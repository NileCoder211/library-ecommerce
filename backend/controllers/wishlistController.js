import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "name price images category stock",
    );
    res.status(200).json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

// POST /api/wishlist/:productId — toggle like/unlike
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(req.user._id);
    const isLiked = user.wishlist.includes(productId);

    if (isLiked) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    res.status(200).json({
      liked: !isLiked,
      wishlistCount: user.wishlist.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update wishlist" });
  }
};
