

"use client";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    q: "How do I register for mock tests?",
    a: "Simply sign up for a free account and start attempting available mock tests from your dashboard.",
  },
  {
    q: "Are the tests based on the latest exam pattern?",
    a: "Yes, all our tests are regularly updated to match the latest exam patterns and syllabi.",
  },
  {
    q: "Can I access the platform on mobile?",
    a: "Absolutely! Our platform is mobile-friendly and our app is coming soon to Play Store and App Store.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit/debit cards, UPI, and net banking for paid plans.",
  },
  {
    q: "How can I become a teacher or partner?",
    a: 'Click the "Become a Teacher / Partner" button above and follow the onboarding process.',
  },
];

export default function FAQsSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleIndex = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="max-w-3xl mx-auto mb-16 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">❓ Frequently Asked Questions</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Got questions? We’ve got answers.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md divide-y divide-gray-200 dark:divide-gray-700">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx}>
              <button
                className="w-full flex items-center justify-between text-left px-6 py-4 focus:outline-none transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => toggleIndex(idx)}
              >
                <span className="font-semibold text-gray-800 dark:text-white">{faq.q}</span>
                <FiChevronDown
                  className={`text-xl transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  } text-gray-500 dark:text-gray-300`}
                />
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-40 py-2" : "max-h-0 py-0"
                }`}
              >
                <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
