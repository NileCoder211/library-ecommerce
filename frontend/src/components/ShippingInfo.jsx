import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  Building2,
  Landmark,
  Home,
} from "lucide-react";

const kenyaCounties = [
  "Nairobi",
  "Mombasa",
  "Kiambu",
  "Kisumu",
  "Nakuru",
  "Machakos",
  "Kajiado",
  "Uasin Gishu",
  "Nyeri",
  "Murang'a",
  "Kakamega",
  "Kilifi",
  "Meru",
  "Kericho",
  "Bungoma",
  "Eldoret",
];

const ShippingAddressForm = ({ shippingAddress, setShippingAddress }) => {
  const [errors, setErrors] = useState({});

  const validatePhone = (phone) => {
    return /^(07|01)\d{8}$/.test(phone.replace(/\s+/g, ""));
  };

  const handleChange = (field, value) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!shippingAddress.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(shippingAddress.phoneNumber)) {
      newErrors.phoneNumber =
        "Enter a valid Safaricom/Airtel number";
    }

    if (!shippingAddress.county) {
      newErrors.county = "County is required";
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = "Town/City is required";
    }

    if (!shippingAddress.area.trim()) {
      newErrors.area = "Estate/Area is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black">
          Shipping Address
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Enter your delivery information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* FULL NAME */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Full Name
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:border-black transition">
            <User size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="John Mwangi"
              value={shippingAddress.fullName}
              onChange={(e) =>
                handleChange("fullName", e.target.value)
              }
              className="w-full bg-transparent outline-none text-sm text-black placeholder-gray-400"
            />
          </div>

          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* PHONE NUMBER */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Phone Number
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:border-black transition">
            <Phone size={18} className="text-gray-400" />

            <input
              type="tel"
              placeholder="0712 345 678"
              value={shippingAddress.phoneNumber}
              onChange={(e) =>
                handleChange("phoneNumber", e.target.value)
              }
              className="w-full bg-transparent outline-none text-sm text-black placeholder-gray-400"
            />
          </div>

          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-red-500">
              {errors.phoneNumber}
            </p>
          )}
        </div>

        {/* COUNTY */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            County
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:border-black transition">
            <MapPin size={18} className="text-gray-400" />

            <select
              value={shippingAddress.county}
              onChange={(e) =>
                handleChange("county", e.target.value)
              }
              className="w-full bg-transparent outline-none text-sm text-black"
            >
              <option value="">Select County</option>

              {kenyaCounties.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
          </div>

          {errors.county && (
            <p className="mt-1 text-xs text-red-500">
              {errors.county}
            </p>
          )}
        </div>

       

        {/* AREA */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Estate / Area
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:border-black transition">
            <Home size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="South B"
              value={shippingAddress.area}
              onChange={(e) =>
                handleChange("area", e.target.value)
              }
              className="w-full bg-transparent outline-none text-sm text-black placeholder-gray-400"
            />
          </div>

          {errors.area && (
            <p className="mt-1 text-xs text-red-500">
              {errors.area}
            </p>
          )}
        </div>

        {/* HOUSE NUMBER */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            House / Apartment No. (Optional)
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:border-black transition">
            <Building2 size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Apartment B12"
              value={shippingAddress.houseNumber}
              onChange={(e) =>
                handleChange("houseNumber", e.target.value)
              }
              className="w-full bg-transparent outline-none text-sm text-black placeholder-gray-400"
            />
          </div>
        </div>

        {/* LANDMARK */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Landmark (Optional)
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:border-black transition">
            <Landmark size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Near Quickmart / opposite Shell station"
              value={shippingAddress.landmark}
              onChange={(e) =>
                handleChange("landmark", e.target.value)
              }
              className="w-full bg-transparent outline-none text-sm text-black placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShippingAddressForm;