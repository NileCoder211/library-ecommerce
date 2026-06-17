import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Trash2, Eye, RefreshCcw } from "lucide-react";
import {
  useAllOrders,
  useUpdateOrderStatus,
  useDeleteOrder,
  useRetryMpesa,
} from "../queries/useOrder";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-blue-500/20 text-blue-400",
  shipped: "bg-purple-500/20 text-purple-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

const OrdersTab = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  // ── Queries & Mutations ───────────────────────────────────────────────────
  const { data, isLoading } = useAllOrders({ page, status, search });
  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  const updateStatusMutation = useUpdateOrderStatus();
  const deleteOrderMutation = useDeleteOrder();
  const retryMpesaMutation = useRetryMpesa();

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-emerald-400">Orders Management</h2>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search order..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // reset to page 1 on new search
              }}
              className="bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1); // reset to page 1 on filter change
            }}
            className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-700/30 transition">
                  {/* Order ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      #{order._id.slice(-6)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {order.user?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.user?.email}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-semibold">
                    KES {order.totalAmount?.toLocaleString()}
                  </td>

                  {/* Payment */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-300">
                      {order.paymentMethod}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.orderStatus}
                      disabled={updateStatusMutation.isPending}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          orderId: order._id,
                          orderStatus: e.target.value,
                        })
                      }
                      className={`px-3 py-1 rounded-full text-sm border-none outline-none capitalize ${
                        statusColors[order.orderStatus]
                      }`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="bg-gray-800 text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View */}
                      <button className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                        <Eye size={18} />
                      </button>

                      {/* Retry M-Pesa */}
                      {order.paymentMethod === "mpesa" &&
                        order.paymentStatus !== "paid" && (
                          <button
                            onClick={() => retryMpesaMutation.mutate(order._id)}
                            disabled={retryMpesaMutation.isPending}
                            className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                          >
                            <RefreshCcw size={18} />
                          </button>
                        )}

                      {/* Delete */}
                      <button
                        onClick={() => deleteOrderMutation.mutate(order._id)}
                        disabled={deleteOrderMutation.isPending}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  {isLoading ? "Loading orders..." : "No orders found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-gray-300">
          Page {page} {pagination?.totalPages ? `of ${pagination.totalPages}` : ""}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={pagination ? page >= pagination.totalPages : false}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default OrdersTab;