'use client';

import { subscriptionPlans, SUBSCRIPTION_STATUS } from '@/lib/subscriptions';
import { Box, Heading, Text, VStack, Button, SimpleGrid, Badge, useToast } from '@chakra-ui/react';
import { useSubscription } from '@/components/SubscriptionContext';
import { useAuth } from '@/components/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { subscription, refreshSubscription } = useSubscription();
  const toast = useToast();

  const handleSubscribe = async (plan) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please login to subscribe to a plan.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const subscriptionData = {
        planId: plan.id,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        startDate: new Date().toISOString(),
        expiryDate: calculateExpiryDate(plan.duration),
        paymentStatus: 'pending',
        features: plan.features,
        maxTestsPerMonth: plan.maxTestsPerMonth
      };

      await setDoc(doc(db, 'subscriptions', user.uid), subscriptionData);
      
      toast({
        title: 'Subscription Activated',
        description: `You have successfully activated the ${plan.name} plan.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      refreshSubscription();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate subscription. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calculateExpiryDate = (duration) => {
    const date = new Date();
    const [amount, unit] = duration.split(' ');
    date.setMonth(date.getMonth() + parseInt(amount));
    return date.toISOString();
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Heading mb={6} textAlign="center">Choose Your Subscription Plan</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {subscriptionPlans.map((plan) => (
          <Box
            key={plan.id}
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="md"
            bg={subscription?.planId === plan.id ? 'blue.50' : 'white'}
            _dark={{
              bg: subscription?.planId === plan.id ? 'blue.900' : 'gray.800',
            }}
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: 'lg',
            }}
          >
            <VStack align="start" spacing={4}>
              <Box w="full">
                <Heading size="md">{plan.name}</Heading>
                <Text fontSize="2xl" fontWeight="bold" mt={2}>
                  ${plan.price}
                  <Text as="span" fontSize="md" fontWeight="normal" color="gray.500">
                    /{plan.duration}
                  </Text>
                </Text>
              </Box>

              <Box w="full">
                <Text fontWeight="medium" mb={2}>Features:</Text>
                <VStack align="start" spacing={2}>
                  {plan.features.map((feature, index) => (
                    <Text key={index} fontSize="sm">
                      ✓ {feature}
                    </Text>
                  ))}
                </VStack>
              </Box>
{/* 
              <Box w="full">
                <Text fontSize="sm" color="gray.500">
                  Max Tests: {plan.maxTestsPerMonth}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Trial Period: {plan.trialPeriod} days
                </Text>
              </Box> */}

              <Button
                w="full"
                colorScheme="blue"
                onClick={() => handleSubscribe(plan)}
                isDisabled={subscription?.planId === plan.id}
              >
                {subscription?.planId === plan.id ? 'Current Plan' : 'Subscribe Now'}
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      {subscription && (
        <Box mt={8} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Your Active Subscription</Heading>
          <VStack align="start" spacing={3}>
            <Text>
              <strong>Plan:</strong> {subscription.plan?.name}
            </Text>
            <Text>
              <strong>Status:</strong>{' '}
              <Badge
                colorScheme={
                  subscription.status === SUBSCRIPTION_STATUS.ACTIVE
                    ? 'green'
                    : subscription.status === SUBSCRIPTION_STATUS.TRIAL
                    ? 'blue'
                    : 'red'
                }
              >
                {subscription.status}
              </Badge>
            </Text>
            <Text>
              <strong>Days Remaining:</strong> {subscription.daysRemaining}
            </Text>
            <Text>
              <strong>Expiry Date:</strong>{' '}
              {new Date(subscription.expiryDate).toLocaleDateString()}
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  );
} 