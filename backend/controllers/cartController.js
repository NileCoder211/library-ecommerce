import Product from "../models/productModel.js";
import User from "../models/userModel.js";

// ─────────────────────────────────────────────────────────────
// GET CART PRODUCTS
// ─────────────────────────────────────────────────────────────
export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({
      _id: { $in: req.user.cartItems.map((item) => item.productId) },
    });

    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.productId.toString() === product._id.toString()
      );

  console.log("product._id:", product._id.toString());
  console.log("cartItem productIds:", req.user.cartItems.map(c => c.productId?.toString()));
  console.log("matched item:", item);
      return { ...product.toJSON(), quantity: item ? item.quantity : 1 };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADD TO CART
// ─────────────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await User.findById(req.user._id);

    const existingItem = user.cartItems.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      await User.updateOne(
        { _id: req.user._id, "cartItems.productId": productId },
        { $inc: { "cartItems.$.quantity": 1 } }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { cartItems: { productId, quantity: 1 } } },
        { returnDocument: "after" }
      );
    }

    const updatedUser = await User.findById(req.user._id);

    res.json(updatedUser.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// REMOVE FROM CART
// ─────────────────────────────────────────────────────────────
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $set: { cartItems: [] } },
        { returnDocument: "after" }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { cartItems: { productId } } }, // ← was `id: productId`
        { returnDocument: "after" }
      );
    }

    const updatedUser = await User.findById(req.user._id);

    res.json(updatedUser.cartItems);
  } catch (error) {
    console.log("Error in removeAllFromCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE QUANTITY
// ─────────────────────────────────────────────────────────────
export const updateQuantity = async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;

    const user = await User.findById(req.user._id);

    const cartItem = user.cartItems.find(
      (item) => item.productId.toString() === String(productId) // ← was item.id
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity === 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item.productId.toString() !== String(productId) // ← was item.id
      );

      await user.save();

      return res.json(user.cartItems);
    }

    cartItem.quantity = quantity;

    await user.save();

    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// CLEAR CART
// ─────────────────────────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cartItems: [] } },
      { returnDocument: "after" }
    );

    res.json({ success: true });
  } catch (error) {
    console.log("Error in clearCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};