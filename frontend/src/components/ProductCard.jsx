import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

import { useUserStore } from "../stores/useUserStore";
import { useAddToCart } from "../queries/useCart";
import LikeButton from "./LikeButton";
import WhatsAppButton from "./whatsapp/WhatsAppButton";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();
  const addToCartMutation = useAddToCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }
    addToCartMutation.mutate(product);
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login first", { id: "login" });
      return;
    }
    addToCartMutation.mutate(product, {
      onSuccess: () => navigate("/cart"),
    });
  };

  const handleMakeOrder = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/make-order/${product._id}`);
  };

  return (
    <div className="group w-full">
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden rounded-xl h-92 bg-gray-900 cursor-pointer">

          {/* STOCK BADGE */}
          {product.stock === 0 && (
            <span className="absolute top-3 left-3 z-20 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-md">
              Out of Stock
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="absolute top-3 left-3 z-20 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-md">
              Only {product.stock} left
            </span>
          )}
          {product.stock > 5 && (
            <span className="absolute top-3 left-3 z-20 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-md">
              In Stock
            </span>
          )}

          {/* LIKE BUTTON */}
          <LikeButton
            product={product}
            size={16}
            className="absolute top-3 right-3 z-20 w-8 h-8 shadow-sm"
          />

          {/* IMAGE */}
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition duration-300" />

          {/* ACTION BUTTONS */}
          <div className="absolute inset-x-0 bottom-4 z-10 px-4 flex items-center justify-between gap-3 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">

            {/* Left — Buy Now or Make Order */}
            {product.stock > 0 ? (
              <button
                onClick={handleBuyNow}
                disabled={addToCartMutation.isPending}
                className="px-5 py-2 rounded-lg bg-black cursor-pointer text-white font-medium hover:bg-white hover:text-black transition disabled:opacity-50"
              >
                {addToCartMutation.isPending ? "Adding..." : "Buy Now"}
              </button>
            ) : (
              <button
                onClick={handleMakeOrder}
                className="px-5 py-2 rounded-lg bg-gray-700 text-white cursor-pointer font-medium"
              >
                Make Order
              </button>
            )}

            {/* Right — WhatsApp quick order + regular cart */}
            <div className="flex items-center gap-2">
              {/* Prevent the Link from triggering when clicking WhatsApp button */}
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <WhatsAppButton
                  product={{
                    id:    product._id,
                    name:  product.name,
                    price: product.price,
                    image: product.images?.[0]?.url || "",
                  }}
                  variant="icon"
                />
              </div>

              {/* Regular cart — only when in stock */}
              {product.stock > 0 && (
                <button
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  className="p-3 rounded-full cursor-pointer bg-black text-white hover:bg-white hover:text-black transition disabled:opacity-50"
                >
                  <ShoppingCart size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* PRODUCT INFO */}
      <div className="mt-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-black transition cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xl font-bold text-black">
          KES{" "}
          {Number(product.price).toLocaleString("en-KE", { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;