import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import LikeButton from "./LikeButton";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }

    addToCart(product);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login first", { id: "login" });
      return;
    }

    addToCart(product);
    navigate("/cart");
  };

  const handleMakeOrder = (e) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ prevents click bubbling to the Link
    navigate(`/make-order/${product._id}`);
  };

  return (
    <div className="group w-full">
      {/* ✅ Link only wraps the image — not the entire card */}
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden rounded-xl h-92 bg-gray-900 cursor-pointer">

          {product.stock === 0 && (
            <span className="absolute top-3 left-3 z-20 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-md">
              Out of Stock
            </span>
          )}
          

          <LikeButton
            product={product}
            size={16}
            className="absolute top-3 right-3 z-20 w-8 h-8 shadow-sm"
          />

          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition duration-300" />

          <div className="absolute inset-x-0 bottom-4 z-10 px-4 flex items-center justify-between gap-3 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              {product.stock > 0 ? (
              <button
                onClick={handleBuyNow}
                className="px-5 py-2 rounded-lg bg-black cursor-pointer text-white font-medium hover:bg-white hover:text-black transition"
              >
                Buy Now
              </button>
            ) : (
              <button
                onClick={handleMakeOrder} // ✅ uses handler with stopPropagation
                className="px-5 py-2 rounded-lg bg-gray-700 text-white cursor-pointer font-medium"
              >
                Make Order
              </button>
            )}

            {product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                className="p-3 rounded-full cursor-pointer bg-black text-white hover:bg-white hover:text-black transition"
              >
                <ShoppingCart size={20} />
              </button>
            )}

           
          </div>
        </div>
      </Link>

      {/* ✅ Name and price are outside the Link — no accidental navigation */}
      <div className="mt-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-black transition cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xl font-bold text-black">
          KES {Number(product.price).toLocaleString("en-KE", { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;