import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Smartphone, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import axios from "../lib/axios";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15;

const MpesaPendingPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { phone, totalAmount, checkoutRequestId } = state || {};

  const [status, setStatus] = useState("waiting"); // waiting | success | failed
  const [failKind, setFailKind] = useState("failed"); // failed (definitive) | timeout
  const [pollCount, setPollCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const intervalRef = useRef(null);
  const pollCountRef = useRef(0);
  const inFlightRef = useRef(false);

  const stopPolling = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  const startPolling = useCallback(() => {
    pollCountRef.current = 0;
    setPollCount(0);

    intervalRef.current = setInterval(async () => {
      // don't stack requests if the previous one is still running
      if (inFlightRef.current) return;

      pollCountRef.current += 1;
      setPollCount(pollCountRef.current);

      if (pollCountRef.current > MAX_POLLS) {
        clearInterval(intervalRef.current);
        setStatus("failed");
        setFailKind("timeout");
        setErrorMsg(
          "We haven't received confirmation from Safaricom yet. If money was deducted, your order will appear under My Orders shortly — otherwise please contact support."
        );
        return;
      }

      inFlightRef.current = true;
      try {
        const res = await axios.post("/mpesa/confirm", { checkoutRequestId });

        if (res.data.success) {
          clearInterval(intervalRef.current);
          setStatus("success");
          // cart is also cleared server-side; refresh what the UI shows
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          setTimeout(
            () => navigate(`/purchase-success?orderId=${res.data.orderId}`),
            1500
          );
          return;
        }
        // res.data.pending === true → keep polling silently
      } catch (err) {
        const httpStatus = err.response?.status;

        // 400 = payment failed/cancelled, 404 = session not found → stop
        if (httpStatus === 400 || httpStatus === 404) {
          clearInterval(intervalRef.current);
          setStatus("failed");
          setFailKind("failed");
          setErrorMsg(
            err.response?.data?.error || "Payment was cancelled or failed."
          );
          return;
        }

        // 5xx / network error → keep polling
        console.warn("Poll error (will retry):", err.message);
      } finally {
        inFlightRef.current = false;
      }
    }, POLL_INTERVAL_MS);
  }, [checkoutRequestId, navigate, queryClient]);

  useEffect(() => {
    if (!checkoutRequestId) {
      setStatus("failed");
      setFailKind("failed");
      setErrorMsg("Payment session not found. Please go back and try again.");
      return;
    }

    startPolling();
    return () => stopPolling();
  }, [checkoutRequestId, startPolling, stopPolling]);

  const handleRetry = () => {
    setStatus("waiting");
    setErrorMsg("");
    stopPolling();
    startPolling();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <motion.div
        className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center shadow-2xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* ── Waiting ── */}
        {status === "waiting" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <Smartphone className="h-8 w-8 text-emerald-400" />
            </div>

            <h1 className="mb-2 text-xl font-bold text-white">Check Your Phone</h1>
            <p className="mb-1 text-gray-400">An M-Pesa prompt has been sent to</p>
            <p className="mb-4 text-lg font-semibold text-emerald-400">{phone}</p>
            <p className="mb-6 text-sm text-gray-400">
              Enter your M-Pesa PIN to complete your payment of{" "}
              <span className="font-semibold text-white">
                KES {Number(totalAmount).toLocaleString("en-KE")}
              </span>
              . This page confirms automatically once Safaricom processes it.
            </p>

            <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Waiting for confirmation…</span>
            </div>

            <div className="mb-6 flex justify-center gap-1.5">
              {Array.from({ length: MAX_POLLS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                    i < pollCount ? "bg-emerald-400" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                stopPolling();
                navigate("/mpesa-cancel");
              }}
              className="w-full rounded-xl border border-gray-700 py-3 text-sm text-gray-400 transition hover:bg-gray-700"
            >
              Cancel & Go Back
            </button>
          </>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">Payment Confirmed!</h1>
            <p className="text-gray-400">Your order has been placed. Redirecting…</p>
            <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-emerald-400" />
          </>
        )}

        {/* ── Failed ── */}
        {status === "failed" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">
              {failKind === "timeout" ? "Still Waiting" : "Payment Not Completed"}
            </h1>
            <p className="mb-6 text-sm text-gray-400">{errorMsg}</p>

            {/* Re-checking only helps when we simply timed out; a definitive
                failure needs a fresh STK push from the cart. */}
            {failKind === "timeout" && (
              <motion.button
                onClick={handleRetry}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Check Again
              </motion.button>
            )}
            <button
              onClick={() => navigate("/mpesa-cancel")}
              className="mt-3 w-full rounded-xl border border-gray-700 py-3 text-sm text-gray-400 transition hover:bg-gray-700"
            >
              Go Back to Cart
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MpesaPendingPage;