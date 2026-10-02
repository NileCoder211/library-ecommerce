import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import categories from "../components/Categories";

const PRODUCTS_API = "/api/products";
const PAGE_SIZE = 12;

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasSearch = Boolean(q.trim() || category);
  const categoryLabel =
    categories.find((c) => c.name === category)?.label || category;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResults() {
      // Nothing to search for yet — skip the request.
      if (!hasSearch) {
        setProducts([]);
        setTotalPages(1);
        setTotalResults(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", category);

        const res = await fetch(`${PRODUCTS_API}/search?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalResults(data.pagination?.total || 0);
        setIsLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
          setIsLoading(false);
        }
      }
    }

    fetchResults();
    return () => controller.abort();
  }, [q, category, page, hasSearch]);

  // Keeps whatever else is in the URL (q / category) and changes one part
  const updateParams = (changes) => {
    const next = { ...(q && { q }), ...(category && { category }), ...changes };
    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setSearchParams(next);
  };

  const goToPage = (nextPage) => {
    updateParams({ page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectCategory = (name) => updateParams({ category: name, page: "" });

  return (
    <>
      <Navbar />
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-14 md:py-20">
        <h1
          className="text-3xl text-center text-[#1E1E1E] mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {q.trim() ? `Results for "${q}"` : category ? categoryLabel : "Search"}
        </h1>

        {hasSearch && !isLoading && !error && (
          <p className="text-center text-[12px] text-[#8a8375] mb-6">
            {totalResults} {totalResults === 1 ? "result" : "results"}
          </p>
        )}

        {/* CATEGORY FILTER */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => selectCategory("")}
            className={`text-[11px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border transition-colors ${
              !category
                ? "bg-[#1E1E1E] text-white border-[#1E1E1E]"
                : "border-[#E7DED1] text-[#1E1E1E]/70 hover:border-[#C9A55C]"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => selectCategory(c.name)}
              className={`text-[11px] tracking-[0.1em] uppercase px-4 py-2 rounded-full border transition-colors ${
                category === c.name
                  ? "bg-[#1E1E1E] text-white border-[#1E1E1E]"
                  : "border-[#E7DED1] text-[#1E1E1E]/70 hover:border-[#C9A55C]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {error && <p className="text-center text-sm text-red-700 mb-6">{error}</p>}

        {!hasSearch ? (
          <p className="text-center text-[#8a8375] py-10">
            Type something into the search bar above, or pick a category.
          </p>
        ) : isLoading ? (
          <p className="text-center text-[#8a8375] py-10">Searching...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-[#8a8375] py-10">
            No products found{q.trim() ? ` for "${q}"` : ""}
            {category ? ` in ${categoryLabel}` : ""}.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start justify-items-center">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="text-[11px] tracking-[0.1em] uppercase px-3 py-2 border border-[#E7DED1] rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#C9A55C]"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-8 h-8 text-[12px] rounded-full transition-colors ${
                      p === page
                        ? "bg-[#1E1E1E] text-white"
                        : "text-[#1E1E1E]/70 hover:bg-[#E7DED1]/50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="text-[11px] tracking-[0.1em] uppercase px-3 py-2 border border-[#E7DED1] rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#C9A55C]"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </>
  );
}

export default SearchResultsPage;