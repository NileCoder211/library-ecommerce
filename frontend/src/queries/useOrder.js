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

    onSuccess: (updatedOrder) => {
      // update in all orders list
      queryClient.setQueryData(
        ["orders", "all"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            orders: old.orders?.map((o) =>
              o._id === updatedOrder._id ? updatedOrder : o
            ),
          };
        }
      );

      // update single order cache
      queryClient.setQueryData(
        ["orders", updatedOrder._id],
        updatedOrder
      );

      toast.success("Order updated successfully");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update order"
      );
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
      o._id.toString() === orderId.toString() // ← add .toString() on both
        ? { ...o, orderStatus: "cancelled" }
        : o
    )
  );
  toast.success(message || "Order cancelled");
},

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to cancel order"
      );
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

    onSuccess: (orderId) => {
      queryClient.setQueryData(
        ["orders", "all"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            orders: old.orders?.filter((o) => o._id !== orderId),
          };
        }
      );
      toast.success("Order deleted");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete order"
      );
    },
  });
};

// ── Retry M-Pesa payment ──────────────────────────────────────────────────────
export const useRetryMpesa = () => {
  return useMutation({
    mutationFn: async (orderId) => {
      const res = await axios.post(`/orders/${orderId}/retry-mpesa`);
      return res.data;
    },

    onSuccess: (data) => {
      toast.success(data.message || "M-Pesa payment retried");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to retry payment"
      );
    },
  });
};

// ── Create Stripe order ───────────────────────────────────────────────────────
export const useCreateStripeOrder = () => {
  return useMutation({
    mutationFn: async (orderData) => {
      const res = await axios.post(
        "/payments/create-checkout-session", // ← fix this
        orderData
      );
      return res.data;
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create Stripe order"
      );
    },
  });
};

// ── Create M-Pesa order ───────────────────────────────────────────────────────
export const useCreateMpesaOrder = () => {
  return useMutation({
    mutationFn: async (orderData) => {
      const res = await axios.post(
        "/mpesa/stkpush", // ← fix this
        orderData
      );
      return res.data;
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to initiate M-Pesa payment"
      );
    },
  });
};