import { Box, Image, Text, Button, Flex, Badge, Stack } from "@chakra-ui/react";

export default function BundleCard({ bundle, onPurchase }) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      overflow="hidden"
      transition="box-shadow 0.2s"
      _hover={{ boxShadow: "xl" }}
      maxW="360px"
      w="100%"
      mx="auto"
      display="flex"
      flexDirection="column"
    >
      {/* 4:3 Image */}
      <Box
        pos="relative"
        w="100%"
        pt="50%" // 2:1 aspect ratio
        bg="gray.100"
      >
        <Image
          src={"/banner1.jpg"}
          alt={bundle.title}
          objectFit="cover"
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
        />
      </Box>
      <Stack spacing={2} p={3} flex="1 1 auto">
        <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
          {bundle.title}
        </Text>
        <Text color="gray.600" fontSize="sm" noOfLines={1}>
          Subject: <b>{bundle.subject}</b>
        </Text>
        <Flex align="center" gap={2}>
          <Badge colorScheme="blue" fontSize="0.9em">
            ₹{bundle.price}
          </Badge>
          <Badge colorScheme="green" fontSize="0.9em">
            {bundle.testIds?.length || 0} Tests
          </Badge>
        </Flex>
        <Button
          colorScheme="blue"
          variant="solid"
          mt={2}
          borderRadius="full"
          onClick={() => onPurchase?.(bundle)}
        >
          Purchase Bundle
        </Button>
      </Stack>
    </Box>
  );
}