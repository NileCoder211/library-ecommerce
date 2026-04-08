import { useEffect, useState } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import Authors from "../components/Authors";
import Footer from "../components/Footer";

const categories = [
  { href: "/stream1", name: "Purpose", imageUrl: "/stream1.png" },
  { href: "/stream2", name: "Leadership", imageUrl: "/image1.png" },
  { href: "/stream3", name: "Faith", imageUrl: "/image2.jpg" },
  { href: "/stream4", name: "Identity", imageUrl: "/image2.jpg" },
  { href: "/stream5", name: "Prophetic", imageUrl: "/image2.jpg" },
  { href: "/stream6", name: "Affirmations", imageUrl: "/image2.jpg" },
];

export default function Hero() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 400);
  }, []);

  const { fetchFeaturedProducts, products, isLoading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);


  return (
    <div>
      <section className=" relative min-h-[90vh] flex items-center overflow-hidden bg-[url(/image1.png)] bg-cover bg-center ">
        {/* 🔥 Overlay goes HERE */}
        <div className="absolute inset-0 bg-black/65"></div>
        <div className="container mx-auto grid md:grid-cols-2 items-center gap-10 px-6">
          {/* LEFT CONTENT */}
          <div
            className={`space-y-6 transition-all duration-700 ${show ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Discover Your Next <br />
              Favorite Books
            </h1>

            {/* Description */}
            <p className="text-xl max-w-md">
              Find the best books from your favorite{" "}
              <span className="font-bold text-3xl text-white">
                Author Boniface Mwangi
              </span>
              . Explore new collections and enjoy reading like never before.
            </p>

            {/* Buttons */}
            <div className="flex gap-4">
              <button className="bg-yellow-500 px-6 py-3 cursor-pointer border rounded-lg text-white font-semibold transition hover:bg-white hover:text-yellow-500 hover:scale-105">
                Shop Now
              </button>

              <button className="border px-6 py-3 rounded-lg cursor-pointer font-semibold transition hover:bg-black hover:text-white">
                View Collection
              </button>
              {/* Floating small element */}
            </div>
            <div className="absolute top-50 right-0 w-40 h-40 bg-[url(/image5.jpg)] bg-cover bg-center rounded-full animate-bounce opacity-100"></div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative flex justify-center items-center">
            {/* Background Circle */}
            <div
              className={`absolute w-[500px] h-[500px] bg-[url(/image2.jpg)] bg-cover bg-center bg-transparent rounded-full transition-all duration-700 ${show ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
            ></div>

            {/* Discount Badge */}
            <div
              className={`absolute bottom-30 right-10 w-30 h-30 bg-[url(/image3.jpg)] bg-cover bg-center animate-bounce text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-700 ${show ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
            ></div>
          </div>
        </div>
      </section>

      <div className="relative min-h-screen text-white overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
            Explore Our Categories
          </h1>
          <p className="text-center text-xl text-gray-300 mb-12">
            Discover the latest trends in eco-friendly fashion
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <CategoryItem category={category} key={category.name} />
            ))}
          </div>

          {!isLoading && products.length > 0 && (
            <FeaturedProducts featuredProducts={products} />
          )}
        </div>
      </div>
      <Authors />
      <Footer />
    </div>
  );
}