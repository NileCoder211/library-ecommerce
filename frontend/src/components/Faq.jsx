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

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.h1
        className="text-center font-bold text-5xl mb-10 text-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Frequently Asked Questions
      </motion.h1>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-500">FAQs</h2>

        <motion.div
          className="space-y-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                animate={{
                  scale: isOpen ? 1.01 : 1,
                  borderColor: isOpen ? "#9ca3af" : "#d1d5db",
                  boxShadow: isOpen
                    ? "0 8px 20px -8px rgba(0,0,0,0.15)"
                    : "0 1px 2px -1px rgba(0,0,0,0.05)",
                }}
                transition={{ duration: 0.2 }}
                className="border border-gray-300 rounded-2xl p-4 cursor-pointer"
              >
                <motion.button
                  onClick={() => toggleFAQ(index)}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex justify-between items-center text-left text-gray-500"
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
                </motion.button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.25,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ y: -6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: 0.05,
                        }}
                        className="mt-3 text-gray-500"
                      >
                        {faq.answer}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}