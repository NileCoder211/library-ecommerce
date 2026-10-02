import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
   import { useMergeGuestWishlist } from "./queries/useWishlist";


import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LogInPage from "./pages/LogInPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import MpesaPendingPage from "./pages/MpesaPendingPage";
import MpesaCancelPage from "./pages/MpesaCancelPage";
import MakeOrderPage from "./pages/MakeOrderPage";
import UserProfile from "./pages/UserPage";
import Offer from "./pages/OfferPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import WhatsAppChatbot from "./components/whatsapp/Whatsappchatbot";
import SearchResultsPage from "./pages/SearchResultsPage";
import WishlistPage from "./pages/WishlistPage"; // use your real filename

import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";

import { Toaster } from "react-hot-toast";

import { useUserStore } from "./stores/useUserStore";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  useMergeGuestWishlist();

  // Auth check only
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  // Pages that need a logged-in user
  const requireUser = (element) =>
    user ? element : <Navigate to="/login" />;
       

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#faf9f7]" />
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

          <Route path="/user-profile" element={requireUser(<UserProfile />)} />

          <Route path="/offers" element={<Offer />} />

          <Route
            path="/secret-dashboard"
            element={
              user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />
            }
          />

          <Route path="/category/:category" element={<CategoryPage />} />

          <Route path="/cart" element={requireUser(<CartPage />)} />

          <Route path="/product/:id" element={<ProductDetailsPage />} />

          <Route path="/make-order/:id" element={<MakeOrderPage />} />
              
<Route path="/search" element={<SearchResultsPage />} />
<Route path="/wishlist" element={<WishlistPage />} />



          {/* Order confirmation (reached from the M-Pesa pending page) */}
          <Route
            path="/purchase-success"
            element={requireUser(<PurchaseSuccessPage />)}
          />

          {/* M-Pesa */}
          <Route
            path="/mpesa-pending"
            element={requireUser(<MpesaPendingPage />)}
          />

          <Route
            path="/mpesa-cancel"
            element={requireUser(<MpesaCancelPage />)}
          />

          {/* Unknown URL → home instead of a blank page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <WhatsAppChatbot />
  
      <Toaster />
    </div>
  );
}

export default App;