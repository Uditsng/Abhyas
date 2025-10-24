
// app/(user)/my-purchases/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { Box, Input, InputGroup, InputLeftElement, SimpleGrid, Spinner, Center, Text, Container, useToast } from '@chakra-ui/react';
import { SearchIcon,StarIcon } from '@chakra-ui/icons';
import BundleCard from '@/components/BundleCard';
import PackageCard from '@/components/PackageCard'; 
import SectionHeader from '@/components/SectionHeader';
import { getBundlesByIds } from '@/lib/bundleService';
import { getPackagesByIds } from '@/lib/packageService'; 
import { auth, db } from '@/lib/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { submitRating, getUserRating } from '@/lib/ratingService';

//Star Rating Component
const StarRating = ({ itemId, itemType, userId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isRated, setIsRated] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchRating = async () => {
      const userRating = await getUserRating({ userId, itemId, itemType });
      if (userRating) {
        setRating(userRating);
        setIsRated(true);
      }
    };
    fetchRating();
  }, [userId, itemId, itemType]);

  const handleClick = async (newRating) => {
    try {
      await submitRating({ userId, itemId, itemType, rating: newRating });
      setRating(newRating);
      setIsRated(true);
      toast({
        title: "Rating submitted!",
        description: `You rated this ${itemType} ${newRating} stars.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast({
        title: "Rating failed",
        description: "Could not submit your rating. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  return (
    <div className="flex items-center justify-center space-x-1 mt-2 pb-4">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={ratingValue}
            onClick={() => handleClick(ratingValue)}
            onMouseEnter={() =>setHover(ratingValue)}
            onMouseLeave={() =>setHover(0)}
            className="transition-colors cursor-pointer"
          >
            <StarIcon
              boxSize={5}
              color={ratingValue <= (hover || rating) ? "yellow.400" : "gray.300"}
            />
          </button>
        );
      })}
    </div>
  );
};

export default function MyPurchasesPage() {

  const [purchasedItems, setPurchasedItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, authLoading] = useAuthState(auth);
  const toast = useToast();

    useEffect(() => {
    const fetchUserPurchases = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        const bundleIds = userData?.purchasedBundles || [];
        const packageIds = userData?.purchasedPackages || [];

        // Fetch details for bundles and packages in parallel
        const [bundleData, packageData] = await Promise.all([
          bundleIds.length > 0 ? getBundlesByIds(bundleIds) : [],
          packageIds.length > 0 ? getPackagesByIds(packageIds) : [],
        ]);

        // After getting all purchased IDs, fetch all associated orders.
        let allOrders = [];
        const allPurchasedIds = [...bundleIds, ...packageIds];

        if (allPurchasedIds.length > 0) {
            // We fetch all orders for the user and then filter them client-side,
            // as Firestore doesn't easily support querying by two different array fields (bundleId or packageId).
            const ordersQuery = query(
                collection(db, 'orders'),
                where('userId', '==', user.uid)
            );
            const ordersSnapshot = await getDocs(ordersQuery);
            
            // Filter the orders to only include those for the items the user has purchased
            allOrders = ordersSnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter(order => allPurchasedIds.includes(order.bundleId) || allPurchasedIds.includes(order.packageId));
            
            setOrders(allOrders); // Populate the orders state
        }
        

        const bundlesWithType = bundleData.map(b => ({ ...b, itemType: 'bundle' }));
        const packagesWithType = packageData.map(p => ({ ...p, itemType: 'package' }));

        setPurchasedItems([...bundlesWithType, ...packagesWithType]);
      } catch (error) {
        console.error('Error fetching purchased items:', error);
        toast({
          title: "Error",
          description: "Could not fetch your purchased items.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserPurchases();
    }
  }, [user, authLoading, toast]);

  // filtering logic to check both title (for bundles) and name (for packages)
  const filteredItems = purchasedItems.filter((item) =>
    (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
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

        <SectionHeader title="My Purchases" />

        <Box mb={6}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search your purchased items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
              _dark={{ bg: 'gray.700' }}
            />
          </InputGroup>
        </Box>

        {filteredItems.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="xl" color="gray.500">
              You haven't purchased any items yet.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            
            {filteredItems.map((item) => {
              if (item.itemType === 'package') {
                const orderForPackage = orders.find(o => o.packageId === item.id);
                return (
                  <div key={item.id}>
                  <PackageCard
                    // key={item.id}
                    pkg={item}
                    isPurchased={true} 
                    showInvoiceButton={true}
                    order={orderForPackage}
                  />
                  <StarRating itemId={item.id} itemType="package" userId={user.uid} />
                </div>
                );
              } else { 
                const orderForBundle = orders.find(o => o.bundleId === item.id);
                return (
            <div key={item.id} className="pb-12">      
                  <BundleCard
                    // key={item.id}
                    bundle={item}
                    showInvoiceButton={true}
                    order={orderForBundle}
                  />
                  <StarRating itemId={item.id} itemType="bundle" userId={user.uid} />
                  </div>
                );
              }
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}