import {
  BarChart,
  PlusCircle,
  ShoppingBasket,
  PackageCheck,
  Menu,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import OrdersTab from "../components/OrdersTab";

import  {useProductStore}  from "../stores/useProductStore";

const tabs = [
  {
    id: "create",
    label: "Create Product",
    icon: PlusCircle,
  },
  {
    id: "products",
    label: "Products",
    icon: ShoppingBasket,
  },
  {
    id: "orders",
    label: "Orders",
    icon: PackageCheck,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart,
  },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { fetchAllProducts } = useProductStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <CreateProductForm />;

      case "products":
        return <ProductsList />;

      case "orders":
        return <OrdersTab />;

      case "analytics":
        return <AnalyticsTab />;

      default:
        return <CreateProductForm />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex overflow-hidden">
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      
     {/* SIDEBAR */}
<aside
  className={`fixed left-0 top-16 z-50 flex h-[95vh] w-72 flex-col bg-white px-6 py-8 shadow-2xl border-r border-gray-100 transition-transform duration-300 ${
    sidebarOpen
      ? "translate-x-0"
      : "-translate-x-full lg:translate-x-0"
  }`}
>
        {/* LOGO */}
        <div className="h-20 px-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-black tracking-tight">
              Shamith Admin
            </h1>

            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1">
              Dashboard Panel
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-5 border-t border-gray-100">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">
              Admin Access
            </p>

            <h3 className="font-semibold text-black">
              Furniture Management
            </h3>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
<div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        {/* MOBILE TOPBAR */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-100 px-5 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-black"
          >
            <Menu size={22} />
          </button>

          <h1 className="font-serif text-xl text-black">
            Admin Dashboard
          </h1>

          <div className="w-6" />
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-3">
            {/* HEADER */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <p className="text-[10px] uppercase text-center tracking-[0.2em] text-gray-500 mb-2">
                Admin Panel
              </p>

              <h1 className="font-serif text-center text-4xl text-black">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
            </motion.div>

            {/* TAB CONTENT */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;