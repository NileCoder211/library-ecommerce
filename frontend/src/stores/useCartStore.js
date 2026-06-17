import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set) => ({
  coupon: null,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const response = await axios.get("/coupons");

      set({
        coupon: response.data,
      });
    } catch (error) {
      console.error(error);
    }
  },

  applyCoupon: async (code) => {
    try {
      const response = await axios.post("/coupons/validate", {
        code,
      });

      set({
        coupon: response.data,
        isCouponApplied: true,
      });

      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to apply coupon"
      );
    }
  },

  removeCoupon: () => {
    set({
      coupon: null,
      isCouponApplied: false,
    });

    toast.success("Coupon removed");
  },
}));