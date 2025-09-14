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

// 'use client';

// import { useState, useEffect } from 'react';
// import { FiSearch, FiArchive } from 'react-icons/fi';
// import BundleCard from '@/components/BundleCard';
// import PackageCard from '@/components/PackageCard';
// import SectionHeader from '@/components/SectionHeader';
// import { getBundlesByIds } from '@/lib/bundleService';
// import { getPackageById } from '@/lib/packageService';
// import { auth, db } from '@/lib/firebaseConfig';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { doc, getDoc } from 'firebase/firestore';

// export default function MyPurchasedItemsPage() {
//   const [purchasedItems, setPurchasedItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [user, authLoading] = useAuthState(auth);

//   useEffect(() => {
//     const fetchUserPurchases = async () => {
//       if (!user) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const userDocRef = doc(db, 'users', user.uid);
//         const userSnap = await getDoc(userDocRef);
//         const userData = userSnap.exists() ? userSnap.data() : {};
        
//         const packageIds = userData.purchasedPackages || [];
//         const bundleIds = userData.purchasedBundles || [];

//         const packagePromises = packageIds.map(id => getPackageById(id).then(pkg => (pkg ? { ...pkg, itemType: 'package' } : null)));
//         const bundlePromises = getBundlesByIds(bundleIds).then(bundles => bundles.map(b => ({ ...b, itemType: 'bundle' })));

//         const [packages, bundles] = await Promise.all([
//           Promise.all(packagePromises),
//           bundlePromises
//         ]);
        
//         const validPackages = packages.filter(Boolean);

//         const bundleIdsInPackages = new Set(validPackages.flatMap(p => p.bundleIds || []));
//         const individualBundles = bundles.filter(b => !bundleIdsInPackages.has(b.id));

//         const allItems = [...validPackages, ...individualBundles];
//         setPurchasedItems(allItems);

//       } catch (error) {
//         console.error('Error fetching purchased items:', error);
//         alert("Could not fetch your purchases. Please try refreshing the page.");
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     if (!authLoading && user) {
//         fetchUserPurchases();
//     } else if (!authLoading && !user) {
//         setLoading(false);
//     }
//   }, [user, authLoading]);

//   const filteredItems = purchasedItems.filter((item) =>
//     (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading || authLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen pt-20">
//         <p className="text-gray-500 dark:text-gray-400">Loading your purchases...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
//       <div className="container mx-auto px-4 py-4">
//         <SectionHeader title="My Purchases" subtitle="All your purchased packages and bundles in one place." />

//         <div className="mb-8 max-w-lg mx-auto">
//           <div className="relative">
//             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//               <FiSearch className="text-gray-400" />
//             </span>
//             <input
//               type="text"
//               placeholder="Search your purchases..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {filteredItems.length === 0 ? (
//           <div className="text-center py-16">
//             <FiArchive size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
//             <p className="mt-4 text-gray-500 dark:text-gray-400">
//               You haven't purchased any items yet.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {filteredItems.map((item) => {
//               if (item.itemType === 'package') {
//                 return <PackageCard key={item.id} pkg={item} isPurchased={true} />;
//               } else {
//                 // You might want a similar isPurchased prop for BundleCard in the future
//                 return <BundleCard key={item.id} bundle={item} />;
//               }
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }