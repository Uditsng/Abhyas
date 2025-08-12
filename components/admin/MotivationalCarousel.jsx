'use client';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaQuoteLeft } from 'react-icons/fa';

const motivationalQuotes = [
  "Every question you create plants a seed for someone’s success.",
  "Your knowledge today shapes someone’s tomorrow.",
  "Teaching is the art of turning doubts into confidence.",
  "Behind every achiever is a teacher who believed first.",
  "Your lessons may last an hour, but their impact lasts a lifetime.",
  "Exams test knowledge, teachers build it.",
  "You’re not just teaching — you’re shaping futures.",
  "Every bundle you create is a ladder for someone’s dreams.",
  "A good teacher can inspire hope, ignite imagination, and instill a love for learning.",
  "You don’t just prepare tests, you prepare minds."
];

export default function MotivationalCarousel() {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    fade: true,
    cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
    arrows: false,
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Slider {...settings} className="w-full">
        {motivationalQuotes.map((quote, index) => (
          <div key={index} className="px-4 py-8 h-full">
            <div className="flex flex-col items-center justify-center text-center h-full">
               <FaQuoteLeft className="text-3xl text-blue-400 dark:text-blue-300 mb-4" />
               <p className="text-xl md:text-2xl font-serif italic text-gray-700 dark:text-gray-200">
                "{quote}"
               </p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}