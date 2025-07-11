import { useEffect, useState } from 'react';
import { getAllTestResults } from '../lib/testResultService';

export default function useUserTestResults(uid) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getAllTestResults(uid)
      .then(data => {
        setResults(data);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [uid]);

  return { results, loading, error };
} 