import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {useClearCart} from "../queries/useCart";
import axios from "../lib/axios";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
  const [order, setOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  const clearCartMutation = useClearCart(); // ← replaces useCartStore
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("orderId");

    const loadOrder = async () => {
      try {
        let finalOrder;

        if (sessionId) {
          const res = await axios.post("/orders/checkout-success", { sessionId });
          finalOrder = res.data.order;
        } else if (orderId) {
          const res = await axios.get(`/orders/${orderId}`);
          finalOrder = res.data.order;
        } else {
          throw new Error("No payment reference found");
        }

        setOrder(finalOrder);
        clearCartMutation.mutate(); // ← replaces clearCart()
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    };

    loadOrder();
  }, [searchParams]); // ← clearCart removed from dependencies

  if (isProcessing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">
          Confirming your order...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        numberOfPieces={600}
        recycle={false}
      />

      <div className="bg-white border border-gray-300 rounded-2xl p-8 shadow-lg w-full max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="text-emerald-500 w-14 h-14 mb-4" />
        </div>

        <h1 className="text-2xl font-bold text-emerald-400 text-center mb-2">
          Purchase Successful!
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Thank you for your order
        </p>

        <div className="bg-gray-100 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-gray-500">
            <span>Order number</span>
            <span className="font-semibold text-gray-700">
              {order?.orderNumber || "—"}
            </span>
          </div>

          <div className="flex justify-between text-gray-500">
            <span>Total</span>
            <span className="font-semibold text-gray-700">
              KES {order?.totalAmount?.toLocaleString("en-KE")}
            </span>
          </div>

          <div className="flex justify-between text-gray-500">
            <span>Delivery</span>
            <span className="font-semibold text-gray-700">3–5 days</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            to="/user-profile"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center"
          >
            <HandHeart className='mr-2' size={22} />
            View My Orders
          </Link>

          <Link
            to="/"
            className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center"
          >
            Continue Shopping
            <ArrowRight className='ml-2' size={22} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;