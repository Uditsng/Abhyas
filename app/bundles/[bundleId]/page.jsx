// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/lib/firebaseConfig";
// import { useCartStore } from "@/lib/cartStore";
// import FloatingCartIcon from "@/components/FloatingCartIcon";
// import { motion } from "framer-motion";

// export default function BundleDescriptionPage() {
//   const { bundleId } = useParams();
//   const router = useRouter();
//   const { addToCart } = useCartStore();
//   const [bundle, setBundle] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBundle = async () => {
//       if (!bundleId) return;
//       const docRef = doc(db, "bundles", bundleId);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         setBundle({ id: docSnap.id, ...docSnap.data() });
//       }
//       setLoading(false);
//     };

//     fetchBundle();
//   }, [bundleId]);

//   const handleAddToCart = () => {
//     if (!bundle) return;
//     addToCart(bundle);
//     alert("Bundle added to cart!");
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[70vh]">
//         <div className="text-gray-500 dark:text-gray-300">Loading...</div>
//       </div>
//     );
//   }

//   if (!bundle) {
//     return <div className="text-center text-red-500">Bundle not found.</div>;
//   }

//   return (
//     <div className="pt-24 px-4 max-w-2xl mx-auto text-gray-800 dark:text-gray-100">
//       <FloatingCartIcon />

//       <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/20 rounded-2xl shadow-lg p-6 backdrop-blur-xl">
//         <h1 className="text-2xl md:text-3xl font-bold mb-2">
//           {bundle.title || "Untitled Bundle"}
//         </h1>
//         <p className="text-sm text-gray-500 dark:text-gray-400">
//        <span className="bg-gray-200 dark:bg-gray-900 text-green-600 dark:text-green-200 px-3 py-1 rounded-full">{[bundle.exam, bundle.subExamCategory, bundle.subject].filter(Boolean).join(' > ')}
//         </span> 
//         </p>

//         <div className="flex flex-wrap gap-3 mt-4 text-sm">
//           <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
//             {bundle.testIds?.length || 0} Tests
//           </span>
//           {bundle.validityDays && (
//             <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
//               {bundle.validityDays} Days Validity
//             </span>
//           )}
//           {bundle.price && (
//             <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
//               ₹{bundle.price}
//             </span>
//           )}
//         </div>

//         <div className="mt-6">
//           <h2 className="font-semibold text-lg mb-2">Description</h2>
//           <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
//             {bundle.description || "No description available."}
//           </p>
//         </div>

//         {bundle.features && bundle.features.length > 0 && (
//           <div className="mt-6">
//             <h2 className="font-semibold text-lg mb-2">What this bundle offers</h2>
//             <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 dark:text-gray-300">
//               {bundle.features.map((feat, i) => (
//                 <li key={i}>{feat}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {bundle.instructor && (
//           <div className="flex items-center gap-4 mt-6">
//             {bundle.instructor.imageUrl ? (
//               <img
//                 src={bundle.instructor.imageUrl}
//                 alt={bundle.instructor.name}
//                 className="w-12 h-12 rounded-full object-cover"
//               />
//             ) : (
//               <div className="w-12 h-12 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white font-bold">
//                 {bundle.instructor.name?.charAt(0).toUpperCase() || "I"}
//               </div>
//             )}
//             <div>
//               <p className="font-semibold">{bundle.instructor.name}</p>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 {bundle.instructor.bio}
//               </p>
//             </div>
//           </div>
//         )}

//         <div className="flex gap-4 mt-8 flex-wrap text-center">
//           <button
//             onClick={handleAddToCart}
//             className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm"
//           >
//             Add to Cart
//           </button>
//           <button
//             onClick={() => router.push(`/checkout`)}
//             className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-full text-sm"
//           >
//             Buy Now
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useCartStore } from "@/lib/cartStore";
import FloatingCartIcon from "@/components/FloatingCartIcon";
import { motion } from "framer-motion";
import { FaCartPlus, FaShoppingBag } from "react-icons/fa";


export default function BundleDescriptionPage() {
  const { bundleId } = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchBundle = async () => {
      if (!bundleId) return;
      const docRef = doc(db, "bundles", bundleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBundle({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };

    fetchBundle();
  }, [bundleId]);

  const handleAddToCart = () => {
    if (!bundle) return;
    addToCart(bundle);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-gray-500 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!bundle) {
    return <div className="text-center text-red-500">Bundle not found.</div>;
  }

  return (
    <div className="pt-28 px-4 mx-auto text-gray-800 dark:text-gray-100 relative max-w-3xl">
      <FloatingCartIcon />

      {/* Background radial blob */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-600/10 via-blue-500/10 to-transparent rounded-full blur-3xl opacity-30"></div>

      {/* Floating Glow Image Card */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-[-60px] flex justify-center"
      >
        <div className="bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/30 shadow-[0_0_30px_#60a5fa50] rounded-2xl p-2 max-w-sm">
          {bundle.imageUrl ? (
            <img
              src={bundle.imageUrl}
              alt={bundle.title || "Bundle"}
              className="w-full h-48 object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
              <div className="text-white text-4xl font-bold">
                {bundle.title?.charAt(0).toUpperCase() || "B"}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-md shadow-xl rounded-2xl pt-20 pb-6 px-6 max-w-2xl mx-auto"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{bundle.title}</h1>
          <div className="inline-block">
            <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-3 py-1 rounded-full text-sm">
              {[bundle.exam, bundle.subExamCategory, bundle.subject].filter(Boolean).join(" | ")}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-6 text-xs flex-wrap">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
            {bundle.testIds?.length || 0} Tests
          </span>
          {bundle.price && (
            <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
              ₹{bundle.price}
            </span>
          )}
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-3">Description</h2>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {bundle.description || "No description available."}
          </p>
        </div>

        {bundle.features?.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-3">What this bundle offers</h2>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {bundle.features.map((feat, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {bundle.instructor && (
          <div className="flex items-center gap-4 mb-8 p-4 bg-white/10 dark:bg-gray-700/30 border border-white/10 rounded-xl">
            {bundle.instructor.imageUrl ? (
              <img
                src={bundle.instructor.imageUrl}
                alt={bundle.instructor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {bundle.instructor.name?.charAt(0).toUpperCase() || "I"}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{bundle.instructor.name}</p>
              <p className="text-xs text-gray-400">{bundle.instructor.bio}</p>
            </div>
          </div>
        )}

        {/* Modern Gradient Buttons with Icons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition"
          >
            <FaCartPlus />
            Add to Cart
          </button>
          {showToast && (
        <div className="fixed bottom-20  bg-white text-black px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-50">
          ✅ Bundle added to cart!
        </div>
      )}
          <button
            onClick={() => router.push(`/cart`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-green-500 text-green-500 hover:bg-green-500/10 transition"
          >
            <FaShoppingBag />
            Buy Now
          </button>
        </div>
      </motion.div>

      {/* Floating Buy Now button (visible on scroll) */}
      {/* <motion.button
        onClick={() => router.push(`/checkout`)}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="fixed bottom-6 right-6 z-40 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm md:hidden"
      >
        <FaShoppingBag />
        Buy Now
      </motion.button> */}
    </div>
  );
}
