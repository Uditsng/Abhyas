// // components/TestResultsList.jsx
// import {
//   Box,
//   Text,
//   SimpleGrid,
//   Badge,
//   Skeleton,
//   useColorModeValue,
// } from "@chakra-ui/react";

// export default function TestResultsList({ results, loading, error }) {
//   const bg = useColorModeValue("white", "gray.800");
//   const cardBorder = useColorModeValue("gray.200", "gray.700");

//   if (loading) {
//     return (
//       <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={4}>
//         {[...Array(5)].map((_, idx) => (
//           <Skeleton key={idx} height="120px" borderRadius="lg" />
//         ))}
//       </SimpleGrid>
//     );
//   }

//   if (error) {
//     return <Text color="red.500">Error loading results: {error}</Text>;
//   }

//   if (!results || results.length === 0) {
//     return <Text>No tests taken yet.</Text>;
//   }

//   return (
//     <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={4}>
//       {results.slice(0, 5).map((test) => (
//         <Box
//           key={test.testId}
//           p={4}
//           rounded="xl"
//           shadow="md"
//           bg={bg}
//           border="1px solid"
//           borderColor={cardBorder}
//           backdropFilter="blur(8px)"
//           transition="all 0.3s ease"
//           _hover={{ transform: "scale(1.02)", shadow: "lg" }}
//         >
//           <Text fontSize="md" fontWeight="semibold" isTruncated>
//             {test.title}
//           </Text>

//           <Text fontSize="sm" mt={2}>
//             Score: <strong>{test.score}</strong>
//           </Text>

//           <Text fontSize="sm" mt={1} color="gray.500">
//             {new Date(test.date).toLocaleDateString()}
//           </Text>

//           <Badge
//             mt={2}
//             colorScheme={test.score >= 50 ? "green" : "red"}
//             variant="subtle"
//           >
//             {test.score >= 50 ? "Passed" : "Needs Improvement"}
//           </Badge>
//         </Box>
//       ))}
//     </SimpleGrid>
//   );
// }


"use client";

import React from "react";

export default function TestResultsList({ results, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, idx) => (
          <div
            key={idx}
            className="h-[120px] rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-600 dark:text-red-400">
        Error loading results: {error}
      </p>
    );
  }

  if (!results || results.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-400">No tests taken yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {results.slice(0, 5).map((test) => (
        <div
          key={test.testId}
          className="p-4 rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
        >
          <p className="text-base font-semibold truncate">{test.title}</p>

          <p className="text-sm mt-2">
            Score: <strong>{test.score}</strong>
          </p>

          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
            {new Date(test.date).toLocaleDateString()}
          </p>

          <span
            className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded bg-opacity-10 ${
              test.score >= 50
                ? "text-green-600 bg-green-600"
                : "text-red-600 bg-red-600"
            }`}
          >
            {test.score >= 50 ? "Passed" : "Needs Improvement"}
          </span>
        </div>
      ))}
    </div>
  );
}
