import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateMpesaOrder } from "../queries/useOrder";
import { useCart } from "../queries/useCart";

// ─── M-Pesa Phone Modal ───────────────────────────────────────────────────────
const MpesaPhoneModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    const clean = phone.replace(/[\s-]/g, "");
    // 07XXXXXXXX, 01XXXXXXXX, 7XXXXXXXX, 254XXXXXXXXX, +254XXXXXXXXX
    if (!/^(?:\+?254|0)?[71]\d{8}$/.test(clean)) {
      setError("Enter a valid Safaricom number e.g. 0712 345 678");
      return null;
    }
    setError("");
    return clean;
  };

  const handleSubmit = () => {
    if (isLoading) return;
    const valid = validate();
    if (valid) onConfirm(valid);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Pay with M-Pesa
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-400">
                    We'll send an STK push to your phone
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/40">
                    <span className="text-sm text-gray-400">🇰🇪 +254</span>
                    <input
                      type="tel"
                      placeholder="0712 345 678"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                  {error && (
                    <p className="mt-1.5 text-xs text-red-400">{error}</p>
                  )}
                </div>

                <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  📱 Check your phone and enter your M-Pesa PIN to complete payment
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-700 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800"
                >
                  Back
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </span>
                  ) : (
                    "Send STK Push"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Order Summary ────────────────────────────────────────────────────────────
const OrderSummary = ({ shippingAddress, isShippingValid, coupon, isCouponApplied }) => {
  const { data: cart = [] } = useCart();
  const navigate = useNavigate();
  const createMpesaMutation = useCreateMpesaOrder();

  const [showMpesaModal, setShowMpesaModal] = useState(false);

  // Only a coupon the customer has actually applied may be charged / consumed
  const activeCoupon = coupon && isCouponApplied ? coupon : null;

  // ── Totals (display only – the server recalculates from the database) ──────
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = activeCoupon
    ? (subtotal * activeCoupon.discountPercentage) / 100
    : 0;
  const total = Math.round(subtotal - discount);
  const savings = subtotal - total;

  const fmt = (n) => Number(n).toLocaleString("en-KE", { maximumFractionDigits: 0 });

  const canCheckout = isShippingValid && cart.length > 0;

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!isShippingValid) {
      toast.error("Please fill in your shipping address");
      return;
    }
    setShowMpesaModal(true);
  };

  const handleMpesaPayment = (phone) => {
    createMpesaMutation.mutate(
      {
        phone,
        // send only what the server needs – it looks up prices itself
        products: cart.map(({ _id, quantity }) => ({ _id, quantity })),
        couponCode: activeCoupon?.code ?? null,
        shippingAddress,
      },
      {
        onSuccess: (data) => {
          setShowMpesaModal(false);
          navigate("/mpesa-pending", {
            state: {
              phone,
              totalAmount: data.totalAmount,
              checkoutRequestId: data.CheckoutRequestID,
            },
          });
        },
      }
    );
  };

  return (
    <>
      <motion.div
        className="space-y-5 bg-[#fcfcfc] border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-lg p-6 md:p-8 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl font-semibold text-black">Order summary</p>

        <div className="space-y-6">
          <div className="space-y-2">
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-400">Original price</dt>
              <dd className="text-base font-medium text-black">KES {fmt(subtotal)}</dd>
            </dl>

            {savings > 0 && (
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal text-gray-300">Savings</dt>
                <dd className="text-base font-medium text-black">-KES {fmt(savings)}</dd>
              </dl>
            )}

            {activeCoupon && (
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal text-gray-300">
                  Coupon ({activeCoupon.code})
                </dt>
                <dd className="text-base font-medium text-black">
                  -{activeCoupon.discountPercentage}%
                </dd>
              </dl>
            )}

            <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
              <dt className="text-base font-bold text-black">Total</dt>
              <dd className="text-base font-bold text-black">KES {fmt(total)}</dd>
            </dl>
          </div>

          <motion.button
            disabled={!canCheckout}
            className={`flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4
              ${
                canCheckout
                  ? "bg-black hover:bg-gray-700 focus:ring-gray-700"
                  : "cursor-not-allowed bg-gray-400"
              }`}
            whileHover={canCheckout ? { scale: 1.05 } : {}}
            whileTap={canCheckout ? { scale: 0.95 } : {}}
            onClick={handleCheckoutClick}
          >
            Pay with M-Pesa
          </motion.button>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-normal text-gray-400">or</span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-black underline hover:text-gray-500 hover:no-underline"
            >
              Continue Shopping
              <MoveRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>

      <MpesaPhoneModal
        isOpen={showMpesaModal}
        onClose={() => setShowMpesaModal(false)}
        onConfirm={handleMpesaPayment}
        isLoading={createMpesaMutation.isPending}
      />
    </>
  );
};

export default OrderSummary;