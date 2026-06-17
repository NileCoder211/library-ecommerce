import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCart = ( enabled = true ) => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axios.get("/cart");
      return res.data;
    },
    enabled, // ← only fetch when user is logged in
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product) => {
      const cart = queryClient.getQueryData(["cart"]) ?? [];
      const existing = cart.find((item) => item._id === product._id);

      if (existing) {
        await axios.put(`/cart/${product._id}`, {
          quantity: existing.quantity + 1,
        });
        return { wasExisting: true };  // ← pass intent to onSuccess
      } else {
        await axios.post("/cart", { productId: product._id });
        return { wasExisting: false };
      }
    },

    onSuccess: ({ wasExisting }) => {
      toast.success(
        wasExisting ? "Quantity increased in cart" : "Product added to cart"
      );
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      await axios.delete("/cart", {
        data: { productId },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
};

export const useUpdateQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }) => {
      const res = await axios.put(
        `/cart/${productId}`,
        {
          quantity,
        }
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axios.delete("/cart/clear");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      toast.success("Cart cleared");
    },
  });
};