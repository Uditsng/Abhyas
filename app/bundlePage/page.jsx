'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Input, InputGroup, InputLeftElement, SimpleGrid, Spinner, Center, Text, Container } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BundleCard from '@/components/BundleCard';
import SectionHeader from '@/components/SectionHeader';
import { getAllBundles } from '@/lib/bundleService'; 


export default function BundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const fetchedBundles = await getAllBundles(); 
        setBundles(fetchedBundles);
      } catch (error) {
        console.error('Error fetching Bundles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []); // Empty dependency array means this runs once on mount

  const filteredBundles = bundles.filter(bundle =>
    bundle.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
        <Text ml={4}>Loading bundles...</Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
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
  );
}
