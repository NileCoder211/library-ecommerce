import { XCircle, ArrowRight, RefreshCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MpesaCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center">
            <XCircle className="text-red-400 w-16 h-16 mb-4" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-400 mb-2">
            Payment Cancelled
          </h1>

          <p className="text-gray-300 text-center mb-2">
            Your M-Pesa payment was not completed.
          </p>
          <p className="text-gray-400 text-center text-sm mb-6">
            No money has been deducted from your account. You can try again or
            continue shopping.
          </p>

          <div className="bg-gray-700 rounded-lg p-4 mb-6 text-sm text-gray-400 space-y-1">
            <p>Common reasons for cancellation:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-500">
              <li>PIN entered incorrectly</li>
              <li>STK prompt timed out (enter PIN within 30s)</li>
              <li>Insufficient M-Pesa balance</li>
              <li>Request dismissed on phone</li>
            </ul>
          </div>

          <div className="space-y-4">
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              <RefreshCcw className="mr-2" size={18} />
              Try Again
            </motion.button>

            <Link
              to="/"
              className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MpesaCancelPage;