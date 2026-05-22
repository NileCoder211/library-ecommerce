
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

// ─────────────────────────────────────────────────────────────
// GET CART PRODUCTS
// ─────────────────────────────────────────────────────────────
export const getCartProducts = async (req, res) => {
	try {
		const products = await Product.find({
			_id: {
				$in: req.user.cartItems.map((item) => item.id),
			},
		});

		const cartItems = products.map((product) => {
			const item = req.user.cartItems.find(
				(cartItem) => cartItem.id === product.id
			);

			return {
				...product.toJSON(),
				quantity: item.quantity,
			};
		});

		res.json(cartItems);
	} catch (error) {
		console.log(
			"Error in getCartProducts controller",
			error.message
		);

		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
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
			(item) => item.id === productId
		);

		if (existingItem) {
			await User.updateOne(
				{
					_id: req.user._id,
					"cartItems.id": productId,
				},
				{
					$inc: {
						"cartItems.$.quantity": 1,
					},
				}
			);
		} else {
			await User.findByIdAndUpdate(
				req.user._id,
				{
					$push: {
						cartItems: {
							id: productId,
							quantity: 1,
						},
					},
				},
				{
					returnDocument: "after",
				}
			);
		}

		const updatedUser = await User.findById(req.user._id);

		res.json(updatedUser.cartItems);
	} catch (error) {
		console.log(
			"Error in addToCart controller",
			error.message
		);

		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};

// ─────────────────────────────────────────────────────────────
// REMOVE ALL FROM CART
// ─────────────────────────────────────────────────────────────
export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;

		if (!productId) {
			await User.findByIdAndUpdate(
				req.user._id,
				{
					$set: {
						cartItems: [],
					},
				},
				{
					returnDocument: "after",
				}
			);
		} else {
			await User.findByIdAndUpdate(
				req.user._id,
				{
					$pull: {
						cartItems: {
							id: productId,
						},
					},
				},
				{
					returnDocument: "after",
				}
			);
		}

		const updatedUser = await User.findById(req.user._id);

		res.json(updatedUser.cartItems);
	} catch (error) {
		console.log(
			"Error in removeAllFromCart controller",
			error.message
		);

		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};

// ─────────────────────────────────────────────────────────────
// UPDATE QUANTITY
// ─────────────────────────────────────────────────────────────
export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;

		const { quantity } = req.body;

		if (quantity === 0) {
			await User.findByIdAndUpdate(
				req.user._id,
				{
					$pull: {
						cartItems: {
							id: productId,
						},
					},
				},
				{
					returnDocument: "after",
				}
			);

			const updatedUser = await User.findById(
				req.user._id
			);

			return res.json(updatedUser.cartItems);
		}

		const updated = await User.updateOne(
			{
				_id: req.user._id,
				"cartItems.id": productId,
			},
			{
				$set: {
					"cartItems.$.quantity": quantity,
				},
			}
		);

		if (updated.matchedCount === 0) {
			return res.status(404).json({
				message: "Product not found",
			});
		}

		const updatedUser = await User.findById(req.user._id);

		res.json(updatedUser.cartItems);
	} catch (error) {
		console.log(
			"Error in updateQuantity controller",
			error.message
		);

		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};

// ─────────────────────────────────────────────────────────────
// CLEAR CART
// ─────────────────────────────────────────────────────────────
export const clearCart = async (req, res) => {
	try {
		await User.findByIdAndUpdate(
			req.user._id,
			{
				$set: {
					cartItems: [],
				},
			},
			{
				returnDocument: "after",
			}
		);

		res.json({
			success: true,
		});
	} catch (error) {
		console.log(
			"Error in clearCart controller",
			error.message
		);

		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};



/* 
export const getCartProducts = async (req, res) => {
	try {
		const products = await Product.find({ _id: { $in: req.user.cartItems } });

		const cartItems = products.map((product) => {
			const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
			return { ...product.toJSON(), quantity: item.quantity };
		});

		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		const existingItem = user.cartItems.find((item) => item.id === productId);
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push(productId);
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;
		if (!productId) {
			user.cartItems = [];
		} else {
			user.cartItems = user.cartItems.filter((item) => item.id !== productId);
		}
		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;
		const existingItem = user.cartItems.find((item) => item.id === productId);

		if (existingItem) {
			if (quantity === 0) {
				user.cartItems = user.cartItems.filter((item) => item.id !== productId);
				await user.save();
				return res.json(user.cartItems);
			}

			existingItem.quantity = quantity;
			await user.save();
			res.json(user.cartItems);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const clearCart = async (req, res) => {
	try {
		const user = req.user; // ✅ already available from auth middleware — no User import needed

		user.cartItems = [];
		await user.save();

		res.json({ success: true });
	} catch (error) {
		console.log("Error in clearCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
}; */