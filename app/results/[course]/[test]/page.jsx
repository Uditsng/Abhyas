'use client';

import { useParams } from 'next/navigation';
import { testSeries } from '@/lib/tests'; // taking test data from tests.js

export default function ResultPage() {
  const { course, test } = useParams();
  const courseTests = testSeries[course];
  const testData = courseTests?.find((t) => t.id === test);

  // Dummy answers
  const submittedAnswers = {
    // q1: 'Delhi',
    // q2: '12',
  };
  
  // if tst is not found
  if (!testData) {
    return <div className="p-6 text-red-600">Result not found.</div>;
  }
  
  // calculate total correct answers
  const totalCorrect = testData.questions.reduce((score, {id, answer}) => {
    //check if user's ans matches the correct ans
    return submittedAnswers[id] === answer ? score + 1 : score;
  }, 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{testData.title} - Results</h2>

      <div className="mb-6">
        <p className="text-lg font-semibold">
          Your Score: {totalCorrect} / {testData.totalQuestions}
        </p>
      </div>

      <div className="space-y-4">
        {testData.questions.map(({id, question, answer}, index) => {

          //get the user's ans for the current ques
          const userAnswer = submittedAnswers[id];
          
          //check if user's ans is correct
          const isCorrect = userAnswer === answer;

          return (
            <div key={id} className="border p-4 rounded bg-white shadow-sm">
              <p className="font-semibold">Q{index + 1}. {question}</p>
              <p>
                Your Answer:{' '}
                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                  {userAnswer || 'Not answered'}
                </span>
              </p>
              {!isCorrect && (
                <p className="text-blue-600"> Correct Answer: {answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}