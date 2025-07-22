'use client';

import { useCartStore } from '@/lib/cartStore';
import { Box, IconButton, Text, Tooltip } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FaShoppingCart } from 'react-icons/fa';

export default function FloatingCartIcon() {
  const cartItems = useCartStore((state) => state.cartItems);
  const router = useRouter();

  return (
    <Tooltip label="View Cart" hasArrow>
      <Box
        position="fixed"
        bottom="24px"
        left="24px"
        zIndex="9999"
        bg="whiteAlpha.300"
        backdropFilter="blur(8px)"
        borderRadius="full"
        boxShadow="xl"
        p={2}
        onClick={() => router.push('/cart')}
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
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
  );
}
