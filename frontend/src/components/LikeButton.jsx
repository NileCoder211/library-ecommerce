import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useToggleLike, useIsLiked } from "../queries/useWishlist";
import toast from "react-hot-toast";

const LikeButton = ({ product, size = 18, className = "" }) => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  const toggleLikeMutation = useToggleLike();
  const liked = useIsLiked(product._id, !!user);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to save products");
      navigate("/login");
      return;
    }

    toggleLikeMutation.mutate(product);
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleLikeMutation.isPending}
      aria-label={liked ? "Remove from saved" : "Save product"}
      className={`flex items-center justify-center rounded-full transition-all duration-200
        ${liked
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-gray-900 hover:text-red-500 hover:bg-red-50"
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