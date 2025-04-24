'use client';

// app/tests/[course]/[test]/page.jsx
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { testSeries } from '@/lib/tests';

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams(); // grabs course + test ID from URL

  const courseId = Array.isArray(params.course) ? params.course[0] : params.course;
  const testId = Array.isArray(params.test) ? params.test[0] : params.test;

  // 🛠 Debug logs to help
  console.log('courseId:', courseId); // should be 'ssc-cgl'
  console.log('testId:', testId);     // should be 'mock1'

  const tests = testSeries[courseId] || [];
  const test = tests.find((t) => t.id === testId);

  const [answers, setAnswers] = useState({}); // stores selected answers

  if (!test) {
    return <div className="p-6 text-red-600">Test not found.</div>;
  }

  const handleOptionChange = (qId, selected) => {
    setAnswers((prev) => ({ ...prev, [qId]: selected }));
  };

  const handleSubmit = () => {
    console.log('Submitted answers:', answers);
    router.push(`/results/${courseId}/${testId}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{test.title}</h2>

      {test.questions.map((q, index) => (
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