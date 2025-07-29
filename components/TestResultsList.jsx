// components/TestResultsList.jsx
import {
  Box,
  Text,
  SimpleGrid,
  Badge,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";

export default function TestResultsList({ results, loading, error }) {
  const bg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={4}>
        {[...Array(5)].map((_, idx) => (
          <Skeleton key={idx} height="120px" borderRadius="lg" />
        ))}
      </SimpleGrid>
    );
  }

  if (error) {
    return <Text color="red.500">Error loading results: {error}</Text>;
  }

  if (!results || results.length === 0) {
    return <Text>No tests taken yet.</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={4}>
      {results.slice(0, 5).map((test) => (
        <Box
          key={test.testId}
          p={4}
          rounded="xl"
          shadow="md"
          bg={bg}
          border="1px solid"
          borderColor={cardBorder}
          backdropFilter="blur(8px)"
          transition="all 0.3s ease"
          _hover={{ transform: "scale(1.02)", shadow: "lg" }}
        >
          <Text fontSize="md" fontWeight="semibold" isTruncated>
            {test.title}
          </Text>

          <Text fontSize="sm" mt={2}>
            Score: <strong>{test.score}</strong>
          </Text>

          <Text fontSize="sm" mt={1} color="gray.500">
            {new Date(test.date).toLocaleDateString()}
          </Text>

          <Badge
            mt={2}
            colorScheme={test.score >= 50 ? "green" : "red"}
            variant="subtle"
          >
            {test.score >= 50 ? "Passed" : "Needs Improvement"}
          </Badge>
        </Box>
      ))}
    </SimpleGrid>
  );
}
