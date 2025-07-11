import { useEffect, useState } from 'react';
import { getUserProfile } from '../lib/userService';

export default function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserProfile(uid)
      .then(data => {
        setProfile(data);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [uid]);

  return { profile, loading, error };
} 