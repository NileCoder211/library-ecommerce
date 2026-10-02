import { create } from "zustand";
import { persist } from "zustand/middleware";

// Wishlist for visitors who are not logged in. Lives in localStorage and is
// merged into the user's account (see useMergeGuestWishlist) after login.
//
// We keep a small snapshot of each product so the wishlist page and
// ProductCard can render it without any server call.
const slim = (p) => ({
  _id: p._id,
  name: p.name,
  price: p.price,
  stock: p.stock,
  category: p.category,
  images: p.images?.slice(0, 1) || [],
});

export const useGuestWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      // returns true if the product is now liked, false if it was removed
      toggle: (product) => {
        const exists = get().items.some((p) => p._id === product._id);
        set({
          items: exists
            ? get().items.filter((p) => p._id !== product._id)
            : [...get().items, slim(product)],
        });
        return !exists;
      },

      clear: () => set({ items: [] }),
    }),
    { name: "guest-wishlist" }
  )
);
