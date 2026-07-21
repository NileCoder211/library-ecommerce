import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { useProductsByCategory } from "../queries/useProduct";

const PRODUCTS_PER_PAGE = 12;

const CategoryPage = () => {
  const { category } = useParams();

  const { data: products = [], isLoading } = useProductsByCategory(category);

  const [currentPage, setCurrentPage] = useState(1);

  // Tracks which category the current page count is valid for. When the
  // category changes, we reset to page 1 during render instead of in an
  // effect — this avoids the extra "render with stale page, then re-render"
  // pass that setState-in-useEffect causes.
  const [pageResetKey, setPageResetKey] = useState(category);

  if (category !== pageResetKey) {
    setPageResetKey(category);
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  // Guard against being stranded on a page that no longer exists (e.g. data
  // refetches with fewer items than before).
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));

  const paginatedProducts = products.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === safePage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Builds a compact page list like [1, 2, 3, '...', 9, 10] for larger page counts
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    let start = Math.max(2, safePage - 1);
    let end = Math.min(totalPages - 1, safePage + 1);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.h1
          className="text-center text-4xl sm:text-5xl font-bold text-black mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {isLoading && (
            <p className="text-gray-500 text-center col-span-full">
              Loading...
            </p>
          )}

          {!isLoading && products.length === 0 && (
            <h2 className="text-3xl font-semibold text-gray-500 text-center col-span-full">
              No products found
            </h2>
          )}

          {paginatedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </motion.div>

        {!isLoading && totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10 flex-wrap"
          >
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Prev
            </button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-sm text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  aria-current={page === safePage ? "page" : undefined}
                  className={`min-w-9 h-9 px-2 text-sm rounded-md transition ${
                    page === safePage
                      ? "bg-black text-white font-semibold"
                      : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;