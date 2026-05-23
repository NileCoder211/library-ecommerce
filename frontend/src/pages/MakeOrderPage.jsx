import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useProductStore } from "../stores/useProductStore";

const MakeOrderPage = () => {
  const { id } = useParams();
  const { createCustomOrder } = useProductStore(); // ✅ inside component

  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    quantity: 1,
    address: "",
    note: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product. Please try again.");
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try { // ✅ try block was missing
      await createCustomOrder(formData, product._id);

      toast.success("Order submitted successfully!");

      setFormData({
        fullName: "",
        phone: "",
        email: "",
        quantity: 1,
        address: "",
        note: "",
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit order");
    }
  };

  if (!product) {
    return <h1 className="text-center mt-10">Loading...</h1>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="w-full h-[500px] object-cover rounded-2xl"
          />
          <h1 className="text-5xl md:text-7xl leading-none text-black tracking-tight font-serif mb-2">{product.name}</h1>
          <p className="text-lg leading-relaxed text-[#444748] mt-6">{product.description}</p>
          <h2 className="text-2xl text-[#7c5730] font-serif">${product.price}</h2>

        </div>

        <div>
          
        <form
  onSubmit={handleSubmit}
  className="
    space-y-5
    bg-[#fcfcfc]
    border border-gray-200
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    rounded-2xl
    p-6 md:p-8
  "
>
  <input
    type="text"
    name="fullName"
    placeholder="Full Name"
    value={formData.fullName}
    onChange={handleChange}
    required
    className="
      w-full
      bg-white
      border border-gray-300
      text-black
      p-3
      rounded-xl
      focus:outline-none
      focus:ring-2
      focus:ring-black
    "
  />

  <input
    type="text"
    name="phone"
    placeholder="Phone Number"
    value={formData.phone}
    onChange={handleChange}
    required
    className="
      w-full
      bg-white
      border border-gray-300
      text-black
      p-3
      rounded-xl
      focus:outline-none
      focus:ring-2
      focus:ring-black
    "
  />

  <input
    type="email"
    name="email"
    placeholder="Email Address"
    value={formData.email}
    onChange={handleChange}
    required
    className="
      w-full
      bg-white
      border border-gray-300
      text-black
      p-3
      rounded-xl
      focus:outline-none
      focus:ring-2
       focus:ring-black
    "
  />

  <input
    type="number"
    name="quantity"
    placeholder="Quantity"
    value={formData.quantity}
    onChange={handleChange}
    required
    className="
      w-full
      bg-white
      border border-gray-300
      text-black
      p-3
      rounded-xl
      focus:outline-none
      focus:ring-2
     focus:ring-black
    "
  />

  <textarea
    name="address"
    placeholder="Delivery Address"
    value={formData.address}
    onChange={handleChange}
    required
    rows="3"
    className="
      w-full
      bg-white
      border border-gray-300
      text-black
      p-3
      rounded-xl
      focus:outline-none
      focus:ring-2
       focus:ring-black
    "
  />

  <textarea
    name="note"
    placeholder="Additional Notes"
    value={formData.note}
    onChange={handleChange}
    rows="4"
    className="
      w-full
      bg-white
      border border-gray-300
      text-black
      p-3
      rounded-xl
      focus:outline-none
      focus:ring-2
      focus:ring-black
    "
  />

  <button
    type="submit"
    className="
      w-full
      bg-black
      hover:bg-black/60
      text-white
      font-medium
      py-3
      rounded-xl
      transition
      duration-300
      cursor-pointer
    "
  >
    Submit Order Request
  </button>
</form>
        </div>
      </div>
    </div>
  );
};

export default MakeOrderPage;