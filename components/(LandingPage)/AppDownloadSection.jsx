import { Box,Text, Button, Flex, useColorModeValue, Image } from '@chakra-ui/react';
import { FaGooglePlay, FaApple } from 'react-icons/fa';

export default function AppDownloadSection() {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('border-gray-200', 'border-gray-700');

  return (
    <Box className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">📱 Get Our App</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Learn anytime, anywhere. Download our mobile app for the best experience!</p>
      </div>
      <Flex justify="center" align="center" gap={12} flexWrap="wrap">
        
          <Image
            src="/images/android-chrome-192x192.png"
            alt="App Device Mockup"
            // boxSize={{ base: '120px', md: '180px' }}
            // borderRadius="2xl"
            // boxShadow="lg"
            // bg={bg}
            // borderWidth="1px"
            // borderColor={border}
          />
        
        <Box textAlign="center">
          <Text fontSize="xl" mb={4} fontWeight="semibold">
            Coming soon to your favorite app store!
          </Text>
          <Flex gap={4} justify="center">
            <Button leftIcon={<FaGooglePlay />} colorScheme="green" variant="solid" size="lg" isDisabled>
              Play Store
            </Button>
            <Button leftIcon={<FaApple />} colorScheme="gray" variant="solid" size="lg" isDisabled>
              App Store
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
} 