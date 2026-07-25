// components/CartItemSkeleton.jsx

// Mirrors CartItem's exact structure and classes (same wrapper, same
// md:order-* placement for image/info/qty/price) so the loading state
// lines up with the real row precisely, including at the md breakpoint
// where the layout reflows.
const CartItemSkeleton = () => {
  return (
    <div className="min-h-[30vh] bg-[#fcfcfc] border border-gray-200 rounded-2xl p-4 shadow-sm md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        {/* IMAGE */}
        <div className="shrink-0 md:order-1">
          <div className="h-20 w-20 md:h-32 md:w-32 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* QUANTITY + PRICE */}
        <div className="flex items-center justify-between md:order-3 md:justify-end">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 shrink-0 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-5 shrink-0 rounded-md bg-gray-200 animate-pulse" />
          </div>

          <div className="text-end md:order-4 md:w-32">
            <div className="mt-1 h-6 w-20 rounded bg-gray-200 animate-pulse ml-auto" />
          </div>
        </div>

        {/* INFO */}
        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
          <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse" />

          {/* REMOVE */}
          <div className="flex items-center gap-4">
            <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemSkeleton;