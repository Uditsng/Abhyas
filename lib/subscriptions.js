import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const subscriptionPlans = [
  {
    id: 'base',
    name: 'Base Plan',
    price: 5, // Price in USD
    duration: '1 month', // Duration of the subscription
    tests: ['General Knowledge Test', 'Mathematics Fundamentals'], // Associated tests
    features: [
      'Access to basic test series',
      'Limited practice questions',
      'Basic performance analytics',
      'Email support'
    ],
    maxTestsPerMonth: 5,
    trialPeriod: 7, // days
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 10,
    duration: '3 months',
    tests: ['Science Quiz', 'English Grammar Test'],
    features: [
      'All Base Plan features',
      'Access to standard test series',
      'Unlimited practice questions',
      'Detailed performance analytics',
      'Priority email support',
      'Study materials access'
    ],
    maxTestsPerMonth: 15,
    trialPeriod: 14, // days
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 20,
    duration: '6 months',
    tests: ['Advanced Mathematics', 'Physics Quiz', 'History Quiz'],
    features: [
      'All Standard Plan features',
      'Access to all test series',
      'Live doubt solving sessions',
      'Personal mentor support',
      'Custom study plans',
      'Offline test access',
      'Early access to new features'
    ],
    maxTestsPerMonth: 'Unlimited',
    trialPeriod: 30, // days
  },
];

// Subscription status types
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  TRIAL: 'trial',
  PENDING: 'pending'
};

// Helper functions for subscription management
export const getSubscriptionDetails = async (userId) => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      return null;
    }

    const subscription = subscriptionDoc.data();
    const plan = subscriptionPlans.find(p => p.id === subscription.planId);
    
    return {
      ...subscription,
      plan,
      isActive: subscription.status === SUBSCRIPTION_STATUS.ACTIVE,
      isTrial: subscription.status === SUBSCRIPTION_STATUS.TRIAL,
      daysRemaining: calculateDaysRemaining(subscription.expiryDate)
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
};

export const calculateDaysRemaining = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const canAccessTest = async (userId, testId) => {
  const subscription = await getSubscriptionDetails(userId);
  
  if (!subscription) {
    return false;
  }

  if (subscription.status === SUBSCRIPTION_STATUS.TRIAL) {
    return true;
  }

  if (subscription.status !== SUBSCRIPTION_STATUS.ACTIVE) {
    return false;
  }

  const plan = subscription.plan;
  return plan.tests.includes(testId) || plan.maxTestsPerMonth === 'Unlimited';
};

export const getSubscriptionBenefits = (planId) => {
  const plan = subscriptionPlans.find(p => p.id === planId);
  return plan ? plan.features : [];
};