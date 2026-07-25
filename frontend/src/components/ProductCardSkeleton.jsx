// components/ProductCardSkeleton.jsx

// Mirrors ProductCard's structure exactly (same image height, same info
// block spacing) so any grid using this never jumps when real cards mount.
const ProductCardSkeleton = () => {
  return (
    <div className="w-full">
      {/* image placeholder */}
      <div className="relative overflow-hidden rounded-xl h-92 bg-gray-200 animate-pulse" />

      {/* info placeholder */}
      <div className="mt-4">
        <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
        <div className="mt-2 h-6 w-1/2 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;