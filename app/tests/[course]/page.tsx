import { testSeries } from '@/lib/tests';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function CourseTestsPage({ params }: { params: { course: string } }) {
  const courseTests = testSeries[params.course];

  if (!courseTests) {
    return notFound(); // invalid courseId
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tests for {params.course.toUpperCase()}</h2>
      <div className="space-y-4">
        {courseTests.map((test) => (
          <div
            key={test.id}
            className="border p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">{test.title}</h3>
            <p className="text-sm text-gray-600">
              Duration: {test.duration} mins | Questions: {test.totalQuestions}
            </p>
            <Link href={`/tests/${params.course}/${test.id}`}>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Start Test
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
