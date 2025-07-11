import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

export default function useRealtimeUserData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;
    const userRef = ref(db, `users/${uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      }
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
