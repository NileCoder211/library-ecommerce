import Coupon from "../models/couponModel.js";

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });

    res.json(coupon || null);
  } catch (error) {
    console.log("Error in getCoupon controller", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({
      code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    // coupon expired
    if (coupon.expirationDate < new Date()) {
      await Coupon.findByIdAndUpdate(
        coupon._id,
        { isActive: false },
        { returnDocument: "after" }
      );

      return res.status(404).json({
        message: "Coupon expired",
      });
    }

    return res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.log("Error in validateCoupon controller", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};