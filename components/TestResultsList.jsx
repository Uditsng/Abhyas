import React from 'react';

export default function TestResultsList({ results, loading, error }) {
  if (loading) return <div>Loading test results...</div>;
  if (error) return <div>Error loading test results.</div>;
  if (!results || results.length === 0) return <div>No test results found.</div>;

  return (
    <div className="test-results-list">
      <ul>
        {results.map(result => (
          <li key={result.id}>
            <strong>{result.title}</strong> - Score: {result.score}/{result.totalQuestions} ({((result.score/result.totalQuestions)*100).toFixed(1)}%)
            <br />
            Date: {result.createdAt?.toDate ? result.createdAt.toDate().toLocaleString() : 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
} 