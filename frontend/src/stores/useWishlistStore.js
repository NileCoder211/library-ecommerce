import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useWishlistStore = create((set, get) => ({
  wishlist: [], // array of product objects
  loading: false,

  // ── Fetch all liked products ──────────────────────────────────────────────
  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/wishlist");
      set({ wishlist: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      set({ loading: false });
    }
  },

  // ── Toggle like / unlike ──────────────────────────────────────────────────
  toggleLike: async (product) => {
    try {
      const res = await axios.post(`/wishlist/${product._id}`);

      if (res.data.liked) {
        // Add to local wishlist
        set((state) => ({ wishlist: [...state.wishlist, product] }));
        toast.success("Added to saved pieces");
      } else {
        // Remove from local wishlist
        set((state) => ({
          wishlist: state.wishlist.filter((p) => p._id !== product._id),
        }));
        toast.success("Removed from saved pieces");
      }

      return res.data.liked;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update wishlist");
    }
  },

  // ── Check if a product is liked ───────────────────────────────────────────
  isLiked: (productId) => {
    return get().wishlist.some((p) => p._id === productId);
  },
}));
