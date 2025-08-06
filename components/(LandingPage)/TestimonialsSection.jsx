
"use client";
import { useState, useEffect } from "react";
import { FiStar } from "react-icons/fi";
import { Avatar } from "@chakra-ui/react"; // Optional: replace with <img> if removing Chakra completely

const testimonials = [
  {
    name: "Amit Sharma",
    image: "/images/profile1.png",
    text: "This platform helped me achieve my dream rank! The analytics and solutions are top-notch.",
    rating: 5,
  },
  {
    name: "Priya Singh",
    image: "/images/profile2.png",
    text: "Affordable and effective. The mock tests are very close to the real exam.",
    rating: 4,
  },
  {
    name: "Rahul Verma",
    image: "/images/profile3.png",
    text: "Loved the mobile app and instant feedback. Highly recommended!",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    image: "/images/profile4.png",
    text: "The All India Ranking feature kept me motivated throughout my preparation.",
    rating: 5,
  },
  {
    name: "Vikram Joshi",
    image: "/images/profile5.png",
    text: "Clean interface and detailed analysis after every test. Loved it.",
    rating: 5,
  },
  {
    name: "Neha Kumari",
    image: "/images/profile6.png",
    text: "Highly accurate mock tests. Cleared prelims because of this!",
    rating: 4,
  },
  {
    name: "Raj Mehta",
    image: "/images/profile7.png",
    text: "Best platform for SSC & Banking aspirants. No doubt about that.",
    rating: 5,
  },
  {
    name: "Simran Kaur",
    image: "/images/profile8.png",
    text: "Customer support is super helpful and the platform is always improving.",
    rating: 4,
  },
  {
    name: "Ankit Rana",
    image: "/images/profile9.png",
    text: "The mock test bundles are worth every rupee. Helped me a lot.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentSet, setCurrentSet] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % 3); // 3 sets: 0,1,2
    }, 7000); // rotate every 7 sec
    return () => clearInterval(interval);
  }, []);

  const getVisibleTestimonials = () => {
    const startIndex = currentSet * 3;
    return testimonials.slice(startIndex, startIndex + 3);
  };

  return (
    <section className="mb-16 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">❤️ What Our Students Say</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Real stories from real achievers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getVisibleTestimonials().map((testimonial, idx) => (
          <div
            key={idx}
            className=" dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-md transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <Avatar src={testimonial.image} name={testimonial.name} size="xl" className="mb-4" />
              <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-3">"{testimonial.text}"</p>
              <div className="flex gap-1 mb-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <FiStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white">{testimonial.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
