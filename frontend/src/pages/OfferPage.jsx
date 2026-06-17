export default function OffersPage({ products = [] }) {
  const offerProducts = products.filter(
    (product) => product.discountPercentage > 0
  );

  return (
    <section className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/30">
            Limited Time Deals
          </span>

          <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight">
            Hot Offers & Discounts
          </h1>

          <p className="mt-5 text-slate-400 max-w-2xl mx-auto text-lg">
            Discover amazing discounts on your favorite products before the offers expire.
          </p>
        </div>

        {/* Hero Offer Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-10 mb-16">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_40%)]"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-5">
                Flash Sale
              </span>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Save Up To 50% On Selected Products
              </h2>

              <p className="mt-5 text-lg text-white/90">
                Shop today’s best deals and enjoy exclusive discounts on premium products.
              </p>

              <button className="mt-8 bg-slate-950 hover:bg-black transition px-8 py-4 rounded-2xl font-semibold text-white shadow-2xl">
                Explore Offers
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>

              <img
                src="/image1.png"
                alt="Offers"
                className="relative w-[350px] lg:w-[450px] drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-3xl font-bold text-emerald-400">
              {offerProducts.length}
            </h3>
            <p className="text-slate-400 mt-2">Products On Offer</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-3xl font-bold text-red-400">50%</h3>
            <p className="text-slate-400 mt-2">Maximum Discount</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-3xl font-bold text-cyan-400">24/7</h3>
            <p className="text-slate-400 mt-2">Daily Updated Deals</p>
          </div>
        </div>

        {/* Offers Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              Discounted Products
            </h2>

            <span className="text-slate-400">
              {offerProducts.length} products found
            </span>
          </div>

          {offerProducts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">
              <h3 className="text-3xl font-bold">
                No Active Offers
              </h3>

              <p className="text-slate-400 mt-4 text-lg">
                New discounts and offers will appear here soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {offerProducts.map((product) => (
                <div
                  key={product._id}
                  className="relative"
                >
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4 z-20 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    {product.discountPercentage}% OFF
                  </div>

                  {/* Existing Product Card */}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/*
====================================
HOW TO USE
====================================

1. Import your existing ProductCard:

import ProductCard from "../components/ProductCard";

2. Pass products as props:

<OffersPage products={products} />

3. Product structure should contain:

{
  _id,
  name,
  price,
  image,
  discountPercentage
}

4. Add a transparent image:

/public/offer-hero.png

5. Example route:

<Route path="/offers" element={<OffersPage products={products} />} />
*/
