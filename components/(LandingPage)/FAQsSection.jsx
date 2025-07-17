import { Box, Heading, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, useColorModeValue } from '@chakra-ui/react';

const faqs = [
  {
    q: 'How do I register for mock tests?',
    a: 'Simply sign up for a free account and start attempting available mock tests from your dashboard.'
  },
  {
    q: 'Are the tests based on the latest exam pattern?',
    a: 'Yes, all our tests are regularly updated to match the latest exam patterns and syllabi.'
  },
  {
    q: 'Can I access the platform on mobile?',
    a: 'Absolutely! Our platform is mobile-friendly and our app is coming soon to Play Store and App Store.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major credit/debit cards, UPI, and net banking for paid plans.'
  },
  {
    q: 'How can I become a teacher or partner?',
    a: 'Click the "Become a Teacher / Partner" button above and follow the onboarding process.'
  },
];

export default function FAQsSection() {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('border-gray-200', 'border-gray-700');

  return (
    <Box className="mb-12" maxW="3xl" mx="auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">❓ Frequently Asked Questions</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Got questions? We’ve got answers.</p>
      </div>
      <Accordion allowMultiple bg={bg} borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor={border}>
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx}>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="semibold">
                {faq.q}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} color="gray.600" _dark={{ color: 'gray.300' }}>
              {faq.a}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
} 