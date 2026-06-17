import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, X, CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import { useCreateStripeOrder, useCreateMpesaOrder } from "../queries/useOrder";
import toast from "react-hot-toast";
import { useCart } from "../queries/useCart";

const PAYMENT_METHODS = [
  {
    id: "stripe",
    label: "Card / Online",
    description: "Pay securely with Visa, Mastercard, or any debit card",
    icon: CreditCard,
    badge: "Stripe",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
  },
  {
    id: "mpesa",
    label: "M-Pesa",
    description: "Pay via M-Pesa STK push sent to your phone",
    icon: Smartphone,
    badge: "Safaricom",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  },
];



// ─── Payment Method Modal ─────────────────────────────────────────────────────
const PaymentMethodModal = ({ isOpen, onClose, onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleConfirm = () => {
    if (selected) onSelect(selected);
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
            <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Choose Payment Method
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-400">
                    Select how you'd like to complete your purchase
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
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selected === method.id;
                  return (
                    <motion.button
                      key={method.id}
                      onClick={() => setSelected(method.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`relative w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50"
                          : "border-gray-700 bg-gray-800 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 rounded-lg p-2 ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {method.label}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${method.badgeColor}`}
                            >
                              {method.badge}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-400">
                            {method.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0 text-emerald-400"
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-700 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleConfirm}
                  disabled={!selected}
                  whileHover={selected ? { scale: 1.02 } : {}}
                  whileTap={selected ? { scale: 0.98 } : {}}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all ${
                    selected
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "cursor-not-allowed bg-gray-700 text-gray-500"
                  }`}
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── M-Pesa Phone Modal ───────────────────────────────────────────────────────
const MpesaPhoneModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    const clean = phone.replace(/\s+/g, "");
    if (!/^(07|01)\d{8}$/.test(clean)) {
      setError("Enter a valid Safaricom number e.g. 0712 345 678");
      return null;
    }
    setError("");
    return clean;
  };

  const handleSubmit = () => {
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
                    Enter M-Pesa Number
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


const OrderSummary = ({ shippingAddress, isShippingValid, coupon, isCouponApplied }) => {
  const { data: cart = [] } = useCart();
  const navigate = useNavigate();

  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);

  // ── Compute totals from cart ──────────────────────────────────────────────
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // apply coupon discount if needed
  const discount = coupon && isCouponApplied
    ? (subtotal * coupon.discountPercentage) / 100
    : 0;

  const total = subtotal - discount;
  const savings = subtotal - total;

  const formattedSubtotal = Number(subtotal).toLocaleString("en-KE", { maximumFractionDigits: 0 });
  const formattedTotal = Number(total).toLocaleString("en-KE", { maximumFractionDigits: 0 });
  const formattedSavings = Number(savings).toLocaleString("en-KE", { maximumFractionDigits: 0 });

  
  const handleMethodSelect = (method) => {
    setShowMethodModal(false);
    if (method === "stripe") {
      handleStripePayment();
    } else {
      setShowMpesaModal(true);
    }
  };

  // ── Stripe ───────────────────────────────────────────────────────────────────

const createStripeMutation = useCreateStripeOrder();
const createMpesaMutation = useCreateMpesaOrder();

// then replace handleStripePayment
const handleStripePayment = () => {
  createStripeMutation.mutate(
    { products: cart, couponCode: coupon?.code ?? null, shippingAddress },
    { onSuccess: (data) => { window.location.href = data.url; } }
  );
};

// and handleMpesaPayment
const handleMpesaPayment = (phone) => {
  createMpesaMutation.mutate(
    { phone, products: cart, couponCode: coupon?.code ?? null, shippingAddress },
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
        className=" space-y-5
    bg-[#fcfcfc]
    border border-gray-200
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    rounded-lg
    p-6 md:p-8    sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl font-semibold text-black">Order summary</p>

        <div className="space-y-6">
         
          <div className="space-y-2">
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-400">Original price</dt>
              <dd className="text-base font-medium text-black">KES {formattedSubtotal}</dd>
            </dl>

            {savings > 0 && (
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal text-gray-300">Savings</dt>
                <dd className="text-base font-medium text-black">
                  -KES {formattedSavings}
                </dd>
              </dl>
            )}

            {coupon && isCouponApplied && (
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal text-gray-300">
                  Coupon ({coupon.code})
                </dt>
                <dd className="text-base font-medium text-black">
                  -{coupon.discountPercentage}%
                </dd>
              </dl>
            )}

            <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
              <dt className="text-base font-bold text-black">Total</dt>
              <dd className="text-base font-bold text-black">KES {formattedTotal}</dd>
            </dl>
          </div>

         <motion.button
  disabled={!isShippingValid}
  className={`flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4
  ${
    isShippingValid
      ? "bg-black hover:bg-gray-700 focus:ring-gray-700"
      : "cursor-not-allowed bg-gray-400"
  }`}
  whileHover={isShippingValid ? { scale: 1.05 } : {}}
  whileTap={isShippingValid ? { scale: 0.95 } : {}}
  onClick={() => {
    if (!isShippingValid) {
      toast.error("Please fill in your shipping address");
      return;
    }

    setShowMethodModal(true);
  }}
>
  Proceed to Checkout
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

      <PaymentMethodModal
        isOpen={showMethodModal}
        onClose={() => setShowMethodModal(false)}
        onSelect={handleMethodSelect}
      />

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