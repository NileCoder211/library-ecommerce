import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is your return policy?",
    answer: "You can return items within 30 days with a receipt.",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship worldwide. Shipping costs may vary.",
  },
  {
    question: "How can I track my order?",
    answer: "You will receive a tracking link via email once shipped.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="flex justify-center item-center font-bold text-5xl mb-10 text-emerald-400">Frequently Ask Questions</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Image */}
        <div className="w-full">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"
            alt="FAQ illustration"
            className="w-full h-full object-cover rounded-2xl shadow-md"
          />
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">FAQs</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  layout
                  className="border cursor-pointer rounded-2xl p-4 shadow-sm"
                  transition={{ layout: { duration: 0.25 } }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-center cursor-pointer text-left"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <motion.span
                      initial={false}
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isOpen ? (
                        <Minus className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-gray-600">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
