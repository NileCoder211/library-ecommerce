import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LogInPage from "./pages/LogInPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import MpesaPendingPage from "./pages/MpesaPendingPage";
import MpesaSuccessPage from "./pages/MpesaSuccessPage";
import MpesaCancelPage from "./pages/MpesaCancelPage";
import MakeOrderPage from "./pages/MakeOrderPage";
import UserProfile from "./pages/UserPage";

import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]); 

  useEffect(() => {
    if (!user) return;
    getCartItems();
  }, [getCartItems, user]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
        	<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#faf9f7]' />
        </div>
      </div>

      <div className="relative z-50 pt-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!user ? <LogInPage /> : <Navigate to="/" />}
          />
         
          <Route path="/user-profile" element={<UserProfile />} />

          <Route
            path="/secret-dashboard"
            element={user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />}
          />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route
            path="/cart"
            element={user ? <CartPage /> : <Navigate to="/login" />}
          />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/make-order/:id" element={<MakeOrderPage />} />

          {/* Stripe */}
          <Route
            path="/purchase-success"
            element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/purchase-cancel"
            element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
          />

          {/* M-Pesa */}
          <Route path="/mpesa-pending" element={<MpesaPendingPage />} />
          <Route path="/mpesa-success" element={<MpesaSuccessPage />} />
          <Route path="/mpesa-cancel"  element={<MpesaCancelPage />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;