'use client';

import {
  Box,
  Image,
  Text,
  Button,
  Flex,
  Badge,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BundlePurchase({ bundle }) {
  const router = useRouter();

  // Theme colors
  const cardBg = useColorModeValue('white', 'whiteAlpha.100');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const badgeBg = useColorModeValue('blue.50', 'blue.900');
  const badgeColor = useColorModeValue('blue.600', 'blue.200');
  const priceBg = useColorModeValue('green.50', 'green.900');
  const priceColor = useColorModeValue('green.600', 'green.200');

  // const handleBuyNow = () => {
  //   router.push(`/checkout/${bundle.id}`);
  // }; 

  return (
    <Box
      bg={cardBg}
      borderRadius="2xl"
      boxShadow="md"
      overflow="hidden"
      transition="box-shadow 0.2s, transform 0.2s"
      _hover={{ boxShadow: 'xl', transform: 'translateY(-2px) scale(1.03)' }}
      maxW="360px"
      w="100%"
      mx="auto"
      display="flex"
      flexDirection="column"
      borderWidth="1px"
      borderColor={border}
      className="backdrop-blur-lg border border-white/20 shadow-md"
    >
      {/* Banner Image */}
      <Box
        pos="relative"
        w="100%"
        pt="50%" // 2:1 ratio
        bg="gray.100"
        _dark={{ bg: 'gray.800' }}
      >
        <Image
          src={bundle.imageUrl || "/images/defence1.jpg"}
          alt={bundle.title}
          objectFit="cover"
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
        />
      </Box>

      {/* Content */}
      <Stack spacing={2} p={4} flex="1 1 auto">
        <Text fontWeight="bold" fontSize="lg" noOfLines={1} color={textColor}>
          {bundle.title}
        </Text>
        <Text color={subTextColor} fontSize="sm" noOfLines={1}>
          <b>{bundle.subject}</b>
        </Text>

        <Flex align="center" gap={2}>
          <Badge
            bg={priceBg}
            color={priceColor}
            fontSize="0.9em"
            px={2}
            py={1}
            borderRadius="md"
          >
            ₹{bundle.price}
          </Badge>
          <Badge
            bg={badgeBg}
            color={badgeColor}
            fontSize="0.9em"
            px={2}
            py={1}
            borderRadius="md"
          >
            {bundle.testIds?.length || 0} Tests
          </Badge>
        </Flex>

        {/* View Bundle & Buy Now Buttons */}
        <Flex direction="column" gap={2} mt={2}>
          {/* <Link href={`/testList/${bundle.id}`}>
            <Button
              colorScheme="gray"
              variant="outline"
              w="full"
              borderRadius="full"
            >
              View Bundle
            </Button>
          </Link> */}

          <Link href={`/bundles/${bundle.id}`}>
            <Button
              colorScheme="blue"
              variant="solid"
              w="full"
              borderRadius="full"
            >
              Details
            </Button>
          </Link>
        </Flex>
      </Stack>
    </Box>
  );
}
