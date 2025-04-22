import { Test } from '@/types/test';

export const testSeries = {
  'ssc-cgl': [
    {
      id: 'mock1',
      title: 'SSC CGL Tier I - Mock Test 1',
      duration: 60,
      totalQuestions: 2,
      questions: [
        {
          id: 'q1',
          question: 'What is the capital of India?',
          options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
          answer: 'Delhi',
        },
        {
          id: 'q2',
          question: '5 + 7 = ?',
          options: ['10', '11', '12', '13'],
          answer: '12',
        },
      ],
    },
    {
      id: 'mock2',
      title: 'SSC CGL Tier I - Mock Test 2',
      duration: 60,
      totalQuestions: 2,
      questions: [
        {
          id: 'q1',
          question: 'Largest continent?',
          options: ['Africa', 'Asia', 'Europe', 'Australia'],
          answer: 'Asia',
        },
        {
          id: 'q2',
          question: '2 × 3 = ?',
          options: ['5', '6', '7', '8'],
          answer: '6',
        },
      ],
    },
  ],
}