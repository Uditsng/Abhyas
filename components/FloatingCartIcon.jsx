//Floating cart icon page
'use client';

import { useCartStore } from '@/lib/cartStore';
import { Box, IconButton, Tooltip } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function FloatingCartIcon() {
  const cartItems = useCartStore((state) => state.cartItems);
  const router = useRouter();

  return (
    <motion.div
      drag
      dragMomentum={false}
      style={{
        position: 'fixed',
        bottom: '78px',
        right: '24px',
        zIndex: 9999,
        cursor: 'grab',
      }}
    >
      <Tooltip label="View Cart" hasArrow>
        <Box
          bg="whiteAlpha.300"
          backdropFilter="blur(8px)"
          borderRadius="full"
          boxShadow="xl"
          p={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => router.push('/cart')}
        >
          <IconButton
            icon={<FaShoppingCart />}
            aria-label="Cart"
            isRound
            variant="ghost"
            colorScheme="blue"
            fontSize="24px"
          />
          {cartItems.length > 0 && (
            <Box
              position="absolute"
              top="0px"
              right="0px"
              bg="red.500"
              color="white"
              fontSize="xs"
              fontWeight="bold"
              borderRadius="full"
              px={2}
              transform="translate(40%, -40%)"
            >
              {cartItems.length}
            </Box>
          )}
        </Box>
      </Tooltip>
    </motion.div>
  );
}


// 'use client';

// import { useCartStore } from '@/lib/cartStore';
// import { useRouter } from 'next/navigation';
// import { FaShoppingCart } from 'react-icons/fa';
// import { motion } from 'framer-motion';
// import { useState } from 'react';

// export default function FloatingCartIcon() {
//   const cartItems = useCartStore((state) => state.cartItems);
//   const router = useRouter();
//   const [hover, setHover] = useState(false);

//   return (
//     <motion.div
//       drag
//       dragElastic={0.2}
//       dragMomentum={false}
//       onClick={() => router.push('/cart')}
//       onMouseEnter={() => setHover(true)}
//       onMouseLeave={() => setHover(false)}
//       style={{
//         position: 'fixed',
//         bottom: '24px',
//         left: '24px',
//         zIndex: 9999,
//         cursor: 'grab',
//         backgroundColor: 'rgba(255, 255, 255, 0.3)',
//         backdropFilter: 'blur(8px)',
//         borderRadius: '9999px',
//         boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
//         padding: '12px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         transition: 'background 0.3s',
//       }}
//     >
//       <div className="relative text-blue-600 dark:text-white text-3xl">
//         <FaShoppingCart />
//         {cartItems.length > 0 && (
//           <div
//             className="absolute -top-6 -right-4 text-red-500 text-s font-bold rounded-full px-1 py-1"
//           >
//             {cartItems.length}
//           </div>
//         )}
//         {/* Tooltip on hover */}
//         {hover && (
//           <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
//             View Cart
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// }
