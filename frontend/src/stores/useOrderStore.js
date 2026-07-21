import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useOrderStore = create((set, get) => ({
  orders: [],
  order: null,
  analytics: null,

  loading: false,
  creatingOrder: false,
  updatingOrder: false,

  // ─────────────────────────────────────────────
  // CREATE STRIPE ORDER
  // ─────────────────────────────────────────────
  createStripeOrder: async (orderData) => {
    set({ creatingOrder: true });

    try {
    const res = await axios.post(
  "/orders/stripe",
  orderData
);

      toast.success("Stripe checkout created");

      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create Stripe order"
      );

      return {
        success: false,
      };
    } finally {
      set({ creatingOrder: false });
    }
  },

  // ─────────────────────────────────────────────
  // CREATE MPESA ORDER
  // ─────────────────────────────────────────────
  createMpesaOrder: async (orderData) => {
    set({ creatingOrder: true });

    try {
     const res = await axios.post(
  "/orders/mpesa",
  orderData
);

      toast.success("M-Pesa request sent");

      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to initiate M-Pesa payment"
      );

      return {
        success: false,
      };
    } finally {
      set({ creatingOrder: false });
    }
  },

  // ─────────────────────────────────────────────
  // FETCH USER ORDERS
  // ─────────────────────────────────────────────
  fetchUserOrders: async () => {
    set({ loading: true });

    try {
      const res = await axios.get(
  "/orders/my-orders"
);

      set({
        orders: res.data.orders || [],
      });

      return {
        success: true,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch your orders"
      );

      return {
        success: false,
      };
    } finally {
      set({ loading: false });
    }
  },

  // ─────────────────────────────────────────────
  // FETCH ALL ORDERS (ADMIN)
  // ─────────────────────────────────────────────
  fetchAllOrders: async (
    page = 1,
    status = "",
    search = ""
  ) => {
    set({ loading: true });

    try {
      const query = new URLSearchParams({
        page,
        status,
        search,
      }).toString();

      //  fetchAllOrders
const res = await axios.get(`/orders/all?${query}`);  // ✅ was /admin/orders

      set({
        orders: res.data.orders || [],
      });

      return {
        success: true,
        pagination: res.data.pagination,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch orders"
      );

      return {
        success: false,
      };
    } finally {
      set({ loading: false });
    }
  },

  // ─────────────────────────────────────────────
  // FETCH SINGLE ORDER
  // ─────────────────────────────────────────────
  fetchSingleOrder: async (orderId) => {
    set({ loading: true });

    try {
     const res = await axios.get(
  `/orders/${orderId}`
);
      set({
        order: res.data.order,
      });

      return {
        success: true,
        data: res.data.order,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch order"
      );

      return {
        success: false,
      };
    } finally {
      set({ loading: false });
    }
  },

  // ─────────────────────────────────────────────
  // UPDATE ORDER STATUS (ADMIN)
  // ─────────────────────────────────────────────
  updateOrderStatus: async (
    orderId,
    orderStatus
  ) => {
    set({ updatingOrder: true });

    try {
    const res = await axios.patch(
  `/orders/${orderId}/status`,
  { orderStatus }
);

      set((state) => ({
        orders: state.orders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus:
                  res.data.order.orderStatus,
              }
            : order
        ),

        order:
          state.order?._id === orderId
            ? res.data.order
            : state.order,
      }));

      toast.success("Order updated successfully");

      return {
        success: true,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update order"
      );

      return {
        success: false,
      };
    } finally {
      set({ updatingOrder: false });
    }
  },

  // ─────────────────────────────────────────────
  // CANCEL ORDER (USER)
  // ─────────────────────────────────────────────
  cancelOrder: async (orderId) => {
    set({ updatingOrder: true });

    try {
     const res = await axios.patch(
  `/orders/${orderId}/cancel`
);

      set((state) => ({
        orders: state.orders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: "cancelled",
              }
            : order
        ),
      }));

      toast.success(
        res.data.message || "Order cancelled"
      );

      return {
        success: true,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to cancel order"
      );

      return {
        success: false,
      };
    } finally {
      set({ updatingOrder: false });
    }
  },

  // ─────────────────────────────────────────────
  // DELETE ORDER (ADMIN)
  // ─────────────────────────────────────────────
  deleteOrder: async (orderId) => {
    set({ loading: true });

    try {
      await axios.delete(`/orders/${orderId}`);

      set((state) => ({
        orders: state.orders.filter(
          (order) => order._id !== orderId
        ),
      }));

      toast.success("Order deleted");

      return {
        success: true,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete order"
      );

      return {
        success: false,
      };
    } finally {
      set({ loading: false });
    }
  },

  // ─────────────────────────────────────────────
  // FETCH ORDER ANALYTICS (ADMIN)
  // ─────────────────────────────────────────────
  fetchOrderAnalytics: async () => {
    set({ loading: true });

    try {
      const res = await axios.get(
  "/admin/orders/analytics"
);

      set({
        analytics: res.data,
      });

      return {
        success: true,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch analytics"
      );

      return {
        success: false,
      };
    } finally {
      set({ loading: false });
    }
  },

  // ─────────────────────────────────────────────
  // RETRY MPESA PAYMENT
  // ─────────────────────────────────────────────
  retryMpesaPayment: async (orderId) => {
    set({ loading: true });

    try {
      const res = await axios.post(`/orders/${orderId}/retry-mpesa`);
      toast.success( res.data.message ||  "M-Pesa payment retried" );

      return {success: true, data: res.data,};
    } catch (error) {
      toast.error(error.response?.data?.message ||  "Failed to retry payment" );

      return {success: false,};
    } finally {
      set({ loading: false });
    }
  },

  // ─────────────────────────────────────────────
  // CLEAR SINGLE ORDER
  // ─────────────────────────────────────────────
  clearOrder: () => {
    set({
      order: null,
    });
  },
}));