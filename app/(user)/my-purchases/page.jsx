// app/(user)/my-purchases/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { Box, Input, InputGroup, InputLeftElement, SimpleGrid, Spinner, Center, Text, Container, useToast } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BundleCard from '@/components/BundleCard';
import SectionHeader from '@/components/SectionHeader';
import { getBundlesByIds } from '@/lib/bundleService';
import { auth, db } from '@/lib/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function MyPurchasedBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, authLoading] = useAuthState(auth);
  const toast = useToast();

  useEffect(() => {
    const fetchUserBundles = async () => {
      if (!user) {
          setLoading(false);
          return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        const userData = userSnap.exists() ? userSnap.data() : null;
        const bundleIds = userData?.purchasedBundles || [];

        if (bundleIds.length > 0) {
          const bundleData = await getBundlesByIds(bundleIds);
          setBundles(bundleData);

          const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            where('bundleId', 'in', bundleIds)
          );
          const ordersSnapshot = await getDocs(ordersQuery);
          const ordersData = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error fetching purchased Bundles:', error);
        toast({
            title: "Error",
            description: "Could not fetch your purchased bundles.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
        if (user) {
            fetchUserBundles();
        } else {
            setLoading(false);
        }
    }
  }, [user, authLoading, toast]);


  const filteredBundles = bundles.filter((bundle) =>
    bundle.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Center h="200px" pt={24}>
        <Spinner size="xl" />
        <Text ml={4}>Loading your purchases...</Text>
      </Center>
    );
  }

  return (
    <Box pt={24} mb={24}>
      <Container maxW="container.xl" py={4}>
        <SectionHeader title="My Purchased Bundles" />

        <Box mb={6}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search your purchased bundles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
              _dark={{ bg: 'gray.700' }}
            />
          </InputGroup>
        </Box>

        {filteredBundles.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="xl" color="gray.500">
              You haven't purchased any bundles yet.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {filteredBundles.map((bundle) => {
               const orderForBundle = orders.find(o => o.bundleId === bundle.id);
               return (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  showInvoiceButton={true}
                  order={orderForBundle}
                />
              )
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}

