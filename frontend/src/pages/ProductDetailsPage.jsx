import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import axios from "../lib/axios";
import Footer from "../components/Footer";
import { useUserStore } from "../stores/useUserStore";
import { useAddToCart } from "../queries/useCart";
import categories from "../components/Categories";
import LikeButton from "../components/LikeButton";

const ProductDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);

  const { user } = useUserStore();
  const addToCartMutation = useAddToCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(`/products/${id}`);
      return res.data;
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }
    addToCartMutation.mutate(product);
  };

  const categoryLabel =
    categories.find((c) => c.name === product?.category)?.label ||
    product?.category;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 text-white mt-5">
      <div className="flex flex-col md:flex-row gap-10">

        {/* LEFT SIDE - IMAGES */}
        <div className="md:w-1/2 relative">
          <LikeButton
            product={product}
            size={22}
            className="absolute top-3 right-3 z-20 w-10 h-10 shadow-sm"
          />
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImage}
              src={product.images?.[activeImage]?.url}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-xl shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* THUMBNAILS */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {product.images?.map((img, index) => (
              <motion.img
                key={index}
                src={img.url}
                alt={`${product.name} thumbnail ${index + 1}`}
                onClick={() => setActiveImage(index)}
                className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition ${
                  activeImage === index
                    ? "border-gray-900 scale-105"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - DETAILS */}
        <div className="md:w-1/2 flex p-5 gap-5 flex-col justify-start">
          <p className="uppercase tracking-[0.2em] text-xs text-[#747878] mb-4 block font-semibold">
            {categoryLabel}
          </p>
          <h1 className="text-5xl md:text-7xl leading-none text-black tracking-tight font-serif mb-2">
            {product.name}
          </h1>
          <p className="text-2xl text-[#7c5730] font-serif">
            KES {Number(product.price).toLocaleString("en-KE", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-lg leading-relaxed text-[#444748] mt-6">
            {product.description}
          </p>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-col gap-3">

            {/* Row 1 — cart / out of stock */}
            <div className="flex gap-3">
              <button
                className={`flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 ${
                  product.stock === 0
                    ? "bg-red-500 cursor-not-allowed"
                    : "bg-black hover:bg-gray-400 cursor-pointer"
                }`}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCartMutation.isPending}
              >
                <ShoppingCart size={22} className="mr-2" />
                {product.stock === 0 ? "Out of stock" : "Add to cart"}
              </button>

              {product.stock === 0 && (
                <button
                  onClick={() => navigate(`/make-order/${product._id}`)}
                  className="bg-black hover:bg-gray-700 cursor-pointer text-white px-6 py-2 rounded-lg"
                >
                  Make Order
                </button>
              )}
            </div>

            {/* Row 2 — WhatsApp quick order (always available) */}
            <WhatsAppButton
              product={{
                id:    product._id,
                name:  product.name,
                price: product.price,
              }}
              variant="full"
            />

            <p className="text-xs text-gray-400">
              Order via WhatsApp for M-Pesa payment, delivery scheduling, and direct support.
            </p>
          </div>
        </div>
      </div>

      <div className="flex mt-15">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetailsPage;
