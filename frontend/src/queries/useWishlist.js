import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useGuestWishlistStore } from "../stores/useGuestWishlistStore";

// ── Fetch wishlist ────────────────────────────────────────────────────────────
// Logged in  -> server wishlist
// Guest      -> local wishlist (no request is sent, so no 401s)
// The `enabled` argument is kept so existing calls like useWishlist(!!user)
// keep working; the hook also checks the user itself, so a bare
// useWishlist() is safe for guests too.
export const useWishlist = (enabled = true) => {
  const user = useUserStore((s) => s.user);
  const guestItems = useGuestWishlistStore((s) => s.items);
  const loggedIn = enabled && !!user;

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await axios.get("/wishlist");
      return res.data;
    },
    enabled: loggedIn,
  });

  return loggedIn ? query : { ...query, data: guestItems };
};

// ── Toggle like / unlike ──────────────────────────────────────────────────────
export const useToggleLike = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((s) => s.user);
  const guestToggle = useGuestWishlistStore((s) => s.toggle);

  return useMutation({
    mutationFn: async (product) => {
      if (!user) {
        return { liked: guestToggle(product), product, guest: true };
      }
      const res = await axios.post(`/wishlist/${product._id}`);
      return { liked: res.data.liked, product, guest: false };
    },

    onSuccess: ({ liked, product, guest }) => {
      if (!guest) {
        queryClient.setQueryData(["wishlist"], (oldWishlist = []) =>
          liked
            ? [...oldWishlist, product]
            : oldWishlist.filter((p) => p._id !== product._id)
        );
      }
      toast.success(
        liked ? "Added to saved pieces" : "Removed from saved pieces"
      );
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update wishlist");
    },
  });
};

// ── Check if a product is liked ───────────────────────────────────────────────
export const useIsLiked = (productId, enabled = true) => {
  const { data: wishlist = [] } = useWishlist(enabled);
  return wishlist.some((p) => p._id === productId);
};

// ── Merge guest wishlist into the account after login/signup ──────────────────
// Call this ONCE near the top of your app (e.g. inside <App />), below the
// QueryClientProvider.
export const useMergeGuestWishlist = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((s) => s.user);
  const running = useRef(false);

  useEffect(() => {
    if (!user || running.current) return;

    const { items, clear } = useGuestWishlistStore.getState();
    if (items.length === 0) return;

    running.current = true;

    (async () => {
      try {
        // The server endpoint TOGGLES, so only send items the account
        // doesn't already have, otherwise we would un-save them.
        const { data: serverList } = await axios.get("/wishlist");
        const have = new Set(serverList.map((p) => p._id));

        for (const item of items) {
          if (have.has(item._id)) continue;
          try {
            await axios.post(`/wishlist/${item._id}`);
          } catch (err) {
            // e.g. the product was deleted meanwhile — skip it
            console.warn("Could not merge wishlist item", item._id);
          }
        }

        clear();
        await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      } catch (err) {
        console.error("Wishlist merge failed:", err);
      } finally {
        running.current = false;
      }
    })();
  }, [user, queryClient]);
};
