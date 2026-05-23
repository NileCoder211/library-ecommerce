import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const PeopleAlsoBought = ({product}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get("/products/recommendations");
        setRecommendations(res.data);
      } catch (error) {
        toast.error(
          error.response.data.message ||
            "An error occurred while fetching recommendations",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);
const handleAddToCart = (e, product) => {
  e.preventDefault();
  e.stopPropagation();

  if (!user) {
    toast.error("Please login to add products to cart", { id: "login" });
    return;
  }

  addToCart(product);
};

const handleBuyNow = (e, product) => {
  e.preventDefault();
  e.stopPropagation();

  if (!user) {
    toast.error("Please login first", { id: "login" });
    return;
  }

  addToCart(product);
  navigate("/cart");
};
  if (isLoading) return <LoadingSpinner />;
return (
  <div className="mt-8">
    <h3 className="text-2xl font-semibold text-gray-500">
      People also bought
    </h3>

   <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {recommendations.map((item) => (
    <div key={item._id}>
      <ProductCard product={item} />
    </div>
  ))}
</div>
  </div>
);
}
export default PeopleAlsoBought;
