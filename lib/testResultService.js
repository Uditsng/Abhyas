import { db } from './firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';

// Save test result
export async function saveTestResult(userId, result) {
  try {
    const resultId = `${result.courseId}_${result.testId}_${Date.now()}`;
    await setDoc(doc(db, "testResults", userId, "results", resultId), {
      ...result,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving test result:', error);
    return false;
  }
}

// Get user's test results
export async function getUserTestResults(userId) {
  try {
    const resultsRef = collection(db, "testResults", userId, "results");
    const q = query(resultsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return results;
  } catch (error) {
    console.error('Error getting test results:', error);
    return [];
  }
}

// Get test result statistics
export async function getTestStats(userId, testId) {
  try {
    const resultsRef = collection(db, "testResults", userId, "results");
    const q = query(
      resultsRef, 
      where("testId", "==", testId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });
    
    // Calculate statistics
    const attempts = results.length;
    const bestScore = results.reduce((max, result) => 
      Math.max(max, result.score / result.totalQuestions * 100), 0);
    const averageScore = results.reduce((sum, result) => 
      sum + (result.score / result.totalQuestions * 100), 0) / (attempts || 1);
    
    return {
      attempts,
      bestScore,
      averageScore,
      history: results
    };
  } catch (error) {
    console.error('Error getting test stats:', error);
    return { attempts: 0, bestScore: 0, averageScore: 0, history: [] };
  }
}