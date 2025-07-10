import { Box, Heading, Text, Button, Flex, List, ListItem, ListIcon, useColorModeValue } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    features: [
      'Access to limited tests',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Get Started',
    color: 'gray',
  },
  {
    name: 'Basic',
    price: '₹199/mo',
    features: [
      'All Free features',
      'Unlimited test attempts',
      'Detailed solutions',
      'Performance analytics',
    ],
    cta: 'Buy Basic',
    color: 'blue',
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    features: [
      'All Basic features',
      'All India Ranking',
      '1-on-1 mentorship',
      'Early access to new features',
    ],
    cta: 'Go Pro',
    color: 'purple',
  },
];

export default function PricingPlansSection() {
  const glassBg = useColorModeValue('bg-white/60', 'bg-white/10');
  const glassBorder = useColorModeValue('border-white/30', 'border-white/20');

  return (
    <Box className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">💳 Pricing & Plans</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Choose the plan that fits your needs.</p>
      </div>
      <Flex gap={8} justify="center" flexWrap="wrap">
        {plans.map((plan) => (
          <Box
            key={plan.name}
            className={`rounded-2xl shadow-md p-8 flex flex-col items-center justify-between ${glassBg} backdrop-blur-lg border ${glassBorder} transition-colors duration-200 mb-6`}
            minW="260px"
            maxW="sm"
            w="full"
            borderWidth="1px"
            borderColor={glassBorder}
          >
            <Heading size="lg" mb={2} color={`${plan.color}.500`}>{plan.name}</Heading>
            <Text fontSize="3xl" fontWeight="bold" mb={4}>{plan.price}</Text>
            <List spacing={3} mb={6}>
              {plan.features.map((feature, idx) => (
                <ListItem key={idx} className="flex items-center">
                  <ListIcon as={FiCheckCircle} color={`${plan.color}.400`} />
                  <span>{feature}</span>
                </ListItem>
              ))}
            </List>
            <Button colorScheme={plan.color} variant="solid" size="md" w="full">{plan.cta}</Button>
          </Box>
        ))}
      </Flex>
    </Box>
  );
} 