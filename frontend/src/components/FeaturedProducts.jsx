import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({ featuredProducts = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Column count changed (resize) → start from the beginning so we never
  // land on a half-empty slide
  useEffect(() => {
    setCurrentIndex(0);
  }, [itemsPerPage]);

  const maxIndex = Math.max(featuredProducts.length - itemsPerPage, 0);

  // also clamps if the list shrinks (e.g. admin un-features a product)
  const safeIndex = Math.min(currentIndex, maxIndex);

  const nextSlide = () =>
    setCurrentIndex(Math.min(safeIndex + itemsPerPage, maxIndex));

  const prevSlide = () =>
    setCurrentIndex(Math.max(safeIndex - itemsPerPage, 0));

  const isStartDisabled = safeIndex === 0;
  const isEndDisabled = safeIndex >= maxIndex;

  // Nothing featured → don't show an empty section with just a heading
  if (featuredProducts.length === 0) return null;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-5xl sm:text-6xl font-bold text-black mb-10">
          Featured Products
        </h2>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${safeIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 shrink-0 px-2"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Prev */}
          <button
            onClick={prevSlide}
            disabled={isStartDisabled}
            aria-label="Previous products"
            className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition ${
              isStartDisabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next */}
          <button
            onClick={nextSlide}
            disabled={isEndDisabled}
            aria-label="Next products"
            className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition ${
              isEndDisabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;