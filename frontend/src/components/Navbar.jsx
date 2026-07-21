import { useState } from "react";
import {  ShoppingCart,  UserPlus,  LogIn,  Lock, Menu, X, ChevronDown,} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCart } from "../queries/useCart";

const CATEGORIES = [  "sofa",  "beds", "dining",  "wardrobes",  "doors", "stools",];

const Navbar = () => {
  const { user, logout } = useUserStore();

  // Navbar.jsx — gate the query on auth

const { data: cart = [] } = useCart(!!user); // ← only fetch when logged in

  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate(isAdmin ? "/secret-dashboard" : "/user-profile");
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-16 z-50 bg-[#faf9f7]/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-full flex justify-between items-center md:grid md:grid-cols-3 md:items-center">
          {/* Logo — Left section */}
          <Link to="/" className="flex items-center flex-shrink-0 md:justify-self-start">
            <img
              src="/image.png"
              alt="E-Commerce Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav — Center section: Home, Offers, Collections */}
          <nav className="hidden md:flex items-center gap-3 md:justify-self-center">
            <Link
              to="/"
              className="text-sm text-black font-semibold hover:text-gray-500 transition"
            >
              Home
            </Link>

            <Link
              to="/offers"
              className="text-sm text-black font-semibold hover:text-gray-500 transition"
            >
              Offers
            </Link>

            {/* Collections dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-1 text-sm text-black font-semibold hover:text-gray-500 transition"
              >
                Collections

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    categoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoryOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setCategoryOpen(false)}
                  />

                  <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-gray-100 shadow-lg rounded-lg overflow-hidden z-20">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        to={`/category/${cat}`}
                        onClick={() => setCategoryOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition capitalize"
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right section: cart, admin, auth */}
          <div className="hidden md:flex items-center gap-3 md:justify-self-end">
            {/* Cart */}
            {user && (
              <Link
                to="/cart"
                className="relative flex items-center text-black hover:text-black/50 transition"
              >
                <ShoppingCart size={22} />

                {cart?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px]">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {/* Admin dashboard shortcut */}
            {isAdmin && (
              <Link
                to="/secret-dashboard"
                className="bg-black hover:bg-gray-700 text-white px-2 py-1 rounded text-sm flex items-center transition"
              >
                <Lock size={16} className="mr-1" />

                <span className="hidden sm:inline">
                  Dashboard
                </span>
              </Link>
            )}

            {/* Logged In */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleProfileClick}
                  title={
                    isAdmin
                      ? "Admin Dashboard"
                      : "My Profile"
                  }
                  className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold hover:bg-gray-700 transition"
                >
                  {user.name?.[0]?.toUpperCase() || "U"}
                </button>

                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-red-500 transition"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-black hover:bg-gray-700 text-white px-2 py-1 rounded text-sm flex items-center transition"
                >
                  <UserPlus size={16} className="mr-1" />
                  Sign Up
                </Link>

                <Link
                  to="/login"
                  className="bg-black hover:bg-gray-700 text-white px-2 py-1 rounded text-sm flex items-center transition"
                >
                  <LogIn size={16} className="mr-1" />
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <Link to="/cart" className="relative text-black">
                <ShoppingCart size={22} />

                {cart?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px]">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <button
                onClick={handleProfileClick}
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold"
              >
                {user.name?.[0]?.toUpperCase() || "U"}
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-black"
            >
              {mobileOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute top-16 left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
            <nav className="flex flex-col py-2">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="px-6 py-3 text-sm font-semibold text-black hover:bg-gray-50"
              >
                Home
              </Link>

              <div className="px-6 py-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                  Collections
                </p>

                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      to={`/category/${cat}`}
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded capitalize"
                    >
                      {cat.charAt(0).toUpperCase() +
                        cat.slice(1)}
                    </Link>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <Link
                  to="/secret-dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-black hover:bg-gray-50 flex items-center gap-2"
                >
                  <Lock size={14} />
                  Dashboard
                </Link>
              )}

              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="mx-6 my-2 py-2 text-sm text-red-500 border border-red-200 rounded hover:bg-red-50 transition"
                >
                  Log Out
                </button>
              ) : (
                <div className="flex gap-2 px-6 py-3">
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 bg-black text-white text-sm py-2 text-center rounded"
                  >
                    Sign Up
                  </Link>

                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 border border-black text-black text-sm py-2 text-center rounded"
                  >
                    Login
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;