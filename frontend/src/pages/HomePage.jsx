import CategoryItem from "../components/CategoryItem";
import FeaturedProducts from "../components/FeaturedProducts";
import Footer from "../components/Footer";
import FAQ from "../components/Faq";
import ContactForm from "../components/ContactForm";
import HeroSection from "../components/HeroSection";
import categories from "../components/Categories";
import Map from "../components/Location";
import { useFeaturedProducts } from "../queries/useProduct";

export default function Hero() {
  const { data: products = [], isLoading } = useFeaturedProducts();

  return (
    <div>
      <HeroSection />

      <div className="relative min-h-screen text-white overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-center text-5xl sm:text-6xl font-bold text-black mb-4">
            Explore Our Categories
          </h1>

          <p className="text-center text-xl text-gray-500 mb-12">
            Discover our premium furniture collections
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <CategoryItem key={index} category={category} />
            ))}
          </div>

          {!isLoading && products.length > 0 && (
            <FeaturedProducts featuredProducts={products} />
          )}
        </div>
      </div>

      <FAQ />
      <Map />
      <Footer />
    </div>
  );
}