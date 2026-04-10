import { useState } from "react";
import { motion } from "framer-motion";

export default function AppointmentSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "one-to-one",
    mode: "virtual",
    date: "",
  });
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = (e) => {
  e.preventDefault();

  setLoading(true);
  setSuccess(false);

  console.log("Appointment booked:", form);

  setTimeout(() => {
    setLoading(false);
    setSuccess(true);

    setForm({
      name: "",
      email: "",
      type: "one-to-one",
      mode: "virtual",
      date: "",
    });

    setTimeout(() => {
      setSuccess(false);
    }, 5000);
  }, 2000); // simulate request delay
};

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold">Book an Appointment</h2>
        <p className="text-gray-600 mt-2">
          Choose your preferred mentorship type and session mode.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-6 rounded-2xl shadow-md space-y-5"
      >
        {/* Name */}
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full  border rounded-lg px-3 py-2"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full  border rounded-lg px-3 py-2"
          />
        </div>

        {/* Appointment Type */}
        <div>
          <label className="block text-sm mb-2">Mentorship Type</label>
          <div className="flex gap-4">
            {["one-to-one", "group"].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setForm({ ...form, type })}
                className={`px-4 py-2 rounded-lg border ${
                  form.type === type ? "bg-black text-white" : ""
                }`}
              >
                {type === "one-to-one" ? "One-to-One" : "Group Mentorship"}
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-sm mb-2">Session Mode</label>
          <div className="flex gap-4">
            {["virtual", "in-person"].map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setForm({ ...form, mode })}
                className={`px-4 py-2 rounded-lg border ${
                  form.mode === mode ? "bg-black text-white" : ""
                }`}
              >
                {mode === "virtual" ? "Virtual" : "In-Person"}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm mb-1">Select Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border  rounded-lg px-3 py-2"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Booking..." : "Book Appointment"}
        </button>
        {success && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-green-600 text-sm text-center"
          >
            Appointment received! We'll get back to you shortly.
          </motion.p>
        )}
      </motion.form>
    </section>
  );
}
