import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  // ✅ Returns { success } so the form can react appropriately
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
      }));
      return { success: true };
    } catch (error) {
      // ✅ Safe optional chaining — won't crash on network errors
      toast.error(error.response?.data?.message || "Failed to create product");
      return { success: false };
    } finally {
      // ✅ loading always resets, even if set() throws
      set({ loading: false });
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products");
      set({ products: response.data.products });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      set({ loading: false });
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.filter(
          (product) => product._id !== productId,
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      set({ loading: false });
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: response.data.isFeatured }
            : product,
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      set({ loading: false });
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({ products: response.data });
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateProductStock: async (productId, stock) => {
    set({ loading: true });
    try {
      const res = await axios.patch(`/products/${productId}/stock`, { stock });
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId
            ? { ...product, stock: res.data.stock }
            : product,
        ),
      }));
      toast.success("Stock updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      set({ loading: false });
    }
  },

  fetchOutOfStockProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products/out-of-stock");
      // ✅ Backend returns a plain array directly — no ambiguity
      set({ products: res.data });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch out-of-stock products",
      );
    } finally {
      set({ loading: false });
    }
  },
}));
