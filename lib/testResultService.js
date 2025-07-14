import { db } from './firebaseConfig';
import {collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp} from 'firebase/firestore';

/**
 * Saves a test result for a user to Firestore.
 * Uses the path: users/{userId}/testResults/{resultId}
 * @param {string} userId The UID of the user.
 * @param {object} resultData The test result data to save.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export const saveTestResult = async (userId, resultData) => {
  if (!userId) {
    console.error("User ID is required to save test result.");
    return false;
  }
  if (!resultData || !resultData.testId) {
    console.error("Invalid result data provided for saving.");
    return false;
  }

  try {
    // Use testId as the document ID!
    const resultDocRef = doc(db, 'users', userId, 'testResults', resultData.testId);
    await setDoc(resultDocRef, {
      ...resultData,
      createdAt: serverTimestamp(),
    });
    console.log(`Test result for user ${userId}, test ${resultData.testId} saved successfully.`);
    return true;
  } catch (error) {
    console.error("Error saving test result:", error);
    return false;
  }
};

/**
 * Fetches a specific test result for a user from Firestore based on testId and courseId.
 * @param {string} userId The UID of the user.
 * @param {string} testId The ID of the test.
 * @param {string} courseId The ID of the course the test belongs to.
 * @returns {Promise<object|null>} The test result data, or null if not found.
 */
export const getTestResult = async (userId, testId) => {
  if (!userId || !testId) {
    console.error("User ID, Test ID are required to fetch test result.");
    return null;
  }

  try {
    // Fetch directly by document ID (testId)
    const resultDocRef = doc(db, 'users', userId, 'testResults', testId);
    const resultSnap = await getDoc(resultDocRef);
    if (resultSnap.exists()) {
      return { id: resultSnap.id, ...resultSnap.data() };
    } else {
      console.log(`No test result found for user ${userId}, test ${testId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching specific test result:", error);
    throw error;
  }
};

/**
 * Fetches all test results for a user from Firestore.
 * This is similar to your existing getUserTestResults but uses the new path.
 * @param {string} userId The UID of the user.
 * @returns {Promise<Array<object>>} An array of test result data.
 */
export const getAllTestResults = async (userId) => {
  if (!userId) {
    console.error("User ID is required to fetch all test results.");
    return [];
  }

  try {
    const userResultsCollectionRef = collection(db, 'users', userId, 'testResults');
    const q = query(userResultsCollectionRef, orderBy("createdAt", "desc"));
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
    console.error("Error fetching all test results:", error);
    throw error;
  }
};

/**
 * Get test result statistics for a specific test for a user.
 * (Your existing function, adapted to the new path)
 * @param {string} userId The UID of the user.
 * @param {string} testId The ID of the test.
 * @returns {Promise<object>} Statistics including attempts, best score, average score, and history.
 */
export async function getTestStats(userId, testId) {
  if (!userId || !testId) {
    console.error("User ID and Test ID are required to get test stats.");
    return { attempts: 0, bestScore: 0, averageScore: 0, history: [] };
  }

  try {
    const resultsRef = collection(db, "users", userId, "testResults"); // Adapted path
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
      Math.max(max, (result.score / result.totalQuestions) * 100), 0);
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
