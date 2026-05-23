import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useWishlistStore } from "../stores/useWishlistStore";

import {
  Package,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
  Plus,
  Clock,
  Wrench,
  CheckCircle,
  User,
  Settings,
  X,
  Trash2
} from "lucide-react";

import { useUserStore } from "../stores/useUserStore";
import { useOrderStore } from "../stores/useOrderStore";

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },

  processing: {
    label: "Processing",
    icon: Wrench,
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
  },

  shipped: {
    label: "Shipped",
    icon: Package,
    dot: "bg-purple-500",
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
  },

  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border border-green-200",
  },

  cancelled: {
    label: "Cancelled",
    icon: X,
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border border-red-200",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "saved", label: "Saved Pieces", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const Sidebar = ({
  active,
  setActive,
  user,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) => (
  <>
    {mobileOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={() => setMobileOpen(false)}
      />
    )}

    <aside
      className={`fixed top-16 left-0 z-50 w-72 bg-white border-gray-100 flex flex-col transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-black  tracking-tight">
              Shamith Furniture
            </h1>

            <p className="text-[10px] text-gray-600 tracking-[0.2em] uppercase mt-1">
              Shamith Member
            </p>
          </div>

          <button
            className="lg:hidden text-gray-400"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* User */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-serif text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-black truncate">
              {user?.name || "Member"}
            </p>

            <p className="text-xs text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActive(id);
              setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-sm ${
              active === id
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-50 hover:text-black"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE SECTION
// ─────────────────────────────────────────────────────────────────────────────
const ProfileSection = ({ user }) => (
  <div className="space-y-6">
    <div>
      <h2 className="font-serif text-3xl text-black mb-1">
        Profile
      </h2>

      <p className="text-sm text-gray-500">
        Your personal information and membership details.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-semibold text-black uppercase tracking-widest">
            Personal Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            { label: "Full Name", value: user?.name },
            { label: "Email Address", value: user?.email },
            {
              label: "Role",
              value:
                user?.role === "admin"
                  ? "Administrator"
                  : "Member",
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] mb-2">
                {label}
              </p>

              <p className="text-base text-black border-b border-gray-100 pb-3">
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ORDER CARD
// ─────────────────────────────────────────────────────────────────────────────
const OrderCard = ({ order, cancelOrder }) => {
  const [expanded, setExpanded] = useState(false);

  const status =
    STATUS_CONFIG[order.orderStatus] ||
    STATUS_CONFIG.pending;

  const canCancel =
    order.orderStatus === "pending" ||
    order.orderStatus === "paid";

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div
        className="p-6 flex items-center gap-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Image */}
        <div className="w-20 h-20 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
          {order.products?.[0]?.image ? (
            <img
              src={order.products[0].image}
              alt={order.products[0].name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={24} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p>
               <span className="text-gray-600">Order Number:</span> 
                <span className="text-red-500">{order.orderNumber}</span>
              </p>

              <h4 className="font-serif text-lg text-black leading-tight">
                {order.products?.length} item
                {order.products?.length > 1 ? "s" : ""}
              </h4>

              <p className="text-xs text-gray-400 mt-1">
                {order.paymentMethod?.toUpperCase()} •{" "}
                {order.paymentStatus}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.badge}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                />

                {status.label}
              </span>

              <ChevronRight
                size={16}
                className={`text-gray-400 transition-transform ${
                  expanded ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 mt-3 flex-wrap">
            <span className="text-sm font-semibold text-black">
              KES{" "}
              {Number(order.totalAmount || 0).toLocaleString(
                "en-KE"
              )}
            </span>

            <span className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString(
                "en-GB"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50 space-y-6">
          {/* Products */}
          <div className="space-y-4">
            {order.products?.map((item) => (
              <div
                key={item.product}
                className="flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />

                  <div>
                    <h4 className="text-sm font-semibold text-black">
                      {item.name}
                    </h4>

                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-black">
                  KES{" "}
                  {Number(item.price).toLocaleString("en-KE")}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            

            <div>
              <p className="text-[10px] text-gray-400 underline uppercase tracking-[0.15em] mb-1">
                Payment
              </p>

              <p className="text-black capitalize">
                {order.paymentMethod}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 underline uppercase tracking-[0.15em] mb-1">
                Status
              </p>

              <p className="text-black capitalize">
                {order.orderStatus}
              </p>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
            <p className="text-[10px] text-gray-400 uppercase underline tracking-[0.15em] mb-1">
                Shipping Info
              </p>
            
 <p>
    <span className="text-gray-400">Name:</span>{" "}
    <span className="font-semibold text-red-500">
      {order.shippingAddress.fullName}
    </span>
  </p>

  <p>
    <span className="text-gray-400">Phone:</span>{" "}
    <span className=" font-semibold text-red-500">
      {order.shippingAddress.phoneNumber}
    </span>
  </p>

  <p>
    <span className="text-gray-400">Location:</span>{" "}
    <span className="font-semibold text-red-500">
      {order.shippingAddress.area}
    </span>
  </p>

  <p>
    <span className="text-gray-400">County:</span>{" "}
    <span className="font-semibold text-red-500">
      {order.shippingAddress.county}
    </span>
  </p>

  {order.shippingAddress.landmark && (
    <p>
      <span className="text-gray-400">Landmark:</span>{" "}
      <span className="font-semibold text-red-500">
        {order.shippingAddress.landmark}
      </span>
    </p>
  )}

  {order.shippingAddress.houseNumber && (
    <p>
      <span className="text-gray-400">House No:</span>{" "}
      <span className="font-semibold text-red-500">
        {order.shippingAddress.houseNumber}
      </span>
    </p>
  )}
</div>
            

           
          </div>

          {/* Cancel */}
          {canCancel && (
            <div className="flex justify-end">
              <button
                onClick={() => cancelOrder(order._id)}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs uppercase tracking-widest transition"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS SECTION
// ─────────────────────────────────────────────────────────────────────────────
const OrdersSection = ({
  orders,
  loading,
  cancelOrder,
}) => {
  const [filter, setFilter] = useState("all");

  const statuses = [
    "all",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const filtered =
    filter === "all"
      ? orders
      : orders.filter(
          (o) => o.orderStatus === filter
        );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-black mb-1">
          My Orders
        </h2>

        <p className="text-sm text-gray-600">
          {orders.length} total orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${
              filter === s
                ? "bg-black text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            {s === "all"
              ? "All"
              : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
          <Package
            size={40}
            className="mx-auto text-gray-200 mb-4"
          />

          <p className="text-sm text-gray-600">
            No orders found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              cancelOrder={cancelOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SAVED PIECES SECTION
// ─────────────────────────────────────────────────────────────────────────────

const SavedPiecesSection = () => {
  const {
    wishlist,
    loading,
    fetchWishlist,
    toggleLike,
  } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-3xl text-black mb-1">
            Saved Pieces
          </h2>

          <p className="text-sm text-gray-500">
            Your curated furniture collection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (wishlist.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-3xl text-black mb-1">
            Saved Pieces
          </h2>

          <p className="text-sm text-gray-500">
            Your curated furniture collection.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl py-20 px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-5">
            <Heart size={28} className="text-gray-300" />
          </div>

          <h3 className="text-lg font-semibold text-black mb-2">
            No saved pieces yet
          </h3>

          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Save furniture pieces you love and they’ll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl text-black mb-1">
          Saved Pieces
        </h2>

        <p className="text-sm text-gray-500">
          {wishlist.length} saved item
          {wishlist.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300"
          >
            {/* Image */}
            <Link to={`/product/${product._id}`}>
              <div className="relative overflow-hidden bg-gray-50">
                <img
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleLike(product);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-red-50 transition"
                >
                  <Trash2
                    size={18}
                    className="text-red-500"
                  />
                </button>
              </div>
            </Link>

            {/* Content */}
            <div className="p-5">
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                  {product.category}
                </p>

                <h3 className="font-serif text-lg text-black line-clamp-1">
                  {product.name}
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-black">
                  KES{" "}
                  {Number(product.price).toLocaleString(
                    "en-KE"
                  )}
                </p>

                <Link
                  to={`/product/${product._id}`}
                  className="text-xs uppercase tracking-widest text-black hover:text-gray-500 transition"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};







// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const UserProfilePage = () => {
  const { user, logout } = useUserStore();

  const {
    orders,
    loading,
    fetchUserOrders,
    cancelOrder,
  } = useOrderStore();

  const navigate = useNavigate();

  const [active, setActive] = useState("profile");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCancelOrder = async (orderId) => {
    const res = await cancelOrder(orderId);

    if (res?.success) {
      toast.success("Order cancelled");
    }
  };

  const renderContent = () => {
    switch (active) {
      case "profile":
        return <ProfileSection user={user} />;

      case "orders":
        return (
          <OrdersSection
            orders={orders}
            loading={loading}
            cancelOrder={handleCancelOrder}
          />
        );
         case "saved":
      return <SavedPiecesSection />;

      default:
        return <ProfileSection user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex font-['Manrope',sans-serif]">
      <Sidebar
        active={active}
        setActive={setActive}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main */}
      <div className="flex-1 lg:ml-72 min-h-screen">
        {/* Mobile top */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-5 h-16 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-black"
          >
            <span className="text-xl font-serif">
              Shamith Furniture
            </span>
          </button>

          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-500"
          >
            <Settings size={20} />
          </button>
        </div>

        <main className="max-w-4xl mx-auto px-5 md:px-10 py-10 md:py-14">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default UserProfilePage;