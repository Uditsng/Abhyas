'use client';

//Admin Panel: page.jsx and subfolders for managing users and tests.

import { Box, Heading, SimpleGrid, Card, CardBody, Text, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';

export default function AdminDashboard() {
  return (
    <Box>
      <Heading mb={6}>Admin Dashboard</Heading>
      
      {/* Simple stats cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Users</StatLabel>
              <StatNumber>1,024</StatNumber>
              <StatHelpText>↑ 12% from last month</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Tests</StatLabel>
              <StatNumber>42</StatNumber>
              <StatHelpText>↑ 5 new this week</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Questions</StatLabel>
              <StatNumber>2,580</StatNumber>
              <StatHelpText>Across all tests</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Test Attempts</StatLabel>
              <StatNumber>3,712</StatNumber>
              <StatHelpText>This month</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      <Box bg="white" p={6} borderRadius="md" shadow="sm" className="dark:bg-gray-800">
        <Heading size="md" mb={4}>Getting Started</Heading>
        <Text mb={3}>Welcome to the admin dashboard! Here you can manage your mock test application.</Text>
        <Text mb={3}>To get started, you can:</Text>
        <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
          <li>Create and manage tests</li>
          <li>Add questions to the question bank</li>
          <li>View user statistics</li>
          <li>Monitor test performance</li>
        </ul>
        <Text>Select an option from the sidebar to begin.</Text>
      </Box>
    </Box>
  );
}