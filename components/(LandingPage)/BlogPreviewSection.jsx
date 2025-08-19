
"use client";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "How to Crack SSC CGL in First Attempt",
    intro:
      "Tips, strategies, and resources to help you ace the SSC CGL exam on your first try.",
    image: "/images/Crack-ssc.png",
    link: "/blog/ssc-cgl-first-attempt",
  },
  {
    id: 2,
    title: "Top 5 Mistakes to Avoid in Banking Exams",
    intro:
      "Learn the most common pitfalls and how to avoid them for a successful banking exam journey.",
    image: "/images/Mistakes-to-Avoid-while-Preparing-for-Bank-Exams-2859110912.webp",
    link: "/blog/banking-mistakes",
  },
  {
    id: 3,
    title: "Effective Time Management for UPSC Aspirants",
    intro:
      "Master your study schedule and boost productivity with these proven time management techniques.",
    image: "/images/Time-1024x536-2217678230.jpg",
    link: "/blog/upsc-time-management",
  },
];

export default function BlogPreviewSection() {
  return (
    <section className="mb-16 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">📰 Latest Articles</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Stay updated with our latest tips and insights.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md max-w-sm w-full overflow-hidden transition-transform hover:shadow-lg"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-[180px] object-cover"
            />
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {post.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{post.intro}</p>
              <Link
                href={post.link}
                className="inline-block border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 px-4 py-2 rounded-md text-sm transition-colors duration-200"
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/blog"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          View All Articles
        </Link>
      </div>
    </section>
  );
}
