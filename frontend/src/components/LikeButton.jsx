import { Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import toast from "react-hot-toast";

/**
 * LikeButton — drop this anywhere you show a product.
 *
 * Props:
 *   product  — full product object
 *   size     — icon size (default 18)
 *   className — extra classes for the button wrapper
 */
const LikeButton = ({ product, size = 18, className = "" }) => {
  const { user } = useUserStore();
  const { isLiked, toggleLike } = useWishlistStore();
  const navigate = useNavigate();

  const liked = isLiked(product._id);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // prevent card navigation

    if (!user) {
      toast.error("Please login to save products");
      navigate("/login");
      return;
    }

    setLoading(true);
    await toggleLike(product);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={liked ? "Remove from saved" : "Save product"}
      className={`flex items-center justify-center rounded-full transition-all duration-200
        ${liked
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
    >
      <Heart
        size={size}
        className={`transition-all duration-200 ${liked ? "fill-red-500" : ""}`}
      />
    </button>
  );
};

export default LikeButton;