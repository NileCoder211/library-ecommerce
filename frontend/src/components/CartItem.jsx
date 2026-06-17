import { Minus, Plus, Trash } from "lucide-react";
import { useCart, useRemoveFromCart, useUpdateQuantity } from "../queries/useCart";

const CartItem = ({ item }) => {
  const { data: cart = [] } = useCart();
  const removeFromCartMutation = useRemoveFromCart();
  const updateQuantityMutation = useUpdateQuantity();

  // Always read quantity from live cache, not stale prop
  const liveItem = cart.find((c) => c._id === item._id);
  const quantity = liveItem?.quantity ?? item.quantity;

  const handleDecrease = () => {
    updateQuantityMutation.mutate({
      productId: item._id,
      quantity: quantity - 1,
    });
  };

  const handleIncrease = () => {
    updateQuantityMutation.mutate({
      productId: item._id,
      quantity: quantity + 1,
    });
  };

  const handleRemove = () => {
    removeFromCartMutation.mutate(item._id);
  };

  return (
    <div className="min-h-[30vh] bg-[#fcfcfc] border border-gray-200 rounded-2xl p-4 shadow-sm md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        {/* IMAGE */}
        <div className="shrink-0 md:order-1">
          <img
            className="h-20 md:h-32 rounded object-cover"
            src={item.images?.[0]?.url}
            alt={item.name}
          />
        </div>

        <label className="sr-only">Choose quantity:</label>

        {/* QUANTITY */}
        <div className="flex items-center justify-between md:order-3 md:justify-end">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-600 bg-black hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={handleDecrease}
              disabled={updateQuantityMutation.isPending}
            >
              <Minus className="text-gray-300" />
            </button>

            <p>{quantity}</p>  {/* ← live quantity from cache */}

            <button
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-600 bg-black text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={handleIncrease}
              disabled={updateQuantityMutation.isPending}
            >
              <Plus className="text-gray-300" />
            </button>
          </div>

          {/* PRICE */}
          <div className="text-end md:order-4 md:w-32">
            <p className="mt-1 text-xl font-bold text-black">
              KES{" "}
              {Number(item.price).toLocaleString("en-KE", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        {/* INFO */}
        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
          <p className="text-base font-medium text-black hover:text-gray-400 hover:underline">
            {item.name}
          </p>
          <p className="text-lg font-semibold text-gray-600">
            {item.description}
          </p>
          <p className="text-lg font-semibold text-gray-600">
            Quantity: {item.quantity}
          </p>

          {/* REMOVE */}
          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center text-sm font-medium text-red-500 hover:text-red-300 hover:underline"
              onClick={handleRemove}
              disabled={removeFromCartMutation.isPending}
            >
              <Trash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;