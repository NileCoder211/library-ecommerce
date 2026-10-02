import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Confetti from "react-confetti";
import { useSingleOrder } from "../queries/useOrder";

const formatDelivery = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "3–7 days";

const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  // The cart and product stock caches are refreshed by MpesaPendingPage
  // (and the cart is also emptied server-side when the payment is confirmed).
  const { data: order, isLoading, isError, error } = useSingleOrder(orderId);

  if (!orderId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-400">Error: No order reference found</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Confirming your order...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center px-4 text-center">
        <p className="text-red-400">
          {error?.response?.data?.message || "We couldn't load your order."} You can
          still find it under My Orders.
        </p>
      </div>
    );
  }

  const receipt = order?.mpesaReceiptNumber || order?.transactionId;

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
          Payment Successful!
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Thank you for your order. We're processing it now.
        </p>

        <div className="bg-gray-100 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-gray-500">
            <span>Order number</span>
            <span className="font-semibold text-gray-700">
              {order?.orderNumber || "—"}
            </span>
          </div>

          <div className="flex justify-between text-gray-500">
            <span>Amount paid</span>
            <span className="font-semibold text-gray-700">
              KES {Number(order?.totalAmount || 0).toLocaleString("en-KE")}
            </span>
          </div>

          {receipt && (
            <div className="flex justify-between text-gray-500">
              <span>M-Pesa code</span>
              <span className="font-semibold text-gray-700">{receipt}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-500">
            <span>Estimated delivery</span>
            <span className="font-semibold text-gray-700">
              {formatDelivery(order?.estimatedDeliveryDate)}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            to="/user-profile#orders"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center"
          >
            <HandHeart className="mr-2" size={22} />
            View My Orders
          </Link>

          <Link
            to="/"
            className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4
            rounded-lg transition duration-300 flex items-center justify-center"
          >
            Continue Shopping
            <ArrowRight className="ml-2" size={22} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;