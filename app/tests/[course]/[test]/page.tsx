'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { testSeries } from '@/lib/tests';
import { Test } from '@/types/test';

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams();

  const courseId = params.course as string;
  const testId = params.test as string;

  const tests = testSeries[courseId];
  const test = tests?.find((t) => t.id === testId);

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  if (!test) {
    return <div className="p-6 text-red-600">Test not found.</div>;
  }

  const handleOptionChange = (qId: string, selected: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: selected }));
  };

  const handleSubmit = () => {
    console.log('Submitted answers:', answers);
    router.push(`/results/${courseId}/${testId}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{test.title}</h2>

      {test.questions.foreach((q, index) => (
        <div
          key={q.id}
          className="mb-6 border p-4 rounded-lg bg-white shadow-sm"
        >
          <p className="font-semibold mb-2">
            Q{index + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt) => (
              <label key={opt} className="block">
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => handleOptionChange(q.id, opt)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Submit Test
      </button>
    </div>
  );
}
