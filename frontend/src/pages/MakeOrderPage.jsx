import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "../lib/axios";

const BUSINESS_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || "254700000000";

const MakeOrderPage = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    quantity: 1,
    address: "",
    note: "",
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(`/products/${id}`);
      return res.data;
    },
  });

  const submitOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/orders/custom", {
        ...formData,
        productId: product._id,
      });
      return res.data;
    },

    onSuccess: (data) => {
      toast.success("Order submitted! Opening WhatsApp…");

      const total = Number(product.price) * Number(formData.quantity);
      const orderNum = data?.orderNumber || data?.order?.orderNumber || "";

      const message = encodeURIComponent(
        `🛋️ *Custom Order Request*\n\n` +
        (orderNum ? `Order #: ${orderNum}\n` : "") +
        `👤 *${formData.fullName}*\n` +
        `📞 ${formData.phone}\n` +
        `📧 ${formData.email}\n\n` +
        `*Product:* ${product.name}\n` +
        `*Qty:* ${formData.quantity}\n` +
        `*Unit Price:* KES ${Number(product.price).toLocaleString("en-KE", { maximumFractionDigits: 0 })}\n` +
        `*Total:* KES ${total.toLocaleString("en-KE", { maximumFractionDigits: 0 })}\n\n` +
        `📍 *Delivery Address:*\n${formData.address}\n\n` +
        (formData.note ? `📝 *Notes:* ${formData.note}\n\n` : "") +
        `Please confirm availability and next steps. Thank you! 🙏`
      );

      setTimeout(() => {
        window.open(`https://wa.me/${BUSINESS_PHONE}?text=${message}`, "_blank");
      }, 800);

      setFormData({ fullName: "", phone: "", email: "", quantity: 1, address: "", note: "" });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit order");
    },
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitOrderMutation.mutate();
  };

  if (isLoading || !product) return <h1 className="text-center mt-10">Loading...</h1>;

  const total = Number(product.price) * Number(formData.quantity);

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      <div className="grid md:grid-cols-2 gap-10">

        {/* LEFT — Product info */}
        <div>
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="w-full h-[500px] object-cover rounded-2xl"
          />
          <h1 className="text-5xl md:text-7xl leading-none text-black tracking-tight font-serif mb-2 mt-4">
            {product.name}
          </h1>
          <p className="text-lg leading-relaxed text-[#444748] mt-6">
            {product.description}
          </p>
          <h2 className="text-2xl text-[#7c5730] font-serif mt-3">
            KES {Number(product.price).toLocaleString("en-KE", { maximumFractionDigits: 0 })}
          </h2>

          <div className="mt-6 flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
            <WaIcon size={20} className="text-green-600 flex-none mt-0.5" />
            <p className="text-sm text-green-800 leading-relaxed">
              After submitting, WhatsApp will open automatically with your order
              details pre-filled. Just hit <strong>Send</strong> to confirm with our team.
            </p>
          </div>
        </div>

        {/* RIGHT — Order form */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-[#fcfcfc] border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Details</h2>

            <input
              type="text" name="fullName" placeholder="Full Name"
              value={formData.fullName} onChange={handleChange} required
              className="w-full bg-white border border-gray-300 text-black p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="tel" name="phone" placeholder="WhatsApp Number (e.g. 0712 345 678)"
              value={formData.phone} onChange={handleChange} required
              className="w-full bg-white border border-gray-300 text-black p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="email" name="email" placeholder="Email Address"
              value={formData.email} onChange={handleChange} required
              className="w-full bg-white border border-gray-300 text-black p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />

            {/* Quantity stepper */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 whitespace-nowrap">Quantity</label>
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setFormData(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                  className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg"
                >−</button>
                <span className="w-8 text-center font-semibold text-gray-800">{formData.quantity}</span>
                <button type="button"
                  onClick={() => setFormData(f => ({ ...f, quantity: f.quantity + 1 }))}
                  className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg"
                >+</button>
              </div>
            </div>

            <textarea
              name="address" placeholder="Delivery Address"
              value={formData.address} onChange={handleChange} required rows="3"
              className="w-full bg-white border border-gray-300 text-black p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
            <textarea
              name="note" placeholder="Additional Notes (e.g. color, finish, special requests)"
              value={formData.note} onChange={handleChange} rows="3"
              className="w-full bg-white border border-gray-300 text-black p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />

            {/* Total preview */}
            <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <span className="text-sm text-gray-500">
                {formData.quantity} × KES {Number(product.price).toLocaleString("en-KE", { maximumFractionDigits: 0 })}
              </span>
              <span className="font-bold text-gray-800">
                KES {total.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
              </span>
            </div>

            <button
              type="submit" disabled={submitOrderMutation.isPending}
              className="w-full flex items-center justify-center gap-2.5
                         bg-green-500 hover:bg-green-600 active:bg-green-700
                         text-white font-semibold py-3.5 rounded-xl
                         transition duration-200 cursor-pointer disabled:opacity-50"
            >
              <WaIcon size={20} className="text-white" />
              {submitOrderMutation.isPending ? "Submitting…" : "Submit & Open WhatsApp"}
            </button>

            <p className="text-xs text-center text-gray-400">
              Your order is saved first, then WhatsApp opens with everything pre-filled.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

function WaIcon({ size = 20, className = "text-white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default MakeOrderPage;