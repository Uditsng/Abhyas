import { useEffect, useState } from 'react';
import { getAllTestResults } from '../lib/testResultService';
import { db } from '@/lib/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

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

    const fetchResultsWithTitles = async () =>{
      try{
        setLoading(true)
        const testResults = await getAllTestResults(uid)

        const enriched = await Promise.all(
          testResults.map(async (result)=>{
            const testRef = doc(db,'tests', result.testId)
            const testSnap = await getDoc(testRef)
            const testData = testSnap.exists() ? testSnap.data() : {};
            return{
              ...result,
              title: testData.title || "Untitled Test",
            }
          })
        )
        setResults(enriched)
        setError(null)
      }catch(err){
        console.error("Error in useUserTestResults:", err)
        setResults([])
        setError(err.message)
      }finally{
        setLoading(false)
      }
    }
    fetchResultsWithTitles()
  }, [uid])

  return{results, loading, error}
}
  