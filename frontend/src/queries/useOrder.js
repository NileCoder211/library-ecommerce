import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import toast from "react-hot-toast";

// ── Fetch user orders ─────────────────────────────────────────────────────────
export const useUserOrders = (enabled = true) => {
  return useQuery({
    queryKey: ["orders", "my-orders"],
    queryFn: async () => {
      const res = await axios.get("/orders/my-orders");
      return res.data.orders ?? [];
    },
    enabled,
  });
};

// ── Fetch all orders (admin) ──────────────────────────────────────────────────
export const useAllOrders = ({ page = 1, status = "", search = "" } = {}) => {
  return useQuery({
    queryKey: ["orders", "all", page, status, search],
    queryFn: async () => {
      const query = new URLSearchParams({ page, status, search }).toString();
      const res = await axios.get(`/orders/all?${query}`);
      return res.data;
    },
    // keep the old page on screen while the next one loads (no table flicker)
    placeholderData: (previous) => previous,
  });
};

// ── Fetch single order ────────────────────────────────────────────────────────
export const useSingleOrder = (orderId) => {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      const res = await axios.get(`/orders/${orderId}`);
      return res.data.order;
    },
    enabled: !!orderId,
  });
};

// ── Fetch order analytics (admin) ─────────────────────────────────────────────
// NOTE: make sure the /admin/orders/analytics controller has no Stripe fields left
export const useOrderAnalytics = () => {
  return useQuery({
    queryKey: ["orders", "analytics"],
    queryFn: async () => {
      const res = await axios.get("/admin/orders/analytics");
      return res.data;
    },
  });
};

// ── Update order status (admin) ───────────────────────────────────────────────
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, orderStatus }) => {
      const res = await axios.patch(`/orders/${orderId}/status`, {
        orderStatus,
      });
      return res.data.order;
    },

    onSuccess: () => {
      // The admin list is cached under ["orders","all",page,status,search].
      // setQueryData(["orders","all"], …) never matched that key, so the table
      // didn't update. Invalidating by prefix refreshes every page/filter.
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // stock is restored when an order is cancelled
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Order updated successfully");
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update order");
    },
  });
};

// ── Cancel order (user) ───────────────────────────────────────────────────────
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId) => {
      const res = await axios.patch(`/orders/${orderId}/cancel`);
      return { orderId, message: res.data.message };
    },

    onSuccess: ({ orderId, message }) => {
      queryClient.setQueryData(["orders", "my-orders"], (old = []) =>
        old.map((o) =>
          String(o._id) === String(orderId)
            ? { ...o, orderStatus: "cancelled" }
            : o
        )
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(message || "Order cancelled");
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    },
  });
};

// ── Delete order (admin) ──────────────────────────────────────────────────────
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId) => {
      await axios.delete(`/orders/${orderId}`);
      return orderId;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted");
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete order");
    },
  });
};

// ── Create M-Pesa order (STK push) ────────────────────────────────────────────
export const useCreateMpesaOrder = () => {
  return useMutation({
    mutationFn: async (orderData) => {
      const res = await axios.post("/mpesa/stkpush", orderData);
      return res.data;
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to initiate M-Pesa payment"
      );
    },
  });
};
