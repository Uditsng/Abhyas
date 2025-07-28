'use client';

import { useState, useEffect } from 'react';
import { Box, Input, InputGroup, InputLeftElement, SimpleGrid, Spinner, Center, Text, Container } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BundleCard from '@/components/BundleCard';
import SectionHeader from '@/components/SectionHeader';
import { getBundlesByIds } from '@/lib/bundleService';
import { auth, db } from '@/lib/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';


export default function MyPurchasedBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchUserBundles = async () => {
      if(!user) return 

      try {
        //1 get purchased bundle IDs from user doc
        const userDocRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userDocRef)
        const userData = userSnap.exists()? userSnap.data() : null;

        const bundleIds = userData?.purchasedBundles || [];

        //2 Fetch bundle details
        const bundleData = await getBundlesByIds(bundleIds); 
        setBundles(bundleData);
      } catch (error) {
        console.error('Error fetching purchased Bundles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBundles();
  }, [user]); 

  const filteredBundles = bundles.filter(bundle =>
    bundle.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
        <Text ml={4}>Loading your bundles...</Text>
      </Center>
    );
  }

  return (
    <Box pt={24} mb={24}>
      <Container maxW="container.xl" py={4}>
      <SectionHeader title="Explore Bundles" />
      
      {/* Search and Bundles List (existing UI) */}
      <Box mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search bundles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
            _dark={{ bg: "gray.700" }}
          />
        </InputGroup>
      </Box>

      {filteredBundles.length === 0 && !loading ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="xl" color="gray.500">No bundles found matching your search.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
          {filteredBundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
            />
          ))}
        </SimpleGrid>
      )}
    
    </Container>
  </Box>
);
}