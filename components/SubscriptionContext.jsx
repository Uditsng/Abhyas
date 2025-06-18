'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getSubscriptionDetails, 
  SUBSCRIPTION_STATUS,
  subscriptionPlans 
} from '@/lib/subscriptions';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const subscriptionData = await getSubscriptionDetails(user.uid);
        setSubscription(subscriptionData);
        setError(null);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const value = {
    subscription,
    loading,
    error,
    isSubscribed: subscription?.status === SUBSCRIPTION_STATUS.ACTIVE,
    isTrial: subscription?.status === SUBSCRIPTION_STATUS.TRIAL,
    daysRemaining: subscription?.daysRemaining || 0,
    plan: subscription?.plan,
    refreshSubscription: async () => {
      if (user) {
        const subscriptionData = await getSubscriptionDetails(user.uid);
        setSubscription(subscriptionData);
      }
    }
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 